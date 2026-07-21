const db = require('./models/db');
const { promisify } = require('util');
const dbQuery = promisify(db.query).bind(db);

async function test() {
    try {
        console.log("Testing Global Summary Query...");
        await dbQuery(`
            SELECT g.year, COUNT(sod.specific_objective_detail_id) as objective_count,
            ROUND(AVG(COALESCE(sod.CIexecution_percentage, sod.execution_percentage, 0)), 2) as avg_execution_perc,
            SUM(COALESCE(sod.CIplan, 0)) as total_planned_value, SUM(COALESCE(sod.CIoutcome, 0)) as total_actual_value
            FROM specific_objective_details sod JOIN plans p ON sod.specific_objective_detail_id = p.specific_objective_detail_id
            JOIN goals g ON p.goal_id = g.goal_id JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
            WHERE aw.status = 'completed' GROUP BY g.year ORDER BY g.year ASC
        `);
        console.log("Global Summary OK");

        console.log("Testing Requester Profile Query...");
        // Use a dummy user_id, e.g. 1
        await dbQuery(`
            SELECT e.*, d.name as department_name, r.role_name 
            FROM employees e 
            JOIN users u ON e.employee_id = u.employee_id 
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN roles r ON e.role_id = r.role_id
            WHERE u.user_id = ?
        `, [1]);
        console.log("Requester Profile OK");

        console.log("Testing Employee Directory Query...");
        await dbQuery(`
            SELECT e.name, r.role_name, d.name as department_name, e.fname, e.lname 
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN roles r ON e.role_id = r.role_id
        `);
        console.log("Employee Directory OK");

        console.log("Testing Task Stats Query...");
        await dbQuery(`SELECT status, COUNT(*) as count FROM task_assignments GROUP BY status`);
        console.log("Task Stats OK");

    } catch (e) {
        console.error("Query Error:", e);
    }
    process.exit();
}

test();
