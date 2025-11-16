const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Disk storage to get file paths for Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '..', 'uploads');
    // Ensure the uploads directory exists to avoid ENOENT errors
    fs.mkdir(dest, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, dest);
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image uploads are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = { upload };