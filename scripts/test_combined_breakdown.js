const con = require('../models/db');

async function testCombinedTasks() {
  const query = (sql, params = []) => new Promise((resolve, reject) => {
    con.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    const userIdsQuery = "SELECT user_id, user_name FROM users WHERE status = '1'";
    const users = await query(userIdsQuery);
    const userIds = users.map(u => u.user_id);

    const breakdownQuery = `
      -- 1. Monthly tasks explicitly assigned
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
        COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
        NULL AS parent_task_name,
        'monthly' AS type
      FROM monthly_task_assignees mta
      JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
      LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE mta.user_id IN (?)
      
      UNION ALL
      
      -- 2. Weekly tasks explicitly assigned
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
        COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
        mt.name AS parent_task_name,
        'weekly' AS type
      FROM weekly_task_assignees wta
      JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id
      LEFT JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
      LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE wta.user_id IN (?)
      
      UNION ALL
      
      -- 3. Monthly tasks on action plans owned by user (where no separate assignees exist)
      SELECT 
        sod.user_id, 
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
        COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
        NULL AS parent_task_name,
        'monthly' AS type
      FROM monthly_tasks mt
      JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
      LEFT JOIN monthly_task_assignees mta ON mt.monthly_task_id = mta.monthly_task_id
      WHERE mta.id IS NULL AND sod.user_id IN (?)

      UNION ALL

      -- 4. Action plan breakdowns delegated via task_assignments
      SELECT 
        ta.assigned_to AS user_id, 
        ta.assignment_id AS task_id, 
        ta.title AS name, 
        CASE 
          WHEN ta.status IN ('completed', 'confirmed') THEN 100 
          WHEN ta.status = 'in_progress' THEN 50 
          ELSE 0 
        END AS progress, 
        0 AS weight, 
        0 AS target_amount, 
        0 AS actual_amount, 
        COALESCE(sod.measurement, '') AS unit, 
        ta.status AS status, 
        COALESCE(ta.description, '') AS notes, 
        ta.created_at AS start_date, 
        COALESCE(ta.due_date, sod.deadline) AS deadline, 
        COALESCE(sod.specific_objective_detailname, sod.name, 'Delegated Action Plan') AS action_plan_name, 
        NULL AS parent_task_name, 
        'delegated_breakdown' AS type
      FROM task_assignments ta
      LEFT JOIN specific_objective_details sod 
        ON SUBSTRING_INDEX(ta.category, ':', -1) = sod.specific_objective_detail_id
      WHERE ta.category LIKE 'action_plan_breakdown:%' AND ta.assigned_to IN (?)
    `;

    const bTasks = await query(breakdownQuery, [userIds, userIds, userIds, userIds]);
    console.log(`Total breakdown tasks found across all 4 sources: ${bTasks.length}`);
    
    const userMap = {};
    bTasks.forEach(t => {
      if (!userMap[t.user_id]) userMap[t.user_id] = [];
      userMap[t.user_id].push(t);
    });

    for (const [uid, tasks] of Object.entries(userMap)) {
      const u = users.find(x => x.user_id === Number(uid));
      console.log(`User ${uid} (${u?.user_name}): ${tasks.length} tasks:`, tasks.map(t => `${t.type}: ${t.name || '(unnamed)'} [prog: ${t.progress}%]`));
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testCombinedTasks();
