const con = require('./models/db');

const q1 = `
  SELECT 
    mta.user_id,
    u.user_name,
    CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) AS full_name,
    mt.monthly_task_id,
    mt.name AS task_name,
    mt.weight,
    mt.progress,
    mt.status,
    mt.created_at
  FROM monthly_task_assignees mta
  JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
  JOIN users u ON mta.user_id = u.user_id
  LEFT JOIN employees e ON u.employee_id = e.employee_id
`;

const q2 = `
  SELECT 
    wta.user_id,
    u.user_name,
    CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) AS full_name,
    wt.weekly_task_id,
    wt.name AS task_name,
    wt.weight,
    wt.progress,
    wt.status,
    wt.created_at
  FROM weekly_task_assignees wta
  JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id
  JOIN users u ON wta.user_id = u.user_id
  LEFT JOIN employees e ON u.employee_id = e.employee_id
`;

con.query(`${q1}; ${q2}`, (err, results) => {
  if (err) {
    console.error("Diagnostic Error:", err);
  } else {
    console.log("=== MONTHLY TASKS IN DB ===");
    console.log(JSON.stringify(results[0], null, 2));
    console.log("=== WEEKLY TASKS IN DB ===");
    console.log(JSON.stringify(results[1], null, 2));
  }
  process.exit(0);
});
