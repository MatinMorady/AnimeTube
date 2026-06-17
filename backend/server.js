const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// ساخت پوشه uploads اگر نبود
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// تنظیم ذخیره فایل
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// سرو فایل‌ها
app.use("/uploads", express.static("uploads"));

// تست سرور
app.get("/", (req, res) => {
  res.json({ status: "AnimeTube API running" });
});

// آپلود فایل
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    message: "uploaded",
    file: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

// لیست فایل‌ها
app.get("/files", (req, res) => {
  const files = fs.readdirSync(uploadDir);
  res.json(files);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
