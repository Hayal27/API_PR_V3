
const con = require("../models/db"); // Assumes you have a db.js file that exports the database connection
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage }).single("avatar");

const uploadProfilePicture = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ error: "File upload failed." });
    }

    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const avatarUrl = `/uploads/${req.file.filename}`; // Store relative path

    // Update the database with the new profile picture URL
    const sql = `UPDATE users SET avatar_url = ? WHERE user_id = ?`;
    con.query(sql, [avatarUrl, user_id], (dbErr, result) => {
      if (dbErr) {
        console.error("Database error:", dbErr);
        return res.status(500).json({ error: "Database update failed." });
      }

      // Log after successful upload and database update
      console.log(`Profile picture uploaded for user: ${user_id} - URL: ${avatarUrl}`);

      res.json({ success: true, avatarUrl });
    });
  });
};

const getProfilePicture = (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  const sql = `
    SELECT 
      u.user_id,
      u.user_name,
      u.avatar_url,
      u.role_id,
      r.role_name AS role,
      e.fname,
      e.lname,
      TRIM(CONCAT(COALESCE(e.fname, ''), ' ', COALESCE(e.lname, ''))) AS name,
      COALESCE(u.branch_id, e.branch_id, 1) AS branch_id,
      b.name AS branch_name,
      e.email,
      COALESCE(d.name, 'General Directorate') as department_name
    FROM users u
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN branches b ON COALESCE(u.branch_id, e.branch_id, 1) = b.branch_id
    LEFT JOIN departments d ON e.department_id = d.department_id
    WHERE u.user_id = ?
  `;

  con.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Database error in getProfilePicture:", err);
      return res.status(500).json({ error: "Database query failed." });
    }

    if (!result || result.length === 0) {
      return res.json({
        success: true,
        avatarUrl: null,
        user: null,
        message: "User not found."
      });
    }

    const userData = result[0];
    const avatarUrl = userData.avatar_url;
    let fullAvatarUrl = null;

    if (avatarUrl) {
      fullAvatarUrl = avatarUrl.startsWith('http')
        ? avatarUrl
        : `${req.protocol}://${req.get("host")}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
    }

    res.json({
      success: true,
      avatarUrl: fullAvatarUrl,
      user: {
        ...userData,
        fname: userData.fname || '',
        lname: userData.lname || '',
        name: userData.name || userData.fname || '',
        branch_name: userData.branch_name || 'Federal Head Office',
        role: userData.role || (Number(userData.role_id) === 34 ? 'Super Admin' : 'Admin'),
        avatar_url: fullAvatarUrl
      }
    });
  });
};

module.exports = {
  uploadProfilePicture,
  getProfilePicture
};
