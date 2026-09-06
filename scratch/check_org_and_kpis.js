const con = require('../models/db');

async function debugUser73() {
    console.log("=== DEBUGGING USER 73 (tsuhayu directorate) ===");

    const user = await q("SELECT u.*, r.role_name, e.fname, e.lname, e.department_id as emp_dept FROM users u LEFT JOIN roles r ON u.role_id = r.role_id LEFT JOIN employees e ON u.employee_id = e.employee_id WHERE u.user_id = 73 OR u.user_name LIKE '%tsuhayu%'");
    console.log("User record:", user);

    if (user.length > 0) {
        const empId = user[0].employee_id;
        console.log(`\nEmployee ID: ${empId}`);

        const empPos = await q("SELECT ep.*, os.name as org_name FROM employee_positions ep LEFT JOIN organization_structure os ON ep.org_node_id = os.id WHERE ep.employee_id = ?", [empId]);
        console.log("Employee positions:", empPos);
    }

    process.exit(0);
}

function q(sql, params = []) {
    return new Promise((resolve, reject) => {
        con.query(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

debugUser73().catch(console.error);
