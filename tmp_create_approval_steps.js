const mysql = require("mysql");
require("dotenv").config();

const con = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

con.connect();

const sql = `
CREATE TABLE IF NOT EXISTS plan_approval_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id INT NOT NULL,
  step_number INT NOT NULL,
  org_node_id INT NOT NULL,
  org_node_name VARCHAR(255),
  approver_employee_id INT,
  approver_name VARCHAR(255),
  status ENUM('Pending','Approved','Declined','Skipped') DEFAULT 'Pending',
  comment TEXT,
  approved_at DATETIME,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE,
  FOREIGN KEY (org_node_id) REFERENCES organization_structure(id),
  FOREIGN KEY (approver_employee_id) REFERENCES employees(employee_id),
  UNIQUE KEY uq_plan_step (plan_id, step_number)
)
`;

con.query(sql, (err) => {
    if (err) {
        console.error("Error creating table:", err);
    } else {
        console.log("✅ plan_approval_steps table created/exists.");
    }
    con.end();
});
