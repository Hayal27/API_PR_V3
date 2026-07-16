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
con.query('DESCRIBE role_permissions', (err, r) => {
    console.log(r);
    con.query('DELETE FROM role_permissions WHERE menu_id=75', () => {
        const sql = 'INSERT INTO role_permissions (role_id, menu_id) VALUES (1, 75)';
        con.query(sql, (e) => {
            if(e) console.error(e);
            else console.log("Success admin permission");
            con.end();
        });
    });
});
