const con = require('./models/db');
con.query('SELECT user_id, name, email, role_id FROM users WHERE name LIKE "%Ezira%"', (err, res) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(res, null, 2));
    process.exit();
});
