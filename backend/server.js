const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// خواندن دیتابیس کاربران
function loadUsers() {
  return JSON.parse(fs.readFileSync("users.json", "utf8"));
}

// ذخیره کاربران
function saveUsers(data) {
  fs.writeFileSync("users.json", JSON.stringify(data, null, 2));
}

// خواندن دیتابیس ویدیوها
function loadVideos() {
  return JSON.parse(fs.readFileSync("videos.json", "utf8"));
}

// ذخیره ویدیوها
function saveVideos(data) {
  fs.writeFileSync("videos.json", JSON.stringify(data, null, 2));
}

// ثبت‌نام
app.post("/register", (req, res) => {
  const users = loadUsers();
  const { username, password } = req.body;

  if (users.find(u => u.username === username)) {
    return res.json({ success: false, message: "این نام کاربری وجود دارد" });
  }

  users.push({ username, password });
  saveUsers(users);

  res.json({ success: true });
});

// ورود
app.post("/login", (req, res) => {
  const users = loadUsers();
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.json({ success: false, message: "اطلاعات اشتباه است" });
  }

  res.json({ success: true });
});

// دریافت لیست ویدیوها
app.get("/videos", (req, res) => {
  const videos = loadVideos();
  res.json(videos);
});

// لایک کردن
app.post("/like", (req, res) => {
  const videos = loadVideos();
  const { id } = req.body;

  const video = videos.find(v => v.id === id);
  if (video) {
    video.likes++;
    saveVideos(videos);
  }

  res.json({ success: true });
});

// شروع سرور
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
