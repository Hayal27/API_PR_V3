/**
 * Migration: add_task_assignees
 * Creates monthly_task_assignees and weekly_task_assignees tables
 * to support assigning subordinates to breakdown tasks
 */
const db = require('../models/db');

const run = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS monthly_task_assignees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      monthly_task_id INT NOT NULL,
      user_id INT NOT NULL,
      assigned_by INT NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_monthly_assignee (monthly_task_id, user_id),
      FOREIGN KEY (monthly_task_id) REFERENCES monthly_tasks(monthly_task_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS weekly_task_assignees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      weekly_task_id INT NOT NULL,
      user_id INT NOT NULL,
      assigned_by INT NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_weekly_assignee (weekly_task_id, user_id),
      FOREIGN KEY (weekly_task_id) REFERENCES weekly_tasks(weekly_task_id) ON DELETE CASCADE
    );
  `;

  db.query(sql, (err) => {
    if (err) {
      console.error('❌ Migration failed:', err.message);
    } else {
      console.log('✅ Task assignee tables created successfully');
    }
    process.exit();
  });
};

run();
