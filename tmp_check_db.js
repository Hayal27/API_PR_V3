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
con.query('DESCRIBE employees', (e, r) => {
    if (e) throw e;
    console.log("== EMPLOYEES ==");
    console.table(r);
    
    con.query("SHOW TABLES LIKE '%employee%'", (e2, r2) => {
        if (e2) throw e2;
        console.log("== EMPLOYEE TABLES ==");
        console.table(r2);
        con.end();
    });
});
