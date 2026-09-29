const con = require('../models/db');

async function inspectTaskAssignments() {
  const query = (sql, params = []) => new Promise((resolve, reject) => {
    con.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    const cols = await query("SHOW COLUMNS FROM task_assignments");
    console.log("task_assignments columns:", cols.map(c => c.Field));

    const rows = await query("SELECT * FROM task_assignments");
    console.log("task_assignments count:", rows.length);
    console.log("task_assignments rows:", JSON.stringify(rows, null, 2));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

inspectTaskAssignments();
