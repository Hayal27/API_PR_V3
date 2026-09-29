const con = require('../models/db');

const sql = `
  CREATE TABLE IF NOT EXISTS user_branches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    branch_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_branch (user_id, branch_id),
    INDEX idx_user_branches_user (user_id),
    INDEX idx_user_branches_branch (branch_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

con.query(sql, (err, result) => {
  if (err) {
    console.error('Error creating user_branches table:', err);
    process.exit(1);
  }
  console.log('✅ user_branches table is ready and verified.');
  process.exit(0);
});
