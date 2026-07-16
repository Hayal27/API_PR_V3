const db = require('./models/db');

async function getFullSchema() {
    db.query('SHOW TABLES', async (err, tables) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        const schema = {};
        const tableNames = tables.map(t => Object.values(t)[0]);

        for (const name of tableNames) {
            await new Promise((resolve) => {
                db.query(`DESCRIBE \`${name}\``, (err, columns) => {
                    if (!err) {
                        schema[name] = columns.map(c => `${c.Field} (${c.Type})`);
                    }
                    resolve();
                });
            });
        }

        console.log(JSON.stringify(schema, null, 2));
        process.exit(0);
    });
}

getFullSchema();
