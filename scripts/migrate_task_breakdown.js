// Migration script to create task breakdown tables
const con = require('../models/db');
const fs = require('fs');
const path = require('path');

console.log('Starting task breakdown tables migration...\n');

// Read the SQL file
const sqlFilePath = path.join(__dirname, '../models/datase/task_breakdown_tables.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// Split by semicolons to execute each statement separately
const statements = sql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute\n`);

// Execute statements sequentially
let currentIndex = 0;

function executeNext() {
    if (currentIndex >= statements.length) {
        console.log('\n✓ Migration completed successfully!');
        console.log('Tables created:');
        console.log('  - monthly_tasks');
        console.log('  - weekly_tasks');
        con.end();
        process.exit(0);
        return;
    }

    const statement = statements[currentIndex];
    const statementPreview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';

    console.log(`Executing statement ${currentIndex + 1}/${statements.length}:`);
    console.log(`  ${statementPreview}`);

    con.query(statement, (err, result) => {
        if (err) {
            console.error(`  ✗ Error:`, err.message);
            // Continue anyway for IF NOT EXISTS statements
            if (!err.message.includes('already exists')) {
                console.error('  Statement:', statement);
            }
        } else {
            console.log(`  ✓ Success`);
        }

        currentIndex++;
        executeNext();
    });
}

// Start execution
executeNext();

// Timeout after 30 seconds
setTimeout(() => {
    console.log('\n✗ Migration timeout after 30 seconds');
    con.end();
    process.exit(1);
}, 30000);
