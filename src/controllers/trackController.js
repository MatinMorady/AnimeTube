const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

exports.getTracks = async (req, res) => {
  try {
    const { search, type, anime_id, sort = 'newest', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = ['t.is_active = true'];

    if (search) {
      params.push(`%${search}%`);
      where.push(`(t.title ILIKE $${params.length} OR t.artist ILIKE $${params.length} OR a.title ILIKE $${params.length})`);
    }
    if (type) { params.push(type); where.push(`t.type = $${params.length}`); }
    if (anime_id) { params.push(anime_id); where.push(`t.anime_id = $${params.length}`); }

    const orderMap = {
      newest: 't.created_at DESC',
      oldest: 't.created_at ASC',
      popular: 't.download_count DESC',
      title: 't.title ASC'
    };
    const order = orderMap[sort] || orderMap.newest;
    const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tracks t LEFT JOIN anime_series a ON t.anime_id = a.id ${whereSQL}`,
      params
    );

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT t.*, a.title as anime_title, u.username as uploader
       FROM tracks t
       LEFT JOIN anime_series a ON t.anime_id = a.id
       LEFT JOIN users u ON t.uploaded_by = u.id
       ${whereSQL}
       ORDER BY ${order}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      tracks: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTrack = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, a.title as anime_title, u.username as uploader
       FROM tracks t
       LEFT JOIN anime_series a ON t.anime_id = a.id
       LEFT JOIN users u ON t.uploaded_by = u.id
       WHERE t.id = $1 AND t.is_active = true`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Track not found' });
    res.json({ track: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadTrack = async (req, res) => {
  try {
    const { title, artist, anime_id, type, episode_info } = req.body;
    if (!title || !req.files?.audio)
      return res.status(400).json({ error: 'Title and audio file required' });

    const audioFile = req.files.audio[0];
    const coverFile = req.files?.cover?.[0];

    const fileUrl = `/uploads/${audioFile.filename}`;
    const coverUrl = coverFile ? `/uploads/${coverFile.filename}` : null;

    const result = await pool.query(
      `INSERT INTO tracks (title, artist, anime_id, type, episode_info, file_url, file_name, file_size, cover_url, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [title, artist, anime_id || null, type || 'other', episode_info,
       fileUrl, audioFile.originalname, audioFile.size, coverUrl, req.user.id]
    );
    res.status(201).json({ track: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTrack = async (req, res) => {
  try {
    const { title, artist, anime_id, type, episode_info, is_active } = req.body;
    const result = await pool.query(
      `UPDATE tracks SET title=$1, artist=$2, anime_id=$3, type=$4,
       episode_info=$5, is_active=$6 WHERE id=$7 RETURNING *`,
      [title, artist, anime_id || null, type, episode_info, is_active !== false, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Track not found' });
    res.json({ track: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tracks WHERE id=$1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Track not found' });

    const track = result.rows[0];
    const filePath = path.join(__dirname, '../../', track.file_url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (track.cover_url) {
      const coverPath = path.join(__dirname, '../../', track.cover_url);
      if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    }

    await pool.query('DELETE FROM tracks WHERE id=$1', [req.params.id]);
    res.json({ message: 'Track deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.downloadTrack = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tracks WHERE id=$1 AND is_active=true', [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Track not found' });

    const track = result.rows[0];
    const filePath = path.join(__dirname, '../../', track.file_url);

    if (!fs.existsSync(filePath))
      return res.status(404).json({ error: 'File not found on server' });

    await pool.query(
      'INSERT INTO download_logs (track_id, user_id, ip_address) VALUES ($1,$2,$3)',
      [track.id, req.user?.id || null, req.ip]
    );
    await pool.query(
      'UPDATE tracks SET download_count = download_count + 1 WHERE id=$1', [track.id]
    );

    res.download(filePath, track.file_name);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [tracks, users, downloads] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tracks WHERE is_active=true'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COALESCE(SUM(download_count),0) as total FROM tracks')
    ]);
    res.json({
      totalTracks: parseInt(tracks.rows[0].count),
      totalUsers: parseInt(users.rows[0].count),
      totalDownloads: parseInt(downloads.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
