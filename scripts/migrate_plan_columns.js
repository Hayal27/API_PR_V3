const con = require('../models/db');

const alterQueries = [
    "ALTER TABLE monthly_tasks ADD COLUMN plan_amount DECIMAL(15,2) DEFAULT 0 AFTER weight",
    "ALTER TABLE monthly_tasks ADD COLUMN plan_progress DECIMAL(5,2) DEFAULT 0 AFTER progress",
    "ALTER TABLE weekly_tasks ADD COLUMN plan_amount DECIMAL(15,2) DEFAULT 0 AFTER weight",
    "ALTER TABLE weekly_tasks ADD COLUMN plan_progress DECIMAL(5,2) DEFAULT 0 AFTER progress"
];

async function migrate() {
    for (let q of alterQueries) {
        try {
            await new Promise((resolve, reject) => {
                con.query(q, (err, res) => {
                    if (err) {
                        if (err.code === 'ER_DUP_FIELDNAME') {
                            console.log(`Column already exists: ${q}`);
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log(`Success: ${q}`);
                        resolve();
                    }
                });
            });
        } catch (e) {
            console.error("Migration error:", e.message);
        }
    }
    console.log("Migration complete.");
    process.exit(0);
}

migrate();
