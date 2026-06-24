const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const audioFilter = (req, file, cb) => {
  const allowed = ['.mp3', '.flac', '.ogg', '.m4a', '.aac', '.wav'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only audio files allowed'), false);
};

const maxSize = (process.env.MAX_FILE_SIZE_MB || 50) * 1024 * 1024;

const uploadFields = multer({
  storage,
  limits: { fileSize: maxSize }
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);

module.exports = { uploadFields };
