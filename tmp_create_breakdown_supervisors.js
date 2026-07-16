const mysql = require("mysql");
require("dotenv").config();

const con = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

con.connect((err) => {
    if (err) throw err;
    
    const query = `
      CREATE TABLE IF NOT EXISTS plan_breakdown_supervisors (
        id INT(11) NOT NULL AUTO_INCREMENT,
        specific_objective_detail_id INT(11) NOT NULL,
        supervisor_user_id INT(11) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY idx_unique_supervisor (specific_objective_detail_id, supervisor_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    
    con.query(query, (err, results) => {
        if (err) console.error("Error creating table:", err.message);
        else console.log("Table plan_breakdown_supervisors created successfully!");
        con.end();
    });
});
