const con = require('../models/db');

async function inspect() {
  const query = (sql, params = []) => new Promise((resolve, reject) => {
    con.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    console.log('--- Inspecting DB ---');
    
    // Check tables
    const tables = await query("SHOW TABLES");
    console.log("Tables:", tables.map(t => Object.values(t)[0]).filter(t => t.includes('task') || t.includes('plan') || t.includes('objective') || t.includes('report')));

    // Count rows
    for (const tbl of ['monthly_tasks', 'monthly_task_assignees', 'weekly_tasks', 'weekly_task_assignees', 'specific_objective_details', 'task_assignments', 'reports']) {
      try {
        const count = await query(`SELECT COUNT(*) as cnt FROM ${tbl}`);
        console.log(`Count in ${tbl}:`, count[0].cnt);
      } catch (e) {
        console.log(`Error counting ${tbl}:`, e.message);
      }
    }

    // Sample from monthly_tasks
    try {
      const mtSample = await query("SELECT * FROM monthly_tasks LIMIT 5");
      console.log("Sample monthly_tasks:", mtSample);
    } catch (e) {
      console.log("Error reading monthly_tasks:", e.message);
    }

    // Sample from monthly_task_assignees
    try {
      const mtaSample = await query("SELECT * FROM monthly_task_assignees LIMIT 5");
      console.log("Sample monthly_task_assignees:", mtaSample);
    } catch (e) {
      console.log("Error reading monthly_task_assignees:", e.message);
    }

    // Sample from specific_objective_details
    try {
      const sodSample = await query("SELECT specific_objective_detail_id, specific_objective_id, name, target, actual, user_id FROM specific_objective_details LIMIT 5");
      console.log("Sample specific_objective_details:", sodSample);
    } catch (e) {
      console.log("Error reading specific_objective_details:", e.message);
    }

    process.exit(0);
  } catch (err) {
    console.error("General error:", err);
    process.exit(1);
  }
}

inspect();
