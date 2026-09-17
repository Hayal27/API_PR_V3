const con = require('../models/db');

con.query('SELECT action, count(*) as c FROM audit_logs GROUP BY action', (err, rows) => {
  console.log('Action counts:', rows);
  con.query(`
    SELECT DATE(created_at) as date, 
           COUNT(*) as total_events,
           SUM(action = 'LOGIN') as successful_logins,
           SUM(action = 'LOGIN_FAILED') as failed_logins,
           SUM(action = 'LOGOUT') as logouts,
           COUNT(DISTINCT user_id) as active_users
    FROM audit_logs 
    GROUP BY DATE(created_at) 
    ORDER BY date DESC 
    LIMIT 14
  `, (err2, rows2) => {
    console.log('Daily Logins summary:', rows2);
    con.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d %H:00') as hour_slot,
             COUNT(*) as count,
             SUM(action = 'LOGIN') as logins
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY hour_slot
      ORDER BY hour_slot ASC
    `, (err3, rows3) => {
      console.log('Hourly slots (past 24h):', rows3);
      process.exit(0);
    });
  });
});
