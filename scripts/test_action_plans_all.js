const con = require('../models/db');

async function testActionPlansAll() {
  const query = (sql, params = []) => new Promise((resolve, reject) => {
    con.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  try {
    const userId = 40;
    const isPrivileged = true;

    let sql = `
      SELECT
        sod.specific_objective_detail_id AS id,
        COALESCE(sod.specific_objective_detailname, sod.name, sod.details, 'Action Plan') AS name,
        sod.details,
        sod.baseline,
        sod.plan,
        sod.CIplan,
        sod.CIbaseline,
        sod.outcome,
        sod.CIoutcome,
        sod.priority,
        sod.status,
        sod.measurement,
        sod.plan_type,
        sod.income_exchange,
        sod.cost_type,
        sod.employment_type,
        sod.project_type,
        sod.income_plan_type,
        sod.incomeName,
        sod.costName,
        sod.employee_of,
        COALESCE(sod.weight, sod.plan, 0) AS weight,
        COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0) AS progress,
        COALESCE(sod.starting_date, sod.created_at) AS starting_date,
        sod.deadline,
        sod.created_at,
        so.specific_objective_id,
        COALESCE(so.specific_objective_name, so.name, 'KPI') AS kpi_name,
        so.weight AS kpi_weight,
        o.objective_id,
        COALESCE(o.name, 'Objective') AS objective_name,
        o.weight AS objective_weight,
        g.goal_id,
        COALESCE(g.name, 'Goal') AS goal_name,
        g.year,
        g.quarter,
        CONCAT(COALESCE(e.fname, ''), ' ', COALESCE(e.lname, '')) AS owner_name,
        u.user_id AS owner_user_id,
        COALESCE(pos.title, pos.name, 'Staff') AS owner_position,
        COALESCE(os.name_amharic, os.name, 'General Directorate') AS department_name,
        (SELECT COUNT(*) FROM monthly_tasks mt WHERE mt.specific_objective_detail_id = sod.specific_objective_detail_id) AS breakdown_tasks_count,
        (SELECT CONCAT(COALESCE(e2.fname, u2.user_name), ' ', COALESCE(e2.lname, '')) FROM task_assignments ta JOIN users u2 ON ta.assigned_to = u2.user_id LEFT JOIN employees e2 ON u2.employee_id = e2.employee_id WHERE ta.category = CONCAT('action_plan_breakdown:', sod.specific_objective_detail_id) ORDER BY ta.created_at DESC LIMIT 1) AS delegated_to_name,
        (SELECT ta.created_at FROM task_assignments ta WHERE ta.category = CONCAT('action_plan_breakdown:', sod.specific_objective_detail_id) ORDER BY ta.created_at DESC LIMIT 1) AS delegated_at,
        (SELECT ta.status FROM task_assignments ta WHERE ta.category = CONCAT('action_plan_breakdown:', sod.specific_objective_detail_id) ORDER BY ta.created_at DESC LIMIT 1) AS delegated_status
      FROM specific_objective_details sod
      JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
      JOIN objectives o ON so.objective_id = o.objective_id
      JOIN goals g ON o.goal_id = g.goal_id
      LEFT JOIN users u ON sod.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
      LEFT JOIN positions pos ON ep.position_id = pos.position_id
      LEFT JOIN organization_structure os ON COALESCE(ep.org_node_id, e.department_id) = os.id
      LEFT JOIN action_plan_quarter_activations apqa 
        ON apqa.specific_objective_detail_id = sod.specific_objective_detail_id
    `;

    const plans = await query(sql);
    console.log(`Action plans returned: ${plans.length}`);
    console.log(plans.map(p => ({
      id: p.id,
      name: p.name,
      owner: p.owner_name,
      kpi: p.kpi_name,
      breakdown_tasks_count: p.breakdown_tasks_count,
      delegated_to: p.delegated_to_name,
      progress: p.progress
    })));

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testActionPlansAll();
