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
  INSERT INTO menu_items (name, path, icon, parent_id, sort_order) 
  VALUES ('Employee Positions', '/admin/employee-positions', 'bi-diagram-2', 2, 4)
`;

con.query(sql, (err, result) => {
    if (err) {
        console.error("Error inserting menu item:", err);
    } else {
        console.log("Inserted menu item, ID:", result.insertId);
        const menuId = result.insertId;
        
        // Add permissions for Admin (role_id=1), CEO (29), HR (if exists, but we'll stick to Admin, 1)
        const permSql = `INSERT INTO role_permissions (role_id, menu_id, can_view, can_create, can_edit, can_delete) VALUES
          (1, ${menuId}, 1, 1, 1, 1),
          (29, ${menuId}, 1, 1, 1, 1)
        `;
        con.query(permSql, (err2) => {
           if (err2) console.error("Error permissions:", err2);
           else console.log("Added permissions for admin & CEO.");
           con.end();
        });
    }
});
