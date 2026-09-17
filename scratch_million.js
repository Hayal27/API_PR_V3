const con = require('./models/db');

con.query("SELECT u.user_id, u.user_name, r.role_name, e.employee_id, e.fname, e.lname, e.department_id, ep.org_node_id, ep.position_id FROM users u LEFT JOIN employees e ON u.employee_id = e.employee_id LEFT JOIN roles r ON u.role_id = r.role_id LEFT JOIN employee_positions ep ON u.employee_id = ep.employee_id WHERE e.fname LIKE '%Million%' OR u.user_name LIKE '%Million%'", (err, users) => {
  if (err) console.error(err);
  console.log('MILLION USERS:', users);

  if (users && users.length > 0) {
    const uid = users[0].user_id;
    // Check specific_objectives where org_node_ids matches or department_id matches or delegated
    con.query("SELECT so.specific_objective_id, so.specific_objective_name, so.org_node_ids, so.department_id, o.objective_id, o.name as obj_name, g.goal_id, g.name as goal_name FROM specific_objectives so LEFT JOIN objectives o ON so.objective_id = o.objective_id LEFT JOIN goals g ON o.goal_id = g.goal_id LIMIT 10", (e2, kpis) => {
      console.log('SAMPLE SPECIFIC OBJECTIVES:', kpis);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
