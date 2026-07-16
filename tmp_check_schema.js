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
    
    con.query('DESCRIBE departments', (err, results) => {
        if (err) console.error(err);
        else console.log('Departments schema:', results.map(r => r.Field));
        
        con.query('DESCRIBE users', (err, results) => {
            if (err) console.error(err);
            else console.log('Users schema:', results.map(r => r.Field));
            con.end();
        });
    });
});
