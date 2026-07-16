
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

  // Log the beginning of fetching the profile picture
  console.log(`Fetching profile picture for user: ${user_id}`);

  const sql = "SELECT avatar_url FROM users WHERE user_id = ?";
  con.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed." });
    }

    if (result.length === 0) {
      console.error("User not found for ID:", user_id);
      return res.status(404).json({ error: "User not found." });
    }

    const avatarUrl = result[0].avatar_url;
    if (!avatarUrl) {
      console.error("No profile picture found for user:", user_id);
      return res.status(404).json({ error: "No profile picture found." });
    }

    // Construct full URL
    const fullAvatarUrl = `${req.protocol}://${req.get("host")}${avatarUrl}`;
    
    // Log the successful fetch before sending response
    console.log(`Profile picture fetched for user: ${user_id} - URL: ${fullAvatarUrl}`);

    res.json({
      success: true,
      avatarUrl: fullAvatarUrl
    });
  });
};

module.exports = {
  uploadProfilePicture,
  getProfilePicture
};
