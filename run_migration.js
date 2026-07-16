const mysql = require("mysql");
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const con = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true // Allow multiple statements in one query
});

con.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    
    const sqlPath = path.join(__dirname, 'models', 'datase', 'insert_task_menus.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Migration failed:', err.message);
        } else {
            console.log('Migration successful!', results);
        }
        con.end();
    });
});
