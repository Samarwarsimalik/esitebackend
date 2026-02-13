// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Base uploads folder path
const baseUploadDir = path.join(__dirname, "..", "uploads");

// Ensure base uploads folder exists
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Ensure destination folder exists before saving
    if (!fs.existsSync(baseUploadDir)) {
      fs.mkdirSync(baseUploadDir, { recursive: true });
    }
    cb(null, baseUploadDir);
  },
  filename(req, file, cb) {
    // Create unique file name: timestamp + random number + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  },
});

// File filter to allow only images (jpg, jpeg, png, webp)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)"));
  }
};

// Multer upload instance with storage, filter, and size limits (5MB)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});


module.exports = upload;
