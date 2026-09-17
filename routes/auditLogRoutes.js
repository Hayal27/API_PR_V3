const express = require('express');
const router = express.Router();
const { getAuditLogs, getAuditStats, AUDIT_ACTIONS } = require('../middleware/auditLogger');
const con = require('../models/db');

/**
 * @route   GET /api/audit-logs
 * @desc    Get audit logs with filtering and pagination
 * @query   user_id, action, action_category, severity, start_date, end_date, limit, offset, search, employee_name
 */
router.get('/', getAuditLogs);

/**
 * @route   GET /api/audit-logs/stats
 * @desc    Get audit log statistics and analytics
 */
router.get('/stats', getAuditStats);

/**
 * @route   GET /api/audit-logs/actions
 * @desc    All defined audit action types
 */
router.get('/actions', (req, res) => {
    res.json({ success: true, data: Object.values(AUDIT_ACTIONS).sort() });
});

/**
 * @route   GET /api/audit-logs/users
 * @desc    Distinct users who have audit log entries (for filter dropdown)
 */
router.get('/users', (req, res) => {
    const q = `
        SELECT DISTINCT
            al.user_id,
            u.user_name,
            e.name AS employee_name,
            r.role_name,
            COUNT(*) AS event_count
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE al.user_id IS NOT NULL
        GROUP BY al.user_id, u.user_name, e.name, r.role_name
        ORDER BY event_count DESC
        LIMIT 200
    `;
    con.query(q, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: results });
    });
});

/**
 * @route   GET /api/audit-logs/volume
 * @desc    Daily event volume for the past N days (chart data)
 * @query   days (default 30)
 */
router.get('/volume', (req, res) => {
    const days = Math.min(parseInt(req.query.days) || 30, 365);
    const q = `
        SELECT
            DATE(created_at) AS date,
            COUNT(*) AS total,
            SUM(action IN ('LOGIN','LOGOUT','LOGIN_FAILED','SESSION_EXPIRED')) AS auth_events,
            SUM(action LIKE '%CREATE%' OR action LIKE '%ADD%') AS create_events,
            SUM(action LIKE '%DELETE%' OR action LIKE '%REMOVE%') AS delete_events,
            SUM(action IN ('LOGIN_FAILED','SYSTEM_ERROR')) AS security_events
        FROM audit_logs
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
    `;
    con.query(q, [days], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: results, days });
    });
});

/**
 * @route   GET /api/audit-logs/login-sessions
 * @desc    Detailed daily login sessions, unique users, failed logins and online status for line charts
 * @query   days (default 14, supports 7, 14, 30)
 */
router.get('/login-sessions', (req, res) => {
    const days = Math.min(Math.max(parseInt(req.query.days) || 14, 3), 90);

    const trendQuery = `
        SELECT 
            DATE(created_at) AS date_val,
            DATE_FORMAT(created_at, '%b %d') AS label,
            SUM(CASE WHEN action = 'LOGIN' THEN 1 ELSE 0 END) AS logins,
            SUM(CASE WHEN action = 'LOGIN_FAILED' THEN 1 ELSE 0 END) AS failed,
            SUM(CASE WHEN action = 'LOGOUT' THEN 1 ELSE 0 END) AS logouts,
            COUNT(DISTINCT CASE WHEN action = 'LOGIN' THEN user_id ELSE NULL END) AS active_users
        FROM audit_logs
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%b %d')
        ORDER BY date_val ASC
    `;

    const summaryQuery = `
        SELECT 
            COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) AS total_logins,
            COUNT(CASE WHEN action = 'LOGOUT' THEN 1 END) AS total_logouts,
            COUNT(CASE WHEN action = 'LOGIN_FAILED' THEN 1 END) AS total_failed,
            COUNT(DISTINCT CASE WHEN action = 'LOGIN' THEN user_id END) AS unique_users,
            ROUND((COUNT(CASE WHEN action = 'LOGIN' THEN 1 END) / 
                  NULLIF(COUNT(CASE WHEN action IN ('LOGIN', 'LOGIN_FAILED') THEN 1 END), 0)) * 100, 1) AS success_rate
        FROM audit_logs
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `;

    const onlineQuery = `SELECT COUNT(*) AS online_count FROM users WHERE online_flag = 1`;

    con.query(trendQuery, [days], (err1, trendRows) => {
        if (err1) return res.status(500).json({ success: false, error: err1.message });

        con.query(summaryQuery, [days], (err2, summaryRows) => {
            if (err2) return res.status(500).json({ success: false, error: err2.message });

            con.query(onlineQuery, (err3, onlineRows) => {
                const onlineCount = (!err3 && onlineRows && onlineRows.length > 0) ? onlineRows[0].online_count : 0;
                const summary = summaryRows[0] || {};

                // Find peak activity day
                let peakDay = { label: 'None', count: 0 };
                (trendRows || []).forEach(r => {
                    const l = Number(r.logins || 0);
                    if (l > peakDay.count) {
                        peakDay = { label: r.label, count: l, date: r.date_val };
                    }
                });

                res.json({
                    success: true,
                    days,
                    timeline: (trendRows || []).map(r => ({
                        date: r.date_val,
                        label: r.label,
                        logins: Number(r.logins || 0),
                        failed: Number(r.failed || 0),
                        logouts: Number(r.logouts || 0),
                        activeUsers: Number(r.active_users || 0)
                    })),
                    summary: {
                        totalLogins: Number(summary.total_logins || 0),
                        totalLogouts: Number(summary.total_logouts || 0),
                        totalFailed: Number(summary.total_failed || 0),
                        uniqueUsers: Number(summary.unique_users || 0),
                        successRate: summary.success_rate !== null ? Number(summary.success_rate) : 100,
                        onlineUsers: onlineCount,
                        peakDay
                    }
                });
            });
        });
    });
});


/**
 * @route   GET /api/audit-logs/summary
 * @desc    Quick summary counts by category for dashboard cards
 */
router.get('/summary', (req, res) => {
    const q = `
        SELECT
            COUNT(*) AS total,
            SUM(action = 'LOGIN') AS logins,
            SUM(action = 'LOGIN_FAILED') AS failed_logins,
            SUM(action = 'LOGOUT') AS logouts,
            SUM(action IN ('LOGIN_FAILED','SYSTEM_ERROR','USER_DELETE','EMPLOYEE_DELETE','ROLE_DELETE','MENU_DELETE')) AS high_severity,
            SUM(action IN ('PLAN_DECLINE','REPORT_DECLINE','PERMISSION_UPDATE','ROLE_UPDATE','MENU_UPDATE')) AS medium_severity,
            SUM(DATE(created_at) = CURDATE()) AS today_events,
            COUNT(DISTINCT user_id) AS unique_users
        FROM audit_logs
    `;
    con.query(q, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: results[0] });
    });
});

/**
 * @route   GET /api/audit-logs/user/:userId
 * @desc    All audit logs for a specific user
 */
router.get('/user/:userId', (req, res) => {
    req.query.user_id = req.params.userId;
    req.query.limit = req.query.limit || 50;
    req.query.offset = req.query.offset || 0;
    getAuditLogs(req, res);
});

module.exports = router;
