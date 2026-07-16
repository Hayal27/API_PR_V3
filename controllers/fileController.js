const fs = require('fs');
const path = require('path');
const con = require('../models/db');
const { ALLOWED_FILE_TYPES } = require('../middleware/upload');

// Secure file serving with access control
const serveFile = async (req, res) => {
  try {
    const { fileId, source } = req.params;
    const user_id = req.user_id;
    
    console.log(`📁 File access request: fileId=${fileId}, source=${source}, user=${user_id}`);
    
    let fileQuery, fileParams;
    
    if (source === 'reportfile') {
      // Check access to reportfile attachments
      fileQuery = `
        SELECT rf.*, p.user_id as plan_owner
        FROM reportfile rf
        JOIN plans p ON p.specific_objective_detail_id = rf.specific_objective_id
        WHERE rf.id = ?
      `;
      fileParams = [fileId];
    } else if (source === 'report_attachments') {
      // Check access to report_attachments
      fileQuery = `
        SELECT ra.*, r.user_id as report_owner
        FROM report_attachments ra
        JOIN reports r ON ra.report_id = r.report_id
        WHERE ra.attachment_id = ?
      `;
      fileParams = [fileId];
    } else {
      return res.status(400).json({ error: 'Invalid file source' });
    }
    
    con.query(fileQuery, fileParams, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const fileRecord = results[0];
      const fileOwner = fileRecord.plan_owner || fileRecord.report_owner;
      
      // Check if user has access to this file
      if (fileOwner !== user_id) {
        console.log(`❌ Access denied: User ${user_id} tried to access file owned by ${fileOwner}`);
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Construct file path
      const filePath = path.resolve(fileRecord.file_path);
      const uploadsDir = path.resolve(path.join(__dirname, '..', 'uploads'));
      
      // Security check: ensure file is within uploads directory
      if (!filePath.startsWith(uploadsDir)) {
        console.log(`❌ Security violation: File path outside uploads directory`);
        return res.status(403).json({ error: 'Invalid file path' });
      }
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found on disk: ${filePath}`);
        return res.status(404).json({ error: 'File not found on disk' });
      }
      
      // Get file stats
      const stats = fs.statSync(filePath);
      const fileExtension = path.extname(fileRecord.file_name).toLowerCase().slice(1);
      
      // Set appropriate headers based on file type
      const mimeTypes = ALLOWED_FILE_TYPES[fileExtension];
      const mimeType = mimeTypes ? mimeTypes[0] : 'application/octet-stream';
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Disposition', `inline; filename="${fileRecord.file_name}"`);
      
      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      console.log(`✅ Serving file: ${fileRecord.file_name} to user ${user_id}`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      fileStream.on('error', (error) => {
        console.error('File stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error reading file' });
        }
      });
    });
    
  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get file info without serving content
const getFileInfo = async (req, res) => {
  try {
    const { fileId, source } = req.params;
    const user_id = req.user_id;
    
    let fileQuery, fileParams;
    
    if (source === 'reportfile') {
      fileQuery = `
        SELECT rf.id, rf.file_name, rf.uploaded_at, p.user_id as plan_owner,
               'reportfile' as source
        FROM reportfile rf
        JOIN plans p ON p.specific_objective_detail_id = rf.specific_objective_id
        WHERE rf.id = ?
      `;
      fileParams = [fileId];
    } else if (source === 'report_attachments') {
      fileQuery = `
        SELECT ra.attachment_id as id, ra.file_name, ra.created_at as uploaded_at, 
               r.user_id as report_owner, 'report_attachments' as source
        FROM report_attachments ra
        JOIN reports r ON ra.report_id = r.report_id
        WHERE ra.attachment_id = ?
      `;
      fileParams = [fileId];
    } else {
      return res.status(400).json({ error: 'Invalid file source' });
    }
    
    con.query(fileQuery, fileParams, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      const fileRecord = results[0];
      const fileOwner = fileRecord.plan_owner || fileRecord.report_owner;
      
      // Check if user has access to this file
      if (fileOwner !== user_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json({
        success: true,
        file: {
          id: fileRecord.id,
          name: fileRecord.file_name,
          uploaded_at: fileRecord.uploaded_at,
          source: fileRecord.source
        }
      });
    });
    
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  serveFile,
  getFileInfo
};
