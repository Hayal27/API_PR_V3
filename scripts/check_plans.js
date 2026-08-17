const con = require('../models/db');
const fs = require('fs');
const path = require('path');

const query = `
    SELECT 
        sod.specific_objective_detail_id as plan_id, 
        sod.name, 
        sod.department_id, 
        sod.user_id, 
        e.fname, 
        e.lname,
        ep.is_primary,
        os.name as os_name
    FROM specific_objective_details sod
    LEFT JOIN users u ON sod.user_id = u.user_id
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id
    LEFT JOIN organization_structure os ON ep.org_node_id = os.id
    WHERE sod.name LIKE '%PORT%' OR sod.specific_objective_detailname LIKE '%PORT%'
`;

con.query(query, (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        const outPath = path.join(__dirname, 'check_plans_out.json');
        fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
        console.log("Wrote output to", outPath);
    }
    process.exit();
});
