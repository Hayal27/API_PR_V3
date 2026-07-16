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
    if (err) process.exit(1);
    
    con.query('DESCRIBE employees', (err, results) => {
        if (err) console.error(err);
        else console.log(results);
        con.end();
    });
});
