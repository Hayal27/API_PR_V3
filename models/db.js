let mysql;
try {
    mysql = require("mysql2");
    console.log("✅ Using mysql2 database driver");
} catch (e) {
    mysql = require("mysql");
    console.warn("⚠️  Using legacy mysql database driver (recommend running: npm install mysql2)");
}

require("dotenv").config();

let rawHost = (process.env.DB_HOST || "127.0.0.1").trim();
if (!rawHost || rawHost === "." || rawHost === "localhost." || rawHost.startsWith(".")) {
    rawHost = "127.0.0.1";
}

const con = mysql.createPool({
    connectionLimit: 25,
    host: rawHost,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "itpr",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    multipleStatements: true,
    connectTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0,
    dateStrings: true,
    timezone: '+03:00'
});

// Handle errors on pooled connections to avoid crashing the server
con.on('error', (err) => {
    console.error('⚠️  MySQL Pool Error:', err.message);
});

console.log('Connected to MySQL database via connection pool');

// Attach Sequelize instance
const { sequelize, Sequelize } = require('../config/database');
con.sequelize = sequelize;
con.Sequelize = Sequelize;

module.exports = con;
