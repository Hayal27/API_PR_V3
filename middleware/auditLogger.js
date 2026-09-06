const con = require('../models/db');

/**
 * Enterprise-level Audit Logger Middleware
 * Tracks all user activities from login to logout with detailed metadata
 */

// Action types for audit logging
const AUDIT_ACTIONS = {
    // Authentication
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    LOGIN_FAILED: 'LOGIN_FAILED',
    SESSION_EXPIRED: 'SESSION_EXPIRED',

    // User Management
    USER_CREATE: 'USER_CREATE',
    USER_UPDATE: 'USER_UPDATE',
    USER_DELETE: 'USER_DELETE',
    USER_STATUS_CHANGE: 'USER_STATUS_CHANGE',
    PASSWORD_CHANGE: 'PASSWORD_CHANGE',

    // Employee Management
    EMPLOYEE_CREATE: 'EMPLOYEE_CREATE',
    EMPLOYEE_UPDATE: 'EMPLOYEE_UPDATE',
    EMPLOYEE_DELETE: 'EMPLOYEE_DELETE',

    // Plan Management
    PLAN_CREATE: 'PLAN_CREATE',
    PLAN_UPDATE: 'PLAN_UPDATE',
    PLAN_DELETE: 'PLAN_DELETE',
    PLAN_SUBMIT: 'PLAN_SUBMIT',
    PLAN_APPROVE: 'PLAN_APPROVE',
    PLAN_DECLINE: 'PLAN_DECLINE',
    PLAN_VIEW: 'PLAN_VIEW',

    // Report Management
    REPORT_CREATE: 'REPORT_CREATE',
    REPORT_UPDATE: 'REPORT_UPDATE',
    REPORT_DELETE: 'REPORT_DELETE',
    REPORT_SUBMIT: 'REPORT_SUBMIT',
    REPORT_APPROVE: 'REPORT_APPROVE',
    REPORT_DECLINE: 'REPORT_DECLINE',
    REPORT_VIEW: 'REPORT_VIEW',

    // Permission Management
    PERMISSION_UPDATE: 'PERMISSION_UPDATE',
    ROLE_CREATE: 'ROLE_CREATE',
    ROLE_UPDATE: 'ROLE_UPDATE',
    ROLE_DELETE: 'ROLE_DELETE',
    MENU_CREATE: 'MENU_CREATE',
    MENU_UPDATE: 'MENU_UPDATE',
    MENU_DELETE: 'MENU_DELETE',

    // File Operations
    FILE_UPLOAD: 'FILE_UPLOAD',
    FILE_DOWNLOAD: 'FILE_DOWNLOAD',
    FILE_DELETE: 'FILE_DELETE',

    // Meeting Management
    MEETING_CREATE: 'MEETING_CREATE',
    MEETING_UPDATE: 'MEETING_UPDATE',
    MEETING_DELETE: 'MEETING_DELETE',
    MEETING_JOIN: 'MEETING_JOIN',
    MEETING_LEAVE: 'MEETING_LEAVE',
    MEETING_END: 'MEETING_END',
    MEETING_POSTPONE: 'MEETING_POSTPONE',

    // Task Management
    TASK_CREATE: 'TASK_CREATE',
    TASK_UPDATE: 'TASK_UPDATE',
    TASK_DELETE: 'TASK_DELETE',
    TASK_COMPLETE: 'TASK_COMPLETE',

    // Notification
    NOTIFICATION_SEND: 'NOTIFICATION_SEND',
    NOTIFICATION_READ: 'NOTIFICATION_READ',

    // System
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    SYSTEM_START: 'SYSTEM_START',
    DATA_EXPORT: 'DATA_EXPORT',
    SETTINGS_CHANGE: 'SETTINGS_CHANGE',

    // Page Views
    PAGE_VIEW: 'PAGE_VIEW',
    DASHBOARD_VIEW: 'DASHBOARD_VIEW',
};

/**
 * Log an audit entry to the database
 * @param {number|null} userId - User ID performing the action (null for system actions)
 * @param {string} action - Action type from AUDIT_ACTIONS
 * @param {string} description - Human-readable description of the action
 * @param {object} metadata - Additional metadata (will be stored as JSON)
 * @param {object} req - Express request object (optional, for extracting IP, user agent, etc.)
 */
