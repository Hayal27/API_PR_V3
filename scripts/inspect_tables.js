const con = require('../models/db');

con.query("SHOW COLUMNS FROM monthly_tasks", (err, rows) => {
    if (err) console.error(err);
    else console.log("monthly_tasks:", rows.map(r => r.Field).join(', '));
    
    con.query("SHOW COLUMNS FROM task_assignments", (err2, rows2) => {
        if (err2) console.error(err2);
        else console.log("task_assignments:", rows2.map(r => r.Field).join(', '));
        process.exit();
    });
});
