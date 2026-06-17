const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  res.json({ status: "AnimeTube running" });
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    file: req.file.filename,
    url: "/uploads/" + req.file.filename
  });
});

app.use("/uploads", express.static("uploads"));

app.get("/files", (req, res) => {
  res.json(fs.readdirSync(uploadDir));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("running"));