const con = require('../models/db');

async function testSubordinateDetailsQueries() {
  const query = (sql, params = []) => new Promise((resolve, reject) => {
    con.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    const subordinateUserId = 85; // Addis Asefa

    const userQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        e.employee_id,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as name,
        COALESCE(os_main.name, pos.title, pos.name, r.role_name, 'Staff') as position,
        e.email,
        COALESCE(d.name, os_main.name, 'General Directorate') as department_name,
        u.avatar_url,
        e.supervisor_id,
        (SELECT CONCAT(e2.fname, ' ', e2.lname) FROM employees e2 WHERE e2.employee_id = e.supervisor_id) as supervisor_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE u.user_id = ?
    `;

    const dailyTasksQuery = `
      SELECT 
        daily_task_id,
        title,
        description,
        priority,
        status,
        task_date,
        start_time,
        end_time,
        category,
        notes,
        created_at
      FROM daily_tasks
      WHERE user_id = ?
      ORDER BY COALESCE(task_date, created_at) DESC, created_at DESC
      LIMIT 100
    `;

    const delegatedTasksQuery = `
      SELECT 
        ta.assignment_id,
        ta.title,
        ta.description,
        ta.priority,
        ta.category,
        ta.status,
        ta.due_date,
        ta.created_at,
        ta.completed_at,
        ta.confirmed_at,
        ta.completion_note,
        ta.assigned_to,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as assignee_name,
        COALESCE(os_main.name, pos.title, pos.name, 'Staff') as assignee_position,
        COALESCE(d.name, 'General Directorate') as assignee_department,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() AND ta.status NOT IN ('completed', 'confirmed') THEN 1 
          ELSE 0 
        END as is_overdue,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() AND ta.status NOT IN ('completed', 'confirmed') THEN DATEDIFF(NOW(), ta.due_date)
          ELSE 0 
        END as days_overdue
      FROM task_assignments ta
      JOIN users u ON ta.assigned_to = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE ta.assigned_by = ?
      ORDER BY ta.created_at DESC
      LIMIT 100
    `;

    const receivedTasksQuery = `
      SELECT 
        ta.assignment_id,
        ta.title,
        ta.description,
        ta.priority,
        ta.category,
        ta.status,
        ta.due_date,
        ta.created_at,
        ta.completed_at,
        ta.confirmed_at,
        ta.completion_note,
        ta.assigned_by,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as assigner_name,
        COALESCE(os_main.name, pos.title, pos.name, 'Supervisor') as assigner_position,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() AND ta.status NOT IN ('completed', 'confirmed') THEN 1 
          ELSE 0 
        END as is_overdue,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() AND ta.status NOT IN ('completed', 'confirmed') THEN DATEDIFF(NOW(), ta.due_date)
          ELSE 0 
        END as days_overdue
      FROM task_assignments ta
      LEFT JOIN users u ON ta.assigned_by = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE ta.assigned_to = ?
      ORDER BY ta.created_at DESC
      LIMIT 100
    `;

    const [u, dt, del, rec] = await Promise.all([
      query(userQuery, [subordinateUserId]),
      query(dailyTasksQuery, [subordinateUserId]),
      query(delegatedTasksQuery, [subordinateUserId]),
      query(receivedTasksQuery, [subordinateUserId])
    ]);

    console.log("Subordinate user:", u[0]?.name);
    console.log("Daily tasks:", dt.length);
    console.log("Delegated tasks:", del.length);
    console.log("Received tasks:", rec.length, rec.map(r => ({ title: r.title, status: r.status, is_overdue: r.is_overdue })));

    process.exit(0);
  } catch (e) {
    console.error("Error testing queries:", e);
    process.exit(1);
  }
}

testSubordinateDetailsQueries();
