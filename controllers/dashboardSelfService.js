const con = require("../models/db");

// 1. Get Dashboard Summary Stats (Active Work Breakdowns for position/department, Open Tasks, etc.)
const getDashboardStats = async (req, res) => {
    try {
        const user_id = req.user_id;
        const role_id = req.role_id;

        con.query('SELECT LOWER(role_name) as role_name FROM roles WHERE role_id = ?', [role_id], (err, roleRows) => {
            if (err) return res.status(500).json({ success: false, message: 'DB Error' });
            
            let isGlobal = false;
            if (roleRows && roleRows.length > 0) {
                const rn = roleRows[0].role_name || '';
                if (rn.includes('admin') || rn.includes('ceo') || rn.includes('deputy')) {
                    isGlobal = true;
                }
            }

            // Get user's department_id for department-wide scoping
            con.query('SELECT department_id FROM users WHERE user_id = ?', [user_id], (uErr, userRows) => {
                const userDeptId = (userRows && userRows.length > 0) ? userRows[0].department_id : null;

                const queryPromise = (sql, args) => {
                    return new Promise((resolve) => {
                        con.query(sql, args, (err, rows) => {
                            if (err || !rows || !rows[0]) resolve(0);
                            else resolve(rows[0].count || 0);
                        });
                    });
                };

                // Active Breakdown Tasks for position or department
                const activeBreakdownSql = isGlobal
                    ? `SELECT COUNT(DISTINCT mt.monthly_task_id) as count 
                       FROM monthly_tasks mt 
                       WHERE mt.status != 'completed' AND COALESCE(mt.progress, 0) < 100`
                    : `SELECT COUNT(DISTINCT mt.monthly_task_id) as count 
                       FROM monthly_tasks mt
                       LEFT JOIN monthly_task_assignees mta ON mta.monthly_task_id = mt.monthly_task_id
                       LEFT JOIN specific_objective_details sod ON sod.specific_objective_detail_id = mt.specific_objective_detail_id
                       WHERE (mt.status != 'completed' AND COALESCE(mt.progress, 0) < 100)
                         AND (mta.user_id = ? OR sod.user_id = ? OR sod.created_by = ? ${userDeptId ? 'OR mt.department_id = ?' : ''})`;

                const breakdownParams = isGlobal 
                    ? [] 
                    : (userDeptId ? [user_id, user_id, user_id, userDeptId] : [user_id, user_id, user_id]);

                // Active Task Assignments
                const openTasksSql = isGlobal
                    ? `SELECT COUNT(*) as count FROM task_assignments WHERE status != 'completed'`
                    : `SELECT COUNT(*) as count FROM task_assignments WHERE (assigned_to = ? OR assigned_by = ?) AND status != 'completed'`;

                const openTaskParams = isGlobal ? [] : [user_id, user_id];

                // Pending Reports
                const pendingReportsSql = isGlobal
                    ? `SELECT COUNT(*) as count FROM reports WHERE LOWER(status) = 'pending' OR LOWER(status) = 'submitted'`
                    : `SELECT COUNT(*) as count FROM reports WHERE user_id = ? AND (LOWER(status) = 'pending' OR LOWER(status) = 'submitted')`;

                // Approvals
                const approvalsSql = `SELECT COUNT(*) as count FROM reports WHERE LOWER(status) = 'pending'`;

                Promise.all([
                    queryPromise(activeBreakdownSql, breakdownParams),
                    queryPromise(openTasksSql, openTaskParams),
                    queryPromise(pendingReportsSql, isGlobal ? [] : [user_id]),
                    queryPromise(approvalsSql, [])
                ]).then(results => {
                    res.status(200).json({
                        success: true,
                        isGlobal,
                        stats: {
                            activePlans: results[0],
                            openTasks: results[1],
                            pendingReports: results[2],
                            approvals: results[3]
                        }
                    });
                });
            });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Get Weekly Activity Chart (Work Breakdowns, Sent Tasks, Received Tasks, Meetings over last 7 days)
const getDashboardActivityChart = async (req, res) => {
    try {
        const user_id = req.user_id;
        const role_id = req.role_id;

        con.query('SELECT LOWER(role_name) as role_name FROM roles WHERE role_id = ?', [role_id], (err, roleRows) => {
            if (err) return res.status(500).json({ success: false, message: 'DB Error' });
            
            let isGlobal = false;
            if (roleRows && roleRows.length > 0) {
                const rn = roleRows[0].role_name || '';
                if (rn.includes('admin') || rn.includes('ceo') || rn.includes('deputy')) {
                    isGlobal = true;
                }
            }

            const queryPromise = (sql, args) => {
                return new Promise((resolve) => {
                    con.query(sql, args, (err, rows) => {
                        if (err || !rows) resolve([]);
                        else resolve(rows);
                    });
                });
            };

            // Work Breakdowns created/assigned in last 7 days
            const breakdownSql = `
                SELECT DATE(mt.created_at) as date, COUNT(*) as count 
                FROM monthly_tasks mt
                LEFT JOIN monthly_task_assignees mta ON mta.monthly_task_id = mt.monthly_task_id
                WHERE mt.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                  ${isGlobal ? '' : 'AND (mta.user_id = ? OR mt.created_by = ?)'}
                GROUP BY DATE(mt.created_at)
            `;

            // Sent Tasks (assigned_by = user_id)
            const sentTasksSql = `
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM task_assignments 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                  ${isGlobal ? '' : 'AND assigned_by = ?'}
                GROUP BY DATE(created_at)
            `;

            // Received Tasks (assigned_to = user_id)
            const receivedTasksSql = `
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM task_assignments 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                  ${isGlobal ? '' : 'AND assigned_to = ?'}
                GROUP BY DATE(created_at)
            `;

            // Meeting Activities
            const meetingsSql = `
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM meetings 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                  ${isGlobal ? '' : 'AND created_by = ?'}
                GROUP BY DATE(created_at)
            `;

            const params = isGlobal ? [] : [user_id];
            const breakdownParams = isGlobal ? [] : [user_id, user_id];

            Promise.all([
                queryPromise(breakdownSql, breakdownParams),
                queryPromise(sentTasksSql, params),
                queryPromise(receivedTasksSql, params),
                queryPromise(meetingsSql, params)
            ]).then(([breakdownData, sentData, receivedData, meetingsData]) => {
                
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const result = [];

                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    
                    const bMatch = breakdownData.find(p => p.date && (new Date(p.date)).toISOString().split('T')[0] === dateStr);
                    const sMatch = sentData.find(s => s.date && (new Date(s.date)).toISOString().split('T')[0] === dateStr);
                    const rMatch = receivedData.find(r => r.date && (new Date(r.date)).toISOString().split('T')[0] === dateStr);
                    const mMatch = meetingsData.find(m => m.date && (new Date(m.date)).toISOString().split('T')[0] === dateStr);

                    result.push({
                        name: days[d.getDay()],
                        workBreakdowns: bMatch ? bMatch.count : 0,
                        sentTasks: sMatch ? sMatch.count : 0,
                        receivedTasks: rMatch ? rMatch.count : 0,
                        meetings: mMatch ? mMatch.count : 0
                    });
                }

                res.status(200).json({
                    success: true,
                    data: result
                });
            });
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Get Pillar Completion (Progress on work breakdowns assigned to me or I assigned to someone)
const getDashboardPillars = async (req, res) => {
    try {
        const user_id = req.user_id;
        const role_id = req.role_id;

        con.query('SELECT LOWER(role_name) as role_name FROM roles WHERE role_id = ?', [role_id], (err, roleRows) => {
            if (err) return res.status(500).json({ success: false, message: 'DB Error' });
            
            let isGlobal = false;
            if (roleRows && roleRows.length > 0) {
                const rn = roleRows[0].role_name || '';
                if (rn.includes('admin') || rn.includes('ceo') || rn.includes('deputy')) {
                    isGlobal = true;
                }
            }

            con.query('SELECT id, name FROM plan_pillars WHERE is_active = 1 ORDER BY sort_order', [], (err, pillars) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                if (!pillars || pillars.length === 0) return res.status(200).json({ success: true, data: [] });

                const promises = pillars.map(pillar => {
                    return new Promise((resolve) => {
                        const sql = `
                            SELECT 
                                COALESCE(AVG(COALESCE(mt.progress, CASE WHEN LOWER(mt.status) = 'completed' THEN 100 ELSE 0 END)), 0) as avg_progress,
                                COUNT(DISTINCT mt.monthly_task_id) as total_tasks,
                                SUM(CASE WHEN mt.progress >= 100 OR LOWER(mt.status) = 'completed' THEN 1 ELSE 0 END) as completed_tasks
                            FROM plan_pillars pp
                            LEFT JOIN goals g ON g.pillar_id = pp.id
                            LEFT JOIN objectives o ON o.goal_id = g.goal_id
                            LEFT JOIN specific_objectives so ON (so.goal_id = g.goal_id OR so.objective_id = o.objective_id)
                            LEFT JOIN specific_objective_details sod ON (sod.specific_objective_id = so.specific_objective_id OR sod.goal_id = g.goal_id)
                            LEFT JOIN monthly_tasks mt ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
                            LEFT JOIN monthly_task_assignees mta ON mta.monthly_task_id = mt.monthly_task_id
                            WHERE pp.id = ?
                              ${isGlobal ? '' : 'AND (mta.user_id = ? OR sod.user_id = ? OR sod.created_by = ? OR g.user_id = ?)'}
                        `;
                        const params = isGlobal ? [pillar.id] : [pillar.id, user_id, user_id, user_id, user_id];

                        con.query(sql, params, (err2, rows) => {
                            if (err2 || !rows || !rows[0]) {
                                resolve({ name: pillar.name, completion: 0, total: 0, completed: 0 });
                            } else {
                                resolve({
                                    name: pillar.name,
                                    completion: Math.round(Number(rows[0].avg_progress) || 0),
                                    total: rows[0].total_tasks || 0,
                                    completed: rows[0].completed_tasks || 0
                                });
                            }
                        });
                    });
                });

                Promise.all(promises).then(results => {
                    // Check if total tasks linked to specific pillars is 0 across all pillars
                    const allZero = results.every(r => r.total === 0);
                    if (allZero) {
                        // Calculate real user work breakdown progress from task_assignments and monthly_tasks
                        const fallbackTasksSql = `
                            SELECT 
                                (
                                    SELECT COUNT(*) FROM task_assignments 
                                    WHERE ${isGlobal ? '1=1' : '(assigned_to = ? OR assigned_by = ?)'}
                                ) as ta_total,
                                (
                                    SELECT SUM(CASE WHEN LOWER(status) = 'completed' OR LOWER(status) = 'confirmed' THEN 1 ELSE 0 END) 
                                    FROM task_assignments 
                                    WHERE ${isGlobal ? '1=1' : '(assigned_to = ? OR assigned_by = ?)'}
                                ) as ta_completed,
                                (
                                    SELECT COUNT(DISTINCT mt.monthly_task_id) 
                                    FROM monthly_tasks mt 
                                    LEFT JOIN monthly_task_assignees mta ON mta.monthly_task_id = mt.monthly_task_id 
                                    WHERE ${isGlobal ? '1=1' : '(mta.user_id = ? OR mt.created_by = ?)'}
                                ) as mt_total,
                                (
                                    SELECT SUM(CASE WHEN mt.progress >= 100 OR LOWER(mt.status) = 'completed' THEN 1 ELSE 0 END) 
                                    FROM monthly_tasks mt 
                                    LEFT JOIN monthly_task_assignees mta ON mta.monthly_task_id = mt.monthly_task_id 
                                    WHERE ${isGlobal ? '1=1' : '(mta.user_id = ? OR mt.created_by = ?)'}
                                ) as mt_completed,
                                (
                                    SELECT COALESCE(AVG(mt.progress), 0)
                                    FROM monthly_tasks mt
                                    LEFT JOIN monthly_task_assignees mta ON mta.monthly_task_id = mt.monthly_task_id 
                                    WHERE ${isGlobal ? '1=1' : '(mta.user_id = ? OR mt.created_by = ?)'}
                                ) as mt_avg_progress
                        `;

                        const fParams = isGlobal 
                            ? [] 
                            : [user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id, user_id];

                        con.query(fallbackTasksSql, fParams, (fErr, fRows) => {
                            if (!fErr && fRows && fRows[0]) {
                                const row = fRows[0];
                                const total = (row.ta_total || 0) + (row.mt_total || 0);
                                const completed = (row.ta_completed || 0) + (row.mt_completed || 0);
                                const mtProgress = Number(row.mt_avg_progress) || 0;
                                const completion = total > 0 
                                    ? Math.round(mtProgress > 0 ? mtProgress : (completed / total) * 100) 
                                    : 0;

                                const distributed = results.map(r => ({
                                    ...r,
                                    completion: completion,
                                    total: total,
                                    completed: completed
                                }));
                                return res.status(200).json({ success: true, data: distributed });
                            }
                            res.status(200).json({ success: true, data: results });
                        });
                    } else {
                        res.status(200).json({ success: true, data: results });
                    }
                });
            });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getDashboardStats, getDashboardActivityChart, getDashboardPillars };
