const con = require('../models/db');

async function checkEzira() {
  con.query("SELECT user_id, user_name, email, role_id, employee_id FROM users WHERE user_name LIKE '%ezira%' OR email LIKE '%ezira%'", (err, rows) => {
    if (err) console.error(err);
    else console.log("Ezira user:", rows);
    process.exit(0);
  });
}

checkEzira();
