const con = require('./models/db');

const alterMonthlyTasks = `
  ALTER TABLE monthly_tasks
  ADD COLUMN description TEXT,
  ADD COLUMN attachment VARCHAR(255);
`;

const alterWeeklyTasks = `
  ALTER TABLE weekly_tasks
  ADD COLUMN description TEXT,
  ADD COLUMN attachment VARCHAR(255);
`;

con.query(alterMonthlyTasks, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist in monthly_tasks');
        } else {
            console.error('Error altering monthly_tasks:', err);
        }
    } else {
        console.log('monthly_tasks altered successfully');
    }

    con.query(alterWeeklyTasks, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Columns already exist in weekly_tasks');
            } else {
                console.error('Error altering weekly_tasks:', err);
            }
        } else {
            console.log('weekly_tasks altered successfully');
        }
        process.exit();
    });
});
