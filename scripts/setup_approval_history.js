const mysql = require("mysql");

// Database connection configuration
const con = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "", // Use an empty string if PASSWORD is undefined
    database: "itpr"
});

// SQL to create the approval_workflow_history table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS approval_workflow_history (
  history_id int(11) NOT NULL AUTO_INCREMENT,
  plan_id int(11) NOT NULL,
  approver_id int(11) NOT NULL,
  approver_name varchar(255) NOT NULL,
  approver_role varchar(100) NOT NULL,
  status enum('Pending','Approved','Declined') NOT NULL,
  comment text DEFAULT NULL,
  action_date datetime DEFAULT current_timestamp(),
  step_number int(11) NOT NULL,
  is_current_step tinyint(1) DEFAULT 0,
  created_by_user_id int(11) NOT NULL,
  created_by_name varchar(255) NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (history_id),
  KEY idx_plan_id (plan_id),
  KEY idx_approver_id (approver_id),
  KEY idx_created_by_user_id (created_by_user_id),
  KEY idx_step_number (step_number),
  FOREIGN KEY (plan_id) REFERENCES plans (plan_id) ON DELETE CASCADE,
  FOREIGN KEY (approver_id) REFERENCES employees (employee_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`;

// SQL to populate existing approval workflow data
const populateHistorySQL = `
INSERT INTO approval_workflow_history 
(plan_id, approver_id, approver_name, approver_role, status, comment, step_number, is_current_step, created_by_user_id, created_by_name, action_date)
SELECT 
  aw.plan_id,
  aw.approver_id,
  COALESCE(e.name, CONCAT(u.fname, ' ', u.lname)) as approver_name,
  COALESCE(r.role_name, 'System') as approver_role,
  aw.status,
  COALESCE(aw.comment, 'No comment provided') as comment,
  1 as step_number,
  CASE WHEN aw.status = 'Pending' THEN 1 ELSE 0 END as is_current_step,
  p.user_id as created_by_user_id,
  COALESCE(creator_e.name, CONCAT(creator_u.fname, ' ', creator_u.lname)) as created_by_name,
  COALESCE(aw.approval_date, aw.approved_at, p.created_at) as action_date
FROM approvalworkflow aw
JOIN plans p ON aw.plan_id = p.plan_id
LEFT JOIN employees e ON aw.approver_id = e.employee_id
LEFT JOIN users u ON e.employee_id = u.employee_id
LEFT JOIN roles r ON u.role_id = r.role_id
LEFT JOIN users creator_u ON p.user_id = creator_u.user_id
LEFT JOIN employees creator_e ON creator_u.employee_id = creator_e.employee_id
WHERE NOT EXISTS (
  SELECT 1 FROM approval_workflow_history awh 
  WHERE awh.plan_id = aw.plan_id AND awh.approver_id = aw.approver_id
)
ORDER BY aw.plan_id, aw.approval_date;
`;

// Function to setup the approval history system
function setupApprovalHistory() {
    console.log('🚀 Starting approval history setup...');
    
    con.connect((err) => {
        if (err) {
            console.error('❌ Error connecting to MySQL:', err);
            return;
        }
        console.log('✅ Connected to MySQL database');
        
        // Create the table
        con.query(createTableSQL, (err, result) => {
            if (err) {
                console.error('❌ Error creating approval_workflow_history table:', err);
                con.end();
                return;
            }
            console.log('✅ approval_workflow_history table created successfully');
            
            // Populate with existing data
            con.query(populateHistorySQL, (err, result) => {
                if (err) {
                    console.error('❌ Error populating approval history:', err);
                } else {
                    console.log(`✅ Populated approval history with ${result.affectedRows} records`);
                }
                
                // Close connection
                con.end((err) => {
                    if (err) {
                        console.error('❌ Error closing connection:', err);
                    } else {
                        console.log('✅ Database connection closed');
                        console.log('🎉 Approval history setup completed successfully!');
                    }
                });
            });
        });
    });
}

// Run the setup
setupApprovalHistory();
