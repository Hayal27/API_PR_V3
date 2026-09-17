const con = require('./models/db');
const { promisify } = require('util');
const fs = require('fs');
const query = promisify(con.query).bind(con);

async function dumpSchema() {
    try {
        const mt = await query('DESCRIBE monthly_tasks');
        const wt = await query('DESCRIBE weekly_tasks');
        const sod = await query('DESCRIBE specific_objective_details');
        
        fs.writeFileSync('schema_dump.json', JSON.stringify({
            monthly_tasks: mt,
            weekly_tasks: wt,
            specific_objective_details: sod
        }, null, 2));
        
        console.log("Schema dumped to schema_dump.json");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
dumpSchema();
