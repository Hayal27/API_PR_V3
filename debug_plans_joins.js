const con = require('./models/db');
const user_id = 40;

const getPlansQuery = `
    SELECT 
      p.plan_id AS Plan_ID,
      p.user_id AS User_ID,
      g.name AS Goal,
      o.name AS Objective,
      so.specific_objective_name AS SpecificObjective,
      sod.details AS Specific_Objective_Detail,
      p.reporting
    FROM plans p
    LEFT JOIN goals g ON p.goal_id = g.goal_id
    LEFT JOIN objectives o ON p.objective_id = o.objective_id
    LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
    LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
    WHERE p.user_id = ? AND (p.reporting = 'active' OR p.reporting = 'deactivate')
    GROUP BY p.plan_id
`;

con.query(getPlansQuery, [user_id], (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Total plans:", results.length);
    if (results.length > 0) {
        console.log("First plan:", JSON.stringify(results[0], null, 2));
    }
    process.exit(0);
});
