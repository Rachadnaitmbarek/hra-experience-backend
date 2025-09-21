const path = require("path");
const fs = require("fs");
const multer = require("multer");

const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "images");

    // create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // save with ISO-like timestamp and original extension
    const uniqueName = new Date().toISOString().replace(/:/g, "-") + file.originalname;
    cb(null, uniqueName);
  },
});

module.exports = photoStorage