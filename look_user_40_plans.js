const con = require('./models/db');
con.query('SELECT plan_id, goal_id, objective_id, department_id, specific_objective_id, specific_objective_detail_id FROM plans WHERE user_id = 40 LIMIT 5', (err, res) => {
    if (err) throw err;
    console.log(JSON.stringify(res, null, 2));
    process.exit();
});
