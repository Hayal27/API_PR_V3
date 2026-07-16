const fs = require('fs');
const path = require('path');
const mysql = require('mysql');

// Create a separate connection with multipleStatements enabled if needed, 
// or just use the existing config but we need to import it.
// Since db.js exports an already connected connection, we might want to create a new one 
// to ensure we can handle the async nature properly without interfering with the app if it were running (though we run this separately).

const dbConfig = {
    user: "root",
    host: "localhost",
    password: "",
    database: "itpr",
    multipleStatements: true // Enable multiple statements
};

const con = mysql.createConnection(dbConfig);

const migrationFile = path.join(__dirname, '../models/datase/add_zoom_fields.sql');

con.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');

    fs.readFile(migrationFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading migration file:', err);
            con.end();
            process.exit(1);
        }

        // Remove comments
        const cleanData = data.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

        // Split by semicolon
        const statements = cleanData.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements to execute.`);

        let executed = 0;
        let failed = 0;

        const executeNext = (index) => {
            if (index >= statements.length) {
                console.log(`Migration completed. Executed: ${executed}, Failed: ${failed}`);
                con.end();
                process.exit(failed > 0 ? 1 : 0);
                return;
            }

            const statement = statements[index];
            console.log(`Executing statement ${index + 1}...`);

            con.query(statement, (err, result) => {
                if (err) {
                    // Ignore "Duplicate column name" or "Table already exists" errors if we want to be idempotent
                    // But for now let's log them.
                    if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_KEYNAME') {
                        console.log(`Skipping (already exists): ${err.message}`);
                        executed++; // Count as success-ish
                    } else {
                        console.error(`Error executing statement ${index + 1}:`, err.message);
                        console.error(`Statement: ${statement.substring(0, 50)}...`);
                        failed++;
                    }
                } else {
                    executed++;
                }
                executeNext(index + 1);
            });
        };

        executeNext(0);
    });
});
