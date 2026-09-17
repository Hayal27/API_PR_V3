const con = require('./models/db');

con.query("SELECT DISTINCT org_node_ids, department_id FROM specific_objectives WHERE org_node_ids IS NOT NULL OR department_id IS NOT NULL", (err, rows) => {
  console.log('DISTINCT KPI NODES/DEPTS:', rows);

  con.query("SELECT pbs.*, u.user_name FROM plan_breakdown_supervisors pbs JOIN users u ON pbs.supervisor_user_id = u.user_id", (e2, del) => {
    console.log('DELEGATIONS:', del);

    con.query("SELECT id, name FROM organization_structure WHERE id IN (14, 17, 18, 10, 12, 50, 55)", (e3, orgs) => {
      console.log('ORGS:', orgs);
      process.exit(0);
    });
  });
});
