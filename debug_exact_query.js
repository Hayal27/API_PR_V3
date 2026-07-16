const con = require('./models/db');

const user_id = 40;
const filterValues = [user_id, 'active', 'deactivate'];
const whereClause = "WHERE p.user_id = ? AND (p.reporting = ? OR p.reporting = ?)";

const countQuery = `
  SELECT COUNT(DISTINCT p.plan_id) AS total
  FROM plans p
  LEFT JOIN departments d ON p.department_id = d.department_id
  LEFT JOIN goals g ON p.goal_id = g.goal_id
  LEFT JOIN objectives o ON p.objective_id = o.objective_id
  LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
  LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
  ${whereClause}
`;

con.query(countQuery, filterValues, (err, res) => {
    if (err) throw err;
    console.log("Count result:", res);

    const getPlansQuery = `
      SELECT 
        p.plan_id AS Plan_ID,
        p.user_id AS User_ID,
        p.status AS Plan_Status
      FROM plans p
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      ${whereClause}
      GROUP BY p.plan_id
      ORDER BY p.created_at DESC
      LIMIT 10 OFFSET 0
    `;

    con.query(getPlansQuery, [...filterValues, 10, 0], (err2, res2) => {
        if (err2) throw err2;
        console.log("Plans found:", res2.length);
        if (res2.length > 0) {
            console.log("First Plan ID:", res2[0].Plan_ID);
        }
        process.exit();
    });
});
