const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { serveFile, getFileInfo } = require('../controllers/fileController');
const { getAllowedExtensions, getAllowedMimeTypes } = require('../middleware/upload');

// Secure file serving endpoint
router.get('/serve/:source/:fileId', verifyToken, serveFile);

// Get file information
router.get('/info/:source/:fileId', verifyToken, getFileInfo);

// Get allowed file types (for frontend validation)
router.get('/allowed-types', (req, res) => {
  res.json({
    success: true,
    data: {
      extensions: getAllowedExtensions(),
      mimeTypes: getAllowedMimeTypes(),
      maxSize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10
    }
  });
});

module.exports = router;
