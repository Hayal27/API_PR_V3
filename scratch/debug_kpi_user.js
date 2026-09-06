const con = require('../models/db');

async function debugUserKPIs() {
    console.log('--- DEBUGGING USER & KPI POSITIONS ---');

    // 1. Get all users
    const users = await q("SELECT u.user_id, u.username, u.email, u.role_id, u.employee_id, u.department_id, r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.role_id");
    console.log(`Total users in DB: ${users.length}`);
    users.forEach(u => {
        console.log(`User ID: ${u.user_id} | Username: ${u.username} | Role: ${u.role_name} | EmpID: ${u.employee_id} | DeptID: ${u.department_id}`);
    });

    // 2. Get employee positions
    const empPositions = await q("SELECT ep.*, os.name as org_name FROM employee_positions ep LEFT JOIN organization_structure os ON ep.org_node_id = os.id");
    console.log(`\nTotal employee_positions in DB: ${empPositions.length}`);
    empPositions.forEach(ep => {
        console.log(`  EmpPos ID: ${ep.id} | EmpID: ${ep.employee_id} | OrgNodeID: ${ep.org_node_id} (${ep.org_name}) | PositionID: ${ep.position_id}`);
    });

    // 3. Get specific_objectives
    const kpis = await q("SELECT specific_objective_id, specific_objective_name, name, user_id, department_id, org_node_ids, supportive_org_node_ids FROM specific_objectives LIMIT 10");
    console.log(`\nTotal specific_objectives in DB: ${kpis.length}`);
    kpis.forEach(k => {
        console.log(`  KPI ID: ${k.specific_objective_id} | Name: "${k.specific_objective_name || k.name}" | UserID: ${k.user_id} | DeptID: ${k.department_id} | OrgNodes: ${k.org_node_ids} | SuppNodes: ${k.supportive_org_node_ids}`);
    });

    // 4. Get specific_objective_details
    const kpiDetails = await q("SELECT specific_objective_detail_id, specific_objective_detailname, name, user_id, department_id FROM specific_objective_details LIMIT 10");
    console.log(`\nTotal specific_objective_details in DB: ${kpiDetails.length}`);
    kpiDetails.forEach(kd => {
        console.log(`  KPI Detail ID: ${kd.specific_objective_detail_id} | Name: "${kd.specific_objective_detailname || kd.name}" | UserID: ${kd.user_id} | DeptID: ${kd.department_id}`);
    });

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

debugUserKPIs().catch(console.error);
