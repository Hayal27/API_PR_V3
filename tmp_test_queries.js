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
    
    // Test getAvailableUsers query
    const query1 = `
      SELECT 
        u.user_id,
        u.user_name,
        CONCAT(e.fname, ' ', e.lname) as name,
        '' as position,
        d.department_name,
        u.avatar_url
      FROM users u
      JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE u.status = '1' AND u.user_id != ?
      ORDER BY e.fname ASC
    `; // changed ORDER BY e.name to e.fname, could be the issue!
    
    con.query(query1, [1], (err, results) => {
        if (err) console.error('getAvailableUsers Query failed:', err.message);
        else console.log('getAvailableUsers Query success!');
        
        // Test getAssignedByMe query
        const query2 = `
          SELECT 
            ta.*,
            u_to.user_name as assigned_to_username,
            CONCAT(e_to.fname, ' ', e_to.lname) as assigned_to_name,
            '' as assigned_to_position,
            d_to.department_name as assigned_to_department
          FROM task_assignments ta
          LEFT JOIN users u_to ON ta.assigned_to = u_to.user_id
          LEFT JOIN employees e_to ON u_to.employee_id = e_to.employee_id
          LEFT JOIN departments d_to ON e_to.department_id = d_to.department_id
          WHERE ta.assigned_by = ?
        `;
        
        con.query(query2, [1], (err, results) => {
            if (err) console.error('getAssignedByMe Query failed:', err.message);
            else console.log('getAssignedByMe Query success!');
            con.end();
        });
    });
});
