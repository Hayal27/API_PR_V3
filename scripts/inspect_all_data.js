const con = require('../models/db');

async function inspectAll() {
  const query = (sql, params = []) => new Promise((resolve, reject) => {
    con.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    const counts = {};
    const tables = [
      'plans',
      'objectives',
      'specific_objectives',
      'specific_objective_details',
      'monthly_tasks',
      'monthly_task_assignees',
      'weekly_tasks',
      'weekly_task_assignees',
      'tasks',
      'daily_tasks',
      'task_assignments',
      'reports',
      'users',
      'employees'
    ];

    for (const t of tables) {
      try {
        const res = await query(`SELECT COUNT(*) as c FROM ${t}`);
        counts[t] = res[0].c;
      } catch (e) {
        counts[t] = `Error: ${e.message}`;
      }
    }
    console.log("Table Counts:", counts);

    // Let's check task_assignments details
    const tas = await query("SELECT assignment_id, title, task_description, category, assigned_to, assigned_by, status, progress FROM task_assignments LIMIT 10");
    console.log("Sample task_assignments:", tas);

    // Let's check plans
    const pls = await query("SELECT * FROM plans LIMIT 5");
    console.log("Sample plans:", pls);

    // Let's check specific_objectives
    const sos = await query("SELECT * FROM specific_objectives LIMIT 5");
    console.log("Sample specific_objectives:", sos);

    // Let's check specific_objective_details
    const sods = await query("SELECT * FROM specific_objective_details LIMIT 5");
    console.log("Sample specific_objective_details:", sods);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

inspectAll();
