const pool = require('./database');
const bcrypt = require('bcryptjs');

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Anime series table
    await client.query(`
      CREATE TABLE IF NOT EXISTS anime_series (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        title_japanese VARCHAR(255),
        description TEXT,
        cover_url TEXT,
        year INTEGER,
        genre VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Tracks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tracks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        anime_id UUID REFERENCES anime_series(id) ON DELETE SET NULL,
        type VARCHAR(20) CHECK (type IN ('opening', 'ending', 'ost', 'insert', 'other')),
        episode_info VARCHAR(100),
        file_url TEXT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size BIGINT,
        duration INTEGER,
        cover_url TEXT,
        download_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Download logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS download_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        ip_address VARCHAR(45),
        downloaded_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Tags
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS track_tags (
        track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (track_id, tag_id)
      )
    `);

    // Likes
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (user_id, track_id)
      )
    `);

    // Indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tracks_anime ON tracks(anime_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tracks_type ON tracks(type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_tracks_active ON tracks(is_active)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_download_logs_track ON download_logs(track_id)`);

    // Create admin user if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@animemusicHub.com';
    const adminPass = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);

    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(adminPass, 12);
      await client.query(
        `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
        ['admin', adminEmail, hash]
      );
      console.log(`✅ Admin created: ${adminEmail}`);
    }

    await client.query('COMMIT');
    console.log('✅ Database initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ DB init error:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = initDB;
