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
    
    // We want to add an entry to menu_items where name = 'Task Breakdown', path='/tasks/breakdown', category='Tasks' or parent_id=x
    
    con.query("SELECT * FROM menu_items WHERE path = '/tasks/breakdown'", (e, r) => {
       if (e) throw e;
       if (r.length === 0) {
           console.log("Adding Task Breakdown menu item...");
           
           // Find the parent ID for Task Management, if any. Usually it's top-level or there's a parent.
           // Tasks category has "Task Assignment" and "Task Management". Let's use similar properties.
           con.query("SELECT * FROM menu_items WHERE path = '/tasks/assignment'", (e2, r2) => {
               if (e2) throw e2;
               const parent_id = r2[0]?.parent_id || null;
               const icon = 'faTasks';
               
               const insertQuery = "INSERT INTO menu_items (name, path, is_active, display_order, icon, parent_id) VALUES ('Task Breakdown', '/tasks/breakdown', 1, 99, ?, ?)";
               con.query(insertQuery, [icon, parent_id], (err3, res3) => {
                   if (err3) throw err3;
                   const menu_id = res3.insertId;
                   console.log("Added Menu ID:", menu_id);
                   
                   // Now give permission to common roles (admin=1, ceo=29, staff=3)
                   const perms = [[1, menu_id], [29, menu_id], [3, menu_id]];
                   con.query("INSERT IGNORE INTO role_permissions (role_id, menu_id) VALUES ?", [perms], (err4) => {
                       if (err4) throw err4;
                       console.log("Permissions assigned successfully.");
                       con.end();
                   });
               });
           });
       } else {
           console.log("Menu item already exists.");
           con.end();
       }
    });
});
