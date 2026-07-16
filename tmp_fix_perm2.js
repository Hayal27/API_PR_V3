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

// First get column names in role_permissions
con.query('DESCRIBE role_permissions', (err, cols) => {
    if (err) return console.error(err);
    console.log("Columns:", cols.map(c => c.Field));

    // Look at existing row to understand structure
    con.query('SELECT * FROM role_permissions LIMIT 3', (err2, rows) => {
        if (err2) return console.error(err2);
        console.log("Sample rows:", rows);

        // Now insert permissions with correct column names
        const fields = cols.map(c => c.Field);
        console.log("All fields:", fields);
        con.end();
    });
});
