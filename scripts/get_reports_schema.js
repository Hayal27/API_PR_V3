const con = require('../models/db');
const fs = require('fs');
const path = require('path');

con.query('SHOW COLUMNS FROM reports', (err, rows) => {
    const outPath = path.join(__dirname, 'reports_schema.json');
    if (err) {
        fs.writeFileSync(outPath, JSON.stringify({error: err.message}));
    } else {
        fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
    }
    process.exit();
});
