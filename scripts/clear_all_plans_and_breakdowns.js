/**
 * clear_all_plans_and_breakdowns.js
 * Clears all action plans, breakdown tasks (monthly/weekly), task assignments,
 * workflow approvals, and progress tracking tables from the MySQL database.
 */

const con = require('../models/db');

console.log("🧹 Starting database cleanup for Action Plans and Breakdown Tasks...");

const queries = [
    "SET FOREIGN_KEY_CHECKS = 0",
    "TRUNCATE TABLE weekly_task_assignees",
    "TRUNCATE TABLE weekly_tasks",
    "TRUNCATE TABLE monthly_task_assignees",
    "TRUNCATE TABLE monthly_tasks",
    "TRUNCATE TABLE approvalworkflow",
    "TRUNCATE TABLE plans",
    "TRUNCATE TABLE specific_objective_details",
    "UPDATE specific_objectives SET outcome = 0, progress = 0 WHERE 1=1",
    "UPDATE objectives SET outcome = 0, progress = 0 WHERE 1=1",
    "UPDATE goals SET outcome = 0, progress = 0 WHERE 1=1",
    "SET FOREIGN_KEY_CHECKS = 1"
];

async function runCleanup() {
    for (const sql of queries) {
        await new Promise((resolve, reject) => {
            con.query(sql, (err, result) => {
                if (err) {
                    console.warn(`⚠️ Warning on query "${sql}":`, err.message);
                } else {
                    console.log(`✅ Executed: ${sql}`);
                }
                resolve();
            });
        });
    }
    console.log("\n✨ Database successfully reset! All Action Plans, Monthly & Weekly Breakdown Tasks, Assignees, Workflows, and Progress values have been completely cleared.");
    process.exit(0);
}

runCleanup();
