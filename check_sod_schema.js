const con = require('./models/db');
con.query('DESCRIBE specific_objective_details', (err, res) => {
    if (err) throw err;
    res.forEach(r => console.log(r.Field));
    process.exit();
});
