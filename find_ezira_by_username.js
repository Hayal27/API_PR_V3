const con = require('./models/db');
con.query('SELECT user_id, user_name, role_id FROM users WHERE user_name LIKE "%Ezira%"', (err, res) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(res, null, 2));
    process.exit();
});
