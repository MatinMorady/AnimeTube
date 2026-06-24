const pool = require('../config/database');

exports.getAnimeSeries = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `SELECT a.*, COUNT(t.id) as track_count
                 FROM anime_series a
                 LEFT JOIN tracks t ON a.id = t.anime_id AND t.is_active=true`;
    const params = [];
    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE a.title ILIKE $1 OR a.title_japanese ILIKE $1`;
    }
    query += ` GROUP BY a.id ORDER BY a.title ASC`;
    const result = await pool.query(query, params);
    res.json({ series: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAnime = async (req, res) => {
  try {
    const [anime, tracks] = await Promise.all([
      pool.query('SELECT * FROM anime_series WHERE id=$1', [req.params.id]),
      pool.query(
        `SELECT * FROM tracks WHERE anime_id=$1 AND is_active=true ORDER BY type, created_at DESC`,
        [req.params.id]
      )
    ]);
    if (!anime.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ anime: anime.rows[0], tracks: tracks.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createAnime = async (req, res) => {
  try {
    const { title, title_japanese, description, cover_url, year, genre } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const result = await pool.query(
      `INSERT INTO anime_series (title, title_japanese, description, cover_url, year, genre)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, title_japanese, description, cover_url, year, genre]
    );
    res.status(201).json({ anime: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateAnime = async (req, res) => {
  try {
    const { title, title_japanese, description, cover_url, year, genre } = req.body;
    const result = await pool.query(
      `UPDATE anime_series SET title=$1, title_japanese=$2, description=$3,
       cover_url=$4, year=$5, genre=$6 WHERE id=$7 RETURNING *`,
      [title, title_japanese, description, cover_url, year, genre, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ anime: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteAnime = async (req, res) => {
  try {
    await pool.query('DELETE FROM anime_series WHERE id=$1', [req.params.id]);
    res.json({ message: 'Anime series deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
