const mysql = require('mysql');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'itpr'
};

const connection = mysql.createConnection(dbConfig);

async function run() {
    connection.connect();
    connection.query(
        `SELECT 
            plan_type, 
            COUNT(*) as count, 
            AVG(execution_percentage) as avg_exec, 
            AVG(CIexecution_percentage) as avg_ci_exec 
         FROM specific_objective_details 
         WHERE created_by='Ezira' GROUP BY plan_type`,
        (err, results) => {
            if (err) console.error(err);
            else {
                console.log('--- Seeded Data - Percentages and Counts ---');
                console.table(results);

                connection.query(
                    `SELECT cost_type, COUNT(*) as count FROM specific_objective_details WHERE created_by='Ezira' AND plan_type='cost' GROUP BY cost_type`,
                    (err3, results3) => {
                        console.log('\n--- Cost Subtypes ---');
                        console.table(results3);

                        connection.query(
                            `SELECT income_plan_type, COUNT(*) as count FROM specific_objective_details WHERE created_by='Ezira' AND plan_type='income' GROUP BY income_plan_type`,
                            (err4, results4) => {
                                console.log('\n--- Income Subtypes ---');
                                console.table(results4);
                                connection.end();
                            }
                        );
                    }
                );
            }
        }
    );
}

run();
