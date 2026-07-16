// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Comprehensive list of allowed file types with MIME types
const ALLOWED_FILE_TYPES = {
  // Documents
  'pdf': ['application/pdf'],
  'doc': ['application/msword'],
  'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'xls': ['application/vnd.ms-excel'],
  'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'ppt': ['application/vnd.ms-powerpoint'],
  'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  'txt': ['text/plain'],
  'rtf': ['application/rtf'],
  'odt': ['application/vnd.oasis.opendocument.text'],
  'ods': ['application/vnd.oasis.opendocument.spreadsheet'],
  
  // Images
  'jpg': ['image/jpeg'],
  'jpeg': ['image/jpeg'],
  'png': ['image/png'],
  'gif': ['image/gif'],
  'bmp': ['image/bmp'],
  'webp': ['image/webp'],
  'svg': ['image/svg+xml'],
  'tiff': ['image/tiff'],
  'ico': ['image/x-icon'],
  
  // Archives
  'zip': ['application/zip'],
  'rar': ['application/vnd.rar'],
  '7z': ['application/x-7z-compressed'],
  'tar': ['application/x-tar'],
  'gz': ['application/gzip'],
  
  // Audio
  'mp3': ['audio/mpeg'],
  'wav': ['audio/wav'],
  'ogg': ['audio/ogg'],
  'm4a': ['audio/mp4'],
  
  // Video
  'mp4': ['video/mp4'],
  'avi': ['video/x-msvideo'],
  'mov': ['video/quicktime'],
  'wmv': ['video/x-ms-wmv'],
  'flv': ['video/x-flv'],
  'webm': ['video/webm'],
  
  // Other
  'csv': ['text/csv'],
  'json': ['application/json'],
  'xml': ['application/xml', 'text/xml']
};

// Get all allowed extensions
const getAllowedExtensions = () => {
  return Object.keys(ALLOWED_FILE_TYPES);
};

// Get all allowed MIME types
const getAllowedMimeTypes = () => {
  return Object.values(ALLOWED_FILE_TYPES).flat();
};

// Sanitize filename
const sanitizeFilename = (filename) => {
  // Remove any path traversal attempts and dangerous characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace special chars with underscore
    .replace(/\.{2,}/g, '.')          // Replace multiple dots with single dot
    .substring(0, 255);               // Limit length
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const sanitizedOriginalName = sanitizeFilename(file.originalname);
    const extension = path.extname(sanitizedOriginalName).toLowerCase();
    const nameWithoutExt = path.basename(sanitizedOriginalName, extension);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalName = `${uniqueSuffix}-${nameWithoutExt}${extension}`;
    cb(null, finalName);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase().slice(1);
  const mimeType = file.mimetype.toLowerCase();
  
  console.log(`📎 File upload attempt: ${file.originalname}, MIME: ${mimeType}, Extension: ${extension}`);
  
  // Check if extension is allowed
  if (!ALLOWED_FILE_TYPES[extension]) {
    console.log(`❌ File rejected: Extension '${extension}' not allowed`);
    return cb(new Error(`File type '${extension}' is not allowed`), false);
  }
  
  // Check if MIME type matches extension
  if (!ALLOWED_FILE_TYPES[extension].includes(mimeType)) {
    console.log(`❌ File rejected: MIME type '${mimeType}' doesn't match extension '${extension}'`);
    return cb(new Error(`Invalid file: MIME type doesn't match file extension`), false);
  }
  
  console.log(`✅ File accepted: ${file.originalname}`);
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files per upload
  }
});

module.exports = {
  upload,
  ALLOWED_FILE_TYPES,
  getAllowedExtensions,
  getAllowedMimeTypes,
  sanitizeFilename
};
