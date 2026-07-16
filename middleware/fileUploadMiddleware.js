// middleware/fileUploadMiddleware.js

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "public/images",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

const fileUploadMiddleware = {
  uploadSingleImage: upload.single("image1"),
  uploadMultipleImages: upload.fields([{ name: "image1" }]),
};

module.exports = fileUploadMiddleware;
