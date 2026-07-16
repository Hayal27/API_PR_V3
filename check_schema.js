const con = require('./models/db');
con.query('DESCRIBE plans', (err, res) => {
    if (err) throw err;
    res.forEach(r => console.log(r.Field));
    process.exit();
});
