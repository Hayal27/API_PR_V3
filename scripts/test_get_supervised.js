const con = require('../models/db');

async function testGetSupervised() {
  const query = (sql, params = []) => new Promise((resolve, reject) => {
    con.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    const userId = 40;

    const allUsersQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        e.employee_id,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as name,
        COALESCE(os_main.name, pos.title, pos.name, r.role_name, 'Staff') as position,
        e.email as email,
        COALESCE(d.name, os_main.name, 'General Directorate') as department_name,
        u.avatar_url,
        e.supervisor_id,
        (SELECT CONCAT(e2.fname, ' ', e2.lname) FROM employees e2 WHERE e2.employee_id = e.supervisor_id) as supervisor_name,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'pending') as pending_tasks,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM daily_tasks dt WHERE dt.user_id = u.user_id) as daily_total,
        (SELECT COUNT(*) FROM daily_tasks dt WHERE dt.user_id = u.user_id AND dt.status IN ('done', 'completed')) as daily_completed,
        (SELECT COUNT(*) FROM task_assignments ta_cr WHERE ta_cr.assigned_by = u.user_id) as delegated_total,
        (SELECT COUNT(*) FROM task_assignments ta_cr WHERE ta_cr.assigned_by = u.user_id AND ta_cr.status IN ('completed', 'confirmed')) as delegated_completed,
        (SELECT COUNT(*) FROM task_assignments ta_rc WHERE ta_rc.assigned_to = u.user_id) as received_total,
        (SELECT COUNT(*) FROM task_assignments ta_rc WHERE ta_rc.assigned_to = u.user_id AND ta_rc.due_date IS NOT NULL AND ta_rc.due_date < NOW() AND ta_rc.status NOT IN ('completed', 'confirmed')) as received_overdue
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE u.status = '1'
      ORDER BY e.fname ASC, u.user_name ASC
    `;

    const allList = await query(allUsersQuery);
    console.log("Total active users:", allList.length);

    const filteredList = allList.filter(u => u.user_id !== userId);
    console.log("Filtered users (excluding Ezira):", filteredList.length);

    const userIds = filteredList.map(u => u.user_id);

    const breakdownQuery = `
      SELECT 
        mta.user_id, 
        mt.monthly_task_id AS task_id, 
        mt.name, 
        COALESCE(mt.progress, 0) AS progress, 
        mt.weight, 
        COALESCE(mt.plan_amount, 0) AS target_amount,
        COALESCE(mt.actual_amount, 0) AS actual_amount,
        COALESCE(sod.measurement, '') AS unit,
        COALESCE(mt.status, 'pending') AS status,
        COALESCE(mt.description, '') AS notes,
        COALESCE(mt.start_date, mt.created_at) AS start_date,
        COALESCE(mt.deadline, sod.deadline) AS deadline,
        sod.name AS action_plan_name,
        NULL AS parent_task_name,
        'monthly' AS type
      FROM monthly_task_assignees mta
      JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
      LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE mta.user_id IN (?)
      UNION ALL
      SELECT 
        wta.user_id, 
        wt.weekly_task_id AS task_id, 
        wt.name, 
        COALESCE(wt.progress, 0) AS progress, 
        wt.weight, 
        COALESCE(wt.plan_amount, 0) AS target_amount,
        COALESCE(wt.actual_amount, 0) AS actual_amount,
        COALESCE(sod.measurement, '') AS unit,
        COALESCE(wt.status, 'pending') AS status,
        COALESCE(wt.description, '') AS notes,
        COALESCE(wt.start_date, wt.created_at) AS start_date,
        COALESCE(wt.deadline, mt.deadline, sod.deadline) AS deadline,
        sod.name AS action_plan_name,
        mt.name AS parent_task_name,
        'weekly' AS type
      FROM weekly_task_assignees wta
      JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id
      LEFT JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
      LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE wta.user_id IN (?)
    `;

    const bTasks = await query(breakdownQuery, [userIds, userIds]);
    console.log("breakdown tasks found for userIds:", bTasks.length);
    console.log("Breakdown tasks:", bTasks);

    // Let's also check which users have ANY task assignments or daily tasks
    const usersWithAnyTasks = filteredList.filter(u => u.pending_tasks > 0 || u.completed_tasks > 0 || u.daily_total > 0 || u.received_total > 0);
    console.log("Users with task_assignments or daily_tasks:", usersWithAnyTasks.map(u => ({
      name: u.name,
      user_id: u.user_id,
      pending: u.pending_tasks,
      completed: u.completed_tasks,
      daily: u.daily_total,
      received: u.received_total
    })));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testGetSupervised();
