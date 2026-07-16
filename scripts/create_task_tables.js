// Simple script to create task breakdown tables
const con = require('../models/db');

console.log('Creating task breakdown tables...\n');

const createMonthlyTasksTable = `
CREATE TABLE IF NOT EXISTS monthly_tasks (
  monthly_task_id INT(11) NOT NULL AUTO_INCREMENT,
  specific_objective_detail_id INT(11) NOT NULL,
  name VARCHAR(255) NOT NULL,
  weight DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (monthly_task_id),
  KEY idx_specific_objective_detail (specific_objective_detail_id),
  KEY idx_monthly_task_weight (weight),
  CONSTRAINT fk_monthly_task_detail 
    FOREIGN KEY (specific_objective_detail_id) 
    REFERENCES specific_objective_details (specific_objective_detail_id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
`;

const createWeeklyTasksTable = `
CREATE TABLE IF NOT EXISTS weekly_tasks (
  weekly_task_id INT(11) NOT NULL AUTO_INCREMENT,
  monthly_task_id INT(11) NOT NULL,
  name VARCHAR(255) NOT NULL,
  weight DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (weekly_task_id),
  KEY idx_monthly_task (monthly_task_id),
  KEY idx_weekly_task_weight (weight),
  CONSTRAINT fk_weekly_task_monthly 
    FOREIGN KEY (monthly_task_id) 
    REFERENCES monthly_tasks (monthly_task_id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
`;

// Create monthly_tasks table
con.query(createMonthlyTasksTable, (err) => {
    if (err) {
        console.error('✗ Error creating monthly_tasks table:', err.message);
        con.end();
        process.exit(1);
    }

    console.log('✓ monthly_tasks table created successfully');

    // Create weekly_tasks table
    con.query(createWeeklyTasksTable, (err) => {
        if (err) {
            console.error('✗ Error creating weekly_tasks table:', err.message);
            con.end();
            process.exit(1);
        }

        console.log('✓ weekly_tasks table created successfully');
        console.log('\n✓ Migration completed successfully!');
        con.end();
        process.exit(0);
    });
});
