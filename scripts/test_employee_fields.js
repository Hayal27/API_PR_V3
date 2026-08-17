const con = require('../models/db');

const sql = `
SELECT 
    e.fname,
    e.lname,
    e.position as emp_position,
    pos.title as pos_title,
    pos.name as pos_name,
    e.department_id,
    os.name as os_name,
    ep.org_node_id,
    os2.name as os2_name
FROM users u
JOIN employees e ON u.employee_id = e.employee_id
LEFT JOIN (SELECT employee_id, MAX(position_id) as position_id, MAX(org_node_id) as org_node_id FROM employee_positions WHERE is_primary=1 GROUP BY employee_id) ep ON e.employee_id = ep.employee_id
LEFT JOIN positions pos ON ep.position_id = pos.position_id
LEFT JOIN organization_structure os ON e.department_id = os.id
LEFT JOIN organization_structure os2 ON ep.org_node_id = os2.id
WHERE u.status = '1'
LIMIT 10;
`;

con.query(sql, (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.table(rows);
    }
    process.exit();
});
