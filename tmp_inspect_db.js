const mysql = require("mysql");
const fs = require('fs');
require("dotenv").config();

const con = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

con.connect(async (err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    
    const query = (sql) => new Promise((resolve, reject) => con.query(sql, (err, res) => err ? reject(err) : resolve(res)));

    try {
        const menu_items = await query('SELECT * FROM menu_items ORDER BY id DESC LIMIT 50');
        const roles = await query('SELECT * FROM roles');
        
        fs.writeFileSync('db_dump.json', JSON.stringify({ menu_items, roles }, null, 2));
        console.log("Successfully dumped db to db_dump.json");
    } catch(err) {
        console.error(err);
    } finally {
        con.end();
    }
});
