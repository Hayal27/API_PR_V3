const con = require('../models/db');

async function check() {
  con.query(`
    SELECT 
      DATE(created_at) as date_val,
      DATE_FORMAT(created_at, '%b %d') as formatted_date,
      SUM(CASE WHEN action = 'LOGIN' THEN 1 ELSE 0 END) as logins,
      SUM(CASE WHEN action = 'LOGIN_FAILED' THEN 1 ELSE 0 END) as failed_logins,
      SUM(CASE WHEN action = 'LOGOUT' THEN 1 ELSE 0 END) as logouts,
      COUNT(DISTINCT CASE WHEN action = 'LOGIN' THEN user_id ELSE NULL END) as active_users
    FROM audit_logs
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
    ORDER BY date_val ASC
  `, (err, rows) => {
    console.log('Login Sessions Trend (30 days):', rows);

    con.query(`
      SELECT 
        COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) as total_logins,
        COUNT(CASE WHEN action = 'LOGOUT' THEN 1 END) as total_logouts,
        COUNT(CASE WHEN action = 'LOGIN_FAILED' THEN 1 END) as total_failed,
        COUNT(DISTINCT CASE WHEN action = 'LOGIN' THEN user_id END) as unique_active_users,
        ROUND((COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) / 
              NULLIF(COUNT(CASE WHEN action IN ('LOGIN', 'LOGIN_FAILED') THEN 1 END), 0)) * 100, 1) as auth_success_rate
      FROM audit_logs
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `, (err2, stats) => {
      console.log('30-day stats:', stats);

      con.query(`
        SELECT COUNT(*) as online_count FROM users WHERE online_flag = 1
      `, (err3, online) => {
        console.log('Online users count:', online);
        process.exit(0);
      });
    });
  });
}
check();
