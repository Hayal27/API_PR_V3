const con = require('./models/db');
const user_id = 40;
const getPlansQuery = `
    SELECT 
      p.plan_id AS Plan_ID,
      p.user_id AS User_ID,
      p.reporting
    FROM plans p
    WHERE p.user_id = ? AND (p.reporting = ? OR p.reporting = ?)
`;
con.query(getPlansQuery, [user_id, 'active', 'deactivate'], (err, results) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
});
