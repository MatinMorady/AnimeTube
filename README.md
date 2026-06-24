# 🎵 Anime Music Hub

A professional platform to upload and download anime music (openings, endings, OSTs).

## 🚀 Quick Deploy to Railway

### Step 1: Upload to GitHub
1. Go to [github.com](https://github.com) → New repository
2. Name it `anime-music-hub`
3. Upload all these files (keep the folder structure)

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `anime-music-hub` repo
4. Add a **PostgreSQL** database: click **New** → **Database** → **PostgreSQL**
5. Go to your app service → **Variables** tab → Add:
   ```
   JWT_SECRET=your_random_secret_here_make_it_long
   ADMIN_EMAIL=your@email.com
   ADMIN_PASSWORD=YourStrongPassword123
   NODE_ENV=production
   MAX_FILE_SIZE_MB=50
   ```
   > `DATABASE_URL` is added automatically by Railway

6. Click **Deploy** — your site will be live in ~2 minutes!

### Step 3: Login as Admin
- Visit your Railway URL
- Click **Sign In**
- Use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set above
- Click your avatar → **Admin Panel** to start uploading!

---

## 🎯 Features

- **Browse & Play** — Audio player with progress bar
- **Download** — One-click download for all tracks
- **Search & Filter** — By type (OP/ED/OST), anime, artist
- **Admin Panel** — Upload tracks, manage anime series
- **User Accounts** — Registration and login
- **Dark Anime Theme** — Beautiful purple/pink gradient design

## 📁 Project Structure

```
anime-music-hub/
├── src/
│   ├── app.js              # Main server
│   ├── config/
│   │   ├── database.js     # DB connection
│   │   └── init.js         # Schema & seed
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── trackController.js
│   │   └── animeController.js
│   ├── middleware/
│   │   ├── auth.js         # JWT middleware
│   │   └── upload.js       # File upload
│   └── routes/
│       ├── auth.js
│       ├── tracks.js
│       └── anime.js
├── public/
│   ├── index.html          # Single Page App
│   ├── css/style.css
│   └── js/app.js
├── uploads/                # Uploaded files
├── package.json
├── railway.toml
└── .env.example
```

## 🔧 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env
# Edit .env with your local PostgreSQL URL

# 3. Run dev server
npm run dev
```

## 🔐 Roles
- **admin** — Upload/delete tracks, manage anime
- **moderator** — Upload tracks, manage anime  
- **user** — Browse, stream, download

---

Built with Node.js, Express, PostgreSQL, and vanilla JS.
