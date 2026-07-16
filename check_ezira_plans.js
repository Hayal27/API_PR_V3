const con = require('./models/db');
con.query('SELECT status, reporting, COUNT(*) as count FROM plans WHERE user_id = 40 GROUP BY status, reporting', (err, res) => {
    if (err) throw err;
    console.log(JSON.stringify(res, null, 2));
    process.exit();
});
