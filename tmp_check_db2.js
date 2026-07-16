const mysql = require("mysql");
const fs = require("fs");
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
    fs.writeFileSync('schema_dump.json', JSON.stringify(r, null, 2));
    con.end();
});
