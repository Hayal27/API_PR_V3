const mysql = require('mysql');

// Create connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'itpr'
});

// SQL to create reports table
const createReportsTable = `
CREATE TABLE IF NOT EXISTS reports (
  report_id int(11) NOT NULL AUTO_INCREMENT,
  plan_id int(11) NOT NULL,
  user_id int(11) NOT NULL,
  report_content text NOT NULL,
  status enum('Pending','Approved','Declined') DEFAULT 'Pending',
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (report_id),
  KEY plan_id (plan_id),
  KEY user_id (user_id),
  CONSTRAINT reports_ibfk_1 FOREIGN KEY (plan_id) REFERENCES plans (plan_id) ON DELETE CASCADE,
  CONSTRAINT reports_ibfk_2 FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`;

// SQL to create report_attachments table
const createReportAttachmentsTable = `
CREATE TABLE IF NOT EXISTS report_attachments (
  attachment_id int(11) NOT NULL AUTO_INCREMENT,
  report_id int(11) NOT NULL,
  file_name varchar(255) NOT NULL,
  file_path varchar(500) NOT NULL,
  file_size bigint(20) DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (attachment_id),
  KEY report_id (report_id),
  CONSTRAINT report_attachments_ibfk_1 FOREIGN KEY (report_id) REFERENCES reports (report_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
`;

// Connect and execute queries
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  
  console.log('Connected to database');
  
  // Create reports table
  connection.query(createReportsTable, (err, result) => {
    if (err) {
      console.error('Error creating reports table:', err);
    } else {
      console.log('Reports table created successfully');
    }
    
    // Create report_attachments table
    connection.query(createReportAttachmentsTable, (err, result) => {
      if (err) {
        console.error('Error creating report_attachments table:', err);
      } else {
        console.log('Report_attachments table created successfully');
      }
      
      // Close connection
      connection.end();
      console.log('Database connection closed');
    });
  });
});