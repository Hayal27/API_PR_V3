require("dotenv").config();
const mysql = require("mysql");

const con = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

con.connect(function (err) {
    if (err) {
        console.error('Error connecting:', err);
        process.exit(1);
    }
    console.log('Connected!');

    con.query('SELECT * FROM departments LIMIT 5', function (err, result) {
        if (err) throw err;
        console.log('Departments:', result);

        con.query('SELECT DISTINCT type FROM departments', function (err, types) {
            if (err) throw err;
            console.log('Types:', types);
            process.exit(0);
        });
    });
});
