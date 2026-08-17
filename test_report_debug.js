const con = require('./models/db');

const q1 = `SELECT * FROM monthly_tasks LIMIT 5`;
const q2 = `SELECT * FROM monthly_task_assignees LIMIT 5`;
const q3 = `SELECT specific_objective_detail_id, specific_objective_detailname, user_id, weight, plan, progress, execution_percentage, outcome, CIplan, CIoutcome FROM specific_objective_details LIMIT 5`;

con.query(`${q1}; ${q2}; ${q3}`, (err, results) => {
    if (err) {
        console.error("Query Error:", err);
    } else {
        console.log("--- MONTHLY TASKS ---");
        console.log(results[0]);
        console.log("--- MONTHLY TASK ASSIGNEES ---");
        console.log(results[1]);
        console.log("--- SPECIFIC OBJECTIVE DETAILS (Action Plans) ---");
        console.log(results[2]);
    }
    process.exit(0);
});