const logAudit = (userId, action, description, metadata = {}, req = null) => {
    return new Promise((resolve) => {
        try {
            const metaObj = (typeof metadata === 'object' && metadata !== null) ? metadata : { info: String(metadata) };
            const enrichedMetadata = {
                ...metaObj,
                timestamp: new Date().toISOString(),
                ip_address: req ? (req.ip || req.connection?.remoteAddress) : null,
                user_agent: req ? (typeof req.get === 'function' ? req.get('user-agent') : null) : null,
                endpoint: req ? req.originalUrl : null,
                method: req ? req.method : null,
            };

            const query = `
              INSERT INTO audit_logs (user_id, action, description, metadata, created_at)
              VALUES (?, ?, ?, ?, NOW())
            `;

            con.query(
                query,
                [userId, action, description, JSON.stringify(enrichedMetadata)],
                (err, result) => {
                    if (err) {
                        console.warn('Notice: Audit log error (non-critical):', err.message);
                    } else {
                        console.log(`✅ Audit Log: ${action} - ${description}`);
                    }
                    resolve(result || null);
                }
            );
        } catch (err) {
            console.warn('Notice: Exception in logAudit:', err.message);
            resolve(null);
        }
    });
};

/**
 * Middleware to automatically log all API requests
 */
const auditMiddleware = (req, res, next) => {
    // Skip logging for certain endpoints to avoid noise
    const skipPaths = ['/api/audit-logs', '/uploads'];
    const shouldSkip = skipPaths.some(path => req.path.startsWith(path));

    if (shouldSkip) {
        return next();
    }

    // Extract user ID from JWT token if available
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, 'hayaltamrat@27');
            userId = decoded.user_id;
        } catch (err) {
            // Token invalid or expired, continue without user ID
        }
    }

    // Log the request
    const action = 'PAGE_VIEW';
    const description = `${req.method} ${req.path}`;
    const metadata = {
        query: req.query,
        body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    };

    // Don't wait for audit log to complete
    logAudit(userId, action, description, metadata, req).catch(err => {
        console.error('Failed to log audit:', err);
    });

    next();
};

/**
 * Sanitize request body to remove sensitive information
 */
const sanitizeBody = (body) => {
    if (!body) return {};

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'pass', 'token', 'secret'];

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

/**
 * Get audit logs with filtering and pagination
 */
