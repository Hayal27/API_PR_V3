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

// Grant permissions for Admin (1), CEO (29), Staff (3) for menu id 75
const sql = `
  INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) 
  VALUES 
    (1, 75, 1, 1, 1, 1),
    (29, 75, 1, 1, 1, 1)
  ON DUPLICATE KEY UPDATE can_view=1, can_create=1, can_edit=1, can_delete=1
`;
con.query(sql, (err, result) => {
    if (err) {
        console.error("Error inserting permissions:", err);
    } else {
        console.log("Permissions granted for Admin & CEO for Employee Positions menu.");
    }
    con.end();
});
