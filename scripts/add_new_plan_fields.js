const con = require("../models/db");

const addColumns = async () => {
    const columns = [
        "ALTER TABLE specific_objective_details ADD COLUMN project_type VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE specific_objective_details ADD COLUMN income_plan_type VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE specific_objective_details ADD COLUMN employee_of VARCHAR(255) DEFAULT NULL"
    ];

    for (const query of columns) {
        try {
            await new Promise((resolve, reject) => {
                con.query(query, (err, result) => {
                    if (err) {
                        // Ignore if column already exists
                        if (err.code === 'ER_DUP_FIELDNAME') {
                            console.log(`Column already exists: ${query.split('ADD COLUMN ')[1].split(' ')[0]}`);
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log(`Successfully added: ${query.split('ADD COLUMN ')[1].split(' ')[0]}`);
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error(`Error executing query: ${query}`, error);
        }
    }
    process.exit(0);
};

addColumns();