const getAuditLogs = (req, res) => {
    const {
        user_id, action, action_category,
        start_date, end_date,
        limit = 100, offset = 0,
        search, employee_name: empNameFilter, severity,
    } = req.query;

    // Category → action list mapping
    const CATEGORY_MAP = {
        auth:        ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'SESSION_EXPIRED'],
        users:       ['USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DELETE', 'CREATE_ROLE', 'UPDATE_ROLE'],
        plans:       ['PLAN_CREATE', 'PLAN_UPDATE', 'PLAN_DELETE', 'PLAN_SUBMIT', 'PLAN_APPROVE', 'PLAN_DECLINE'],
        reports:     ['REPORT_CREATE', 'REPORT_UPDATE', 'REPORT_SUBMIT', 'REPORT_APPROVE', 'REPORT_DECLINE'],
        permissions: ['PERMISSION_UPDATE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE', 'MENU_CREATE', 'MENU_UPDATE', 'MENU_DELETE'],
        tasks:       ['TASK_CREATE', 'TASK_UPDATE', 'TASK_DELETE', 'TASK_COMPLETE'],
        meetings:    ['MEETING_CREATE', 'MEETING_UPDATE', 'MEETING_DELETE', 'MEETING_JOIN', 'MEETING_END'],
        files:       ['FILE_UPLOAD', 'FILE_DOWNLOAD', 'FILE_DELETE', 'DATA_EXPORT'],
        system:      ['SYSTEM_ERROR', 'SYSTEM_START', 'SETTINGS_CHANGE'],
        high:        ['LOGIN_FAILED', 'SYSTEM_ERROR', 'USER_DELETE', 'EMPLOYEE_DELETE', 'ROLE_DELETE', 'MENU_DELETE'],
        medium:      ['PLAN_DECLINE', 'REPORT_DECLINE', 'PERMISSION_UPDATE', 'ROLE_UPDATE', 'MENU_UPDATE'],
    };

    const buildConditions = () => {
        let q = '';
        const p = [];

        if (user_id)  { q += ' AND al.user_id = ?'; p.push(user_id); }

        if (action) {
            q += ' AND al.action = ?'; p.push(action);
        } else if (action_category && CATEGORY_MAP[action_category]) {
            const ph = CATEGORY_MAP[action_category].map(() => '?').join(',');
            q += ` AND al.action IN (${ph})`; p.push(...CATEGORY_MAP[action_category]);
        } else if (severity && CATEGORY_MAP[severity]) {
            const ph = CATEGORY_MAP[severity].map(() => '?').join(',');
            q += ` AND al.action IN (${ph})`; p.push(...CATEGORY_MAP[severity]);
        }

        if (start_date) { q += ' AND al.created_at >= ?'; p.push(start_date); }
        if (end_date)   { q += ' AND al.created_at <= ?'; p.push(end_date); }

        if (search) {
            q += ' AND (al.description LIKE ? OR al.action LIKE ? OR u.user_name LIKE ? OR e.name LIKE ?)';
            p.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (empNameFilter) {
            q += ' AND (e.name LIKE ? OR u.user_name LIKE ?)';
            p.push(`%${empNameFilter}%`, `%${empNameFilter}%`);
        }

        return { q, p };
    };

    const { q: conditions, p: params } = buildConditions();

    const mainQuery = `
    SELECT al.*, u.user_name, e.name as employee_name,
           e.fname, e.lname, r.role_name
    FROM audit_logs al
    LEFT JOIN users u ON al.user_id = u.user_id
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    LEFT JOIN roles r ON u.role_id = r.role_id
    WHERE 1=1 ${conditions}
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?
  `;
    const mainParams = [...params, parseInt(limit), parseInt(offset)];

    con.query(mainQuery, mainParams, (err, results) => {
        if (err) {
            console.error('Error fetching audit logs:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: err.message });
        }

        const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE 1=1 ${conditions}
    `;

        con.query(countQuery, params, (err, countResults) => {
            if (err) {
                console.error('Error counting audit logs:', err);
                return res.status(500).json({ success: false, message: 'Failed to count audit logs', error: err.message });
            }

            res.json({
                success: true,
                data: results,
                pagination: {
                    total: countResults[0].total,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + results.length) < countResults[0].total
                }
            });
        });
    });
};



/**
 * Get audit log statistics
 */
const getAuditStats = (req, res) => {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];

    if (start_date) {
        dateFilter += ' AND created_at >= ?';
        params.push(start_date);
    }

    if (end_date) {
        dateFilter += ' AND created_at <= ?';
        params.push(end_date);
    }

    const queries = {
        totalLogs: `SELECT COUNT(*) as count FROM audit_logs WHERE 1=1 ${dateFilter}`,
        actionBreakdown: `
      SELECT action, COUNT(*) as count 
      FROM audit_logs 
      WHERE 1=1 ${dateFilter}
      GROUP BY action 
      ORDER BY count DESC 
      LIMIT 10
    `,
        topUsers: `
      SELECT 
        al.user_id,
        u.user_name,
        e.name as employee_name,
        COUNT(*) as activity_count
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE al.user_id IS NOT NULL ${dateFilter}
      GROUP BY al.user_id, u.user_name, e.name
      ORDER BY activity_count DESC
      LIMIT 10
    `,
        recentActivity: `
      SELECT 
        al.*,
        u.user_name,
        e.name as employee_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE 1=1 ${dateFilter}
      ORDER BY al.created_at DESC
      LIMIT 20
    `
    };

    const results = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        con.query(query, params, (err, data) => {
            if (err) {
                console.error(`Error in ${key} query:`, err);
                results[key] = { error: err.message };
            } else {
                results[key] = key === 'totalLogs' ? data[0].count : data;
            }

            completed++;
            if (completed === totalQueries) {
                res.json({
                    success: true,
                    data: results
                });
            }
        });
    });
};

module.exports = {
    logAudit,
    auditMiddleware,
    getAuditLogs,
    getAuditStats,
    AUDIT_ACTIONS
};
