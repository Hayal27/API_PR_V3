const con = require("../models/db");

// Helper for promise-based query
const queryPromise = (sql, args = []) => {
    return new Promise((resolve) => {
        con.query(sql, args, (err, rows) => {
            if (err) {
                console.error("Dashboard query error:", err.message, "SQL:", sql.substring(0, 100));
                resolve([]);
            } else {
                resolve(rows || []);
            }
        });
    });
};

// 1. Get Dashboard Summary Stats (Daily Tasks, Sent Tasks, Received Tasks, Work Breakdowns, etc.)
const getDashboardStats = async (req, res) => {
    try {
        const user_id = req.user_id;
        const role_id = req.role_id;

        con.query('SELECT LOWER(role_name) as role_name FROM roles WHERE role_id = ?', [role_id], async (err, roleRows) => {
            if (err) return res.status(500).json({ success: false, message: 'DB Error' });
            
            let isGlobal = false;
            if (roleRows && roleRows.length > 0) {
                const rn = roleRows[0].role_name || '';
                if (rn.includes('admin') || rn.includes('ceo') || rn.includes('deputy')) {
                    isGlobal = true;
                }
            }

            // Get user's employee & department info
            const userRows = await queryPromise(`
                SELECT u.user_id, e.department_id 
                FROM users u 
                LEFT JOIN employees e ON u.employee_id = e.employee_id 
                WHERE u.user_id = ?
            `, [user_id]);
            const userDeptId = (userRows && userRows.length > 0) ? userRows[0].department_id : null;

            // Daily tasks stats
            const dailySql = isGlobal
                ? `SELECT 
                     COUNT(*) as total,
                     SUM(CASE WHEN LOWER(status) = 'done' OR LOWER(status) = 'completed' THEN 1 ELSE 0 END) as completed,
                     SUM(CASE WHEN LOWER(status) != 'done' AND LOWER(status) != 'completed' THEN 1 ELSE 0 END) as pending,
                     SUM(CASE WHEN DATE(task_date) = CURDATE() OR DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
                   FROM daily_tasks`
                : `SELECT 
                     COUNT(*) as total,
                     SUM(CASE WHEN LOWER(status) = 'done' OR LOWER(status) = 'completed' THEN 1 ELSE 0 END) as completed,
                     SUM(CASE WHEN LOWER(status) != 'done' AND LOWER(status) != 'completed' THEN 1 ELSE 0 END) as pending,
                     SUM(CASE WHEN DATE(task_date) = CURDATE() OR DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today
                   FROM daily_tasks 
                   WHERE user_id = ?`;

            // Sent tasks stats (assigned_by)
            const sentSql = isGlobal
                ? `SELECT 
                     COUNT(*) as total,
                     SUM(CASE WHEN LOWER(status) = 'completed' OR LOWER(status) = 'confirmed' THEN 1 ELSE 0 END) as completed,
                     SUM(CASE WHEN LOWER(status) = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                     SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) as pending
                   FROM task_assignments`
                : `SELECT 
                     COUNT(*) as total,
                     SUM(CASE WHEN LOWER(status) = 'completed' OR LOWER(status) = 'confirmed' THEN 1 ELSE 0 END) as completed,
                     SUM(CASE WHEN LOWER(status) = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                     SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) as pending
                   FROM task_assignments 
                   WHERE assigned_by = ?`;

            // Received tasks stats (assigned_to)
            const receivedSql = isGlobal
                ? `SELECT 
                     COUNT(*) as total,
                     SUM(CASE WHEN LOWER(status) = 'completed' OR LOWER(status) = 'confirmed' THEN 1 ELSE 0 END) as completed,
                     SUM(CASE WHEN LOWER(status) = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                     SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) as pending
                   FROM task_assignments`
                : `SELECT 
                     COUNT(*) as total,
                     SUM(CASE WHEN LOWER(status) = 'completed' OR LOWER(status) = 'confirmed' THEN 1 ELSE 0 END) as completed,
                     SUM(CASE WHEN LOWER(status) = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                     SUM(CASE WHEN LOWER(status) = 'pending' THEN 1 ELSE 0 END) as pending
                   FROM task_assignments 
                   WHERE assigned_to = ?`;

            // Active Breakdown Tasks (monthly_tasks)
            const activeBreakdownSql = isGlobal
                ? `SELECT COUNT(DISTINCT mt.monthly_task_id) as count 
                   FROM monthly_tasks mt 
                   WHERE mt.status != 'completed' AND COALESCE(mt.progress, 0) < 100`
                : `SELECT COUNT(DISTINCT mt.monthly_task_id) as count 
                   FROM monthly_tasks mt
                   LEFT JOIN monthly_task_assignees mta ON mta.monthly_task_id = mt.monthly_task_id
                   LEFT JOIN specific_objective_details sod ON sod.specific_objective_detail_id = mt.specific_objective_detail_id
                   WHERE (mt.status != 'completed' AND COALESCE(mt.progress, 0) < 100)
                     AND (mta.user_id = ? OR sod.user_id = ? ${userDeptId ? 'OR sod.department_id = ?' : ''})`;

            const breakdownParams = isGlobal 
                ? [] 
                : (userDeptId ? [user_id, user_id, userDeptId] : [user_id, user_id]);

            // Open Task Assignments (total open tasks either sent or received)
            const openTasksSql = isGlobal
                ? `SELECT COUNT(*) as count FROM task_assignments WHERE status != 'completed' AND status != 'confirmed'`
                : `SELECT COUNT(*) as count FROM task_assignments WHERE (assigned_to = ? OR assigned_by = ?) AND status != 'completed' AND status != 'confirmed'`;

            // Pending Reports
            const pendingReportsSql = isGlobal
                ? `SELECT COUNT(*) as count FROM reports WHERE LOWER(status) = 'pending' OR LOWER(status) = 'submitted'`
                : `SELECT COUNT(*) as count FROM reports WHERE user_id = ? AND (LOWER(status) = 'pending' OR LOWER(status) = 'submitted')`;

            // Approvals
            const approvalsSql = `SELECT COUNT(*) as count FROM reports WHERE LOWER(status) = 'pending'`;

            const [dailyRes, sentRes, receivedRes, breakdownRes, openRes, reportsRes, approvalsRes] = await Promise.all([
                queryPromise(dailySql, isGlobal ? [] : [user_id]),
                queryPromise(sentSql, isGlobal ? [] : [user_id]),
                queryPromise(receivedSql, isGlobal ? [] : [user_id]),
                queryPromise(activeBreakdownSql, breakdownParams),
                queryPromise(openTasksSql, isGlobal ? [] : [user_id, user_id]),
                queryPromise(pendingReportsSql, isGlobal ? [] : [user_id]),
                queryPromise(approvalsSql, [])
            ]);

            const daily = dailyRes[0] || { total: 0, completed: 0, pending: 0, today: 0 };
            const sent = sentRes[0] || { total: 0, completed: 0, in_progress: 0, pending: 0 };
            const received = receivedRes[0] || { total: 0, completed: 0, in_progress: 0, pending: 0 };
            const activePlans = breakdownRes[0]?.count || 0;
            const openTasks = openRes[0]?.count || 0;
            const pendingReports = reportsRes[0]?.count || 0;
            const approvals = approvalsRes[0]?.count || 0;

            res.status(200).json({
                success: true,
                isGlobal,
                stats: {
                    activePlans,
                    openTasks,
                    pendingReports,
                    approvals,
                    dailyTasks: {
                        total: Number(daily.total) || 0,
                        completed: Number(daily.completed) || 0,
                        pending: Number(daily.pending) || 0,
                        today: Number(daily.today) || 0
                    },
                    sentTasks: {
                        total: Number(sent.total) || 0,
                        completed: Number(sent.completed) || 0,
                        inProgress: Number(sent.in_progress) || 0,
                        pending: Number(sent.pending) || 0
                    },
                    receivedTasks: {
                        total: Number(received.total) || 0,
                        completed: Number(received.completed) || 0,
                        inProgress: Number(received.in_progress) || 0,
                        pending: Number(received.pending) || 0
                    }
                }
            });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Get Weekly / Multi-day Activity Chart (Daily Tasks, Sent Tasks, Received Tasks, Work Breakdowns, Meetings)
const getDashboardActivityChart = async (req, res) => {
    try {
        const user_id = req.user_id;
        const role_id = req.role_id;
        const range = req.query.range || '14d';
        let daysCount = 14;
        if (range === '7d') daysCount = 7;
        else if (range === '30d') daysCount = 30;

        con.query('SELECT LOWER(role_name) as role_name FROM roles WHERE role_id = ?', [role_id], async (err, roleRows) => {
            if (err) return res.status(500).json({ success: false, message: 'DB Error' });
            
            let isGlobal = false;
            if (roleRows && roleRows.length > 0) {
                const rn = roleRows[0].role_name || '';
                if (rn.includes('admin') || rn.includes('ceo') || rn.includes('deputy')) {
                    isGlobal = true;
                }
            }

            // Daily Tasks grouped by date
            const dailyTasksSql = `
                SELECT DATE(COALESCE(task_date, created_at)) as date, COUNT(*) as count 
                FROM daily_tasks
                WHERE COALESCE(task_date, created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                  ${isGlobal ? '' : 'AND user_id = ?'}
                GROUP BY DATE(COALESCE(task_date, created_at))
            `;

            // Sent Tasks (assigned_by = user_id)
            const sentTasksSql = `
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM task_assignments 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                  ${isGlobal ? '' : 'AND assigned_by = ?'}
                GROUP BY DATE(created_at)
            `;

            // Received Tasks (assigned_to = user_id)
            const receivedTasksSql = `
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM task_assignments 
                WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                  ${isGlobal ? '' : 'AND assigned_to = ?'}
                GROUP BY DATE(created_at)
            `;

            // Work Breakdowns
            const breakdownSql = `
                SELECT DATE(mt.created_at) as date, COUNT(DISTINCT mt.monthly_task_id) as count 
                FROM monthly_tasks mt
                LEFT JOIN monthly_task_assignees mta ON mta.monthly_task_id = mt.monthly_task_id
                LEFT JOIN specific_objective_details sod ON sod.specific_objective_detail_id = mt.specific_objective_detail_id
                WHERE mt.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                  ${isGlobal ? '' : 'AND (mta.user_id = ? OR sod.user_id = ?)'}
                GROUP BY DATE(mt.created_at)
            `;

            // Meeting Activities
            const meetingsSql = `
                SELECT DATE(COALESCE(start_time, created_at)) as date, COUNT(*) as count 
                FROM meetings 
                WHERE COALESCE(start_time, created_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                  ${isGlobal ? '' : 'AND created_by = ?'}
                GROUP BY DATE(COALESCE(start_time, created_at))
            `;

            const dailyParams = isGlobal ? [daysCount] : [daysCount, user_id];
            const sentParams = isGlobal ? [daysCount] : [daysCount, user_id];
            const receivedParams = isGlobal ? [daysCount] : [daysCount, user_id];
            const breakdownParams = isGlobal ? [daysCount] : [daysCount, user_id, user_id];
            const meetingParams = isGlobal ? [daysCount] : [daysCount, user_id];

            const [dailyData, sentData, receivedData, breakdownData, meetingsData] = await Promise.all([
                queryPromise(dailyTasksSql, dailyParams),
                queryPromise(sentTasksSql, sentParams),
                queryPromise(receivedTasksSql, receivedParams),
                queryPromise(breakdownSql, breakdownParams),
                queryPromise(meetingsSql, meetingParams)
            ]);

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const result = [];

            for (let i = daysCount - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                
                const dtMatch = dailyData.find(dt => dt.date && (new Date(dt.date)).toISOString().split('T')[0] === dateStr);
                const sMatch = sentData.find(s => s.date && (new Date(s.date)).toISOString().split('T')[0] === dateStr);
                const rMatch = receivedData.find(r => r.date && (new Date(r.date)).toISOString().split('T')[0] === dateStr);
                const bMatch = breakdownData.find(p => p.date && (new Date(p.date)).toISOString().split('T')[0] === dateStr);
                const mMatch = meetingsData.find(m => m.date && (new Date(m.date)).toISOString().split('T')[0] === dateStr);

                result.push({
                    date: dateStr,
                    name: daysCount <= 7 
                        ? days[d.getDay()] 
                        : `${months[d.getMonth()]} ${d.getDate()}`,
                    dayOfWeek: days[d.getDay()],
                    dailyTasks: dtMatch ? Number(dtMatch.count) || 0 : 0,
                    sentTasks: sMatch ? Number(sMatch.count) || 0 : 0,
                    receivedTasks: rMatch ? Number(rMatch.count) || 0 : 0,
                    workBreakdowns: bMatch ? Number(bMatch.count) || 0 : 0,
                    meetings: mMatch ? Number(mMatch.count) || 0 : 0
                });
            }

            res.status(200).json({
                success: true,
                range,
                data: result
            });
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Get Pillar Completion (Progress on work breakdowns, goals, and tasks linked to strategic pillars)
const getDashboardPillars = async (req, res) => {
    try {
        const user_id = req.user_id;
        const role_id = req.role_id;

        con.query('SELECT LOWER(role_name) as role_name FROM roles WHERE role_id = ?', [role_id], async (err, roleRows) => {
            if (err) return res.status(500).json({ success: false, message: 'DB Error' });
            
            let isGlobal = false;
            if (roleRows && roleRows.length > 0) {
                const rn = roleRows[0].role_name || '';
                if (rn.includes('admin') || rn.includes('ceo') || rn.includes('deputy')) {
                    isGlobal = true;
                }
            }

            const pillars = await queryPromise('SELECT id, name, code FROM plan_pillars WHERE is_active = 1 ORDER BY sort_order');
            if (!pillars || pillars.length === 0) {
                return res.status(200).json({ success: true, data: [] });
            }

            const pillarPromises = pillars.map(async (pillar) => {
                // Check goals & specific objective details linked to this pillar
                const sodSql = `
                    SELECT 
                        COUNT(sod.specific_objective_detail_id) as total_sod,
                        COALESCE(AVG(COALESCE(CAST(sod.execution_percentage AS DECIMAL(10,2)), CASE WHEN LOWER(sod.status) = 'confirmed' OR LOWER(sod.status) = 'completed' THEN 100 ELSE 0 END)), 0) as avg_execution,
                        SUM(CASE WHEN CAST(sod.execution_percentage AS DECIMAL(10,2)) >= 100 OR LOWER(sod.status) = 'confirmed' OR LOWER(sod.status) = 'completed' THEN 1 ELSE 0 END) as completed_sod
                    FROM goals g
                    JOIN specific_objective_details sod ON sod.goal_id = g.goal_id
                    WHERE g.pillar_id = ?
                `;
                const sodRows = await queryPromise(sodSql, [pillar.id]);
                const sodData = sodRows[0] || { total_sod: 0, avg_execution: 0, completed_sod: 0 };

                const totalTasks = Number(sodData.total_sod) || 0;
                const completedTasks = Number(sodData.completed_sod) || 0;
                const avgProgress = Math.round(Number(sodData.avg_execution) || 0);

                return {
                    id: pillar.id,
                    name: pillar.name,
                    code: pillar.code,
                    completion: avgProgress,
                    total: totalTasks,
                    completed: completedTasks
                };
            });

            const results = await Promise.all(pillarPromises);

            // If a pillar has 0 direct goals, calculate general organizational task progress fallback
            const allZero = results.every(r => r.total === 0);
            if (allZero) {
                const taStats = await queryPromise(`
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN LOWER(status) = 'completed' OR LOWER(status) = 'confirmed' THEN 1 ELSE 0 END) as completed
                    FROM task_assignments
                `);
                const total = Number(taStats[0]?.total) || 0;
                const completed = Number(taStats[0]?.completed) || 0;
                const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

                const distributed = results.map(r => ({
                    ...r,
                    completion,
                    total,
                    completed
                }));
                return res.status(200).json({ success: true, data: distributed });
            }

            res.status(200).json({ success: true, data: results });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. Get Today's Overview (Today's Meetings + Daily Tasks + Sent Tasks + Received Tasks + User Profile details)
const getDashboardTodayOverview = async (req, res) => {
    try {
        const user_id = req.user_id;

        // User info for personalized welcome
        const userSql = `
            SELECT u.user_id, u.user_name, e.email, r.role_name, 
                   CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) as full_name,
                   os.name as department_name, e.department_id
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            LEFT JOIN organization_structure os ON e.department_id = os.id
            WHERE u.user_id = ?
        `;

        // Meetings for today / upcoming
        const meetingsSql = `
            SELECT m.meeting_id, m.title, m.description, m.start_time, m.end_time, m.location, m.meeting_link, m.status, m.priority
            FROM meetings m
            WHERE m.status != 'cancelled'
              AND (DATE(m.start_time) = CURDATE() OR m.status = 'in-progress' OR (m.start_time >= NOW() AND m.start_time <= DATE_ADD(NOW(), INTERVAL 48 HOUR)))
            ORDER BY m.start_time ASC
            LIMIT 5
        `;

        // Daily Tasks for user (today's / recent active)
        const dailyTasksSql = `
            SELECT dt.daily_task_id, dt.title, dt.description, dt.priority, dt.status, dt.task_date, 
                   dt.start_time, dt.end_time, dt.category, dt.notes, dt.created_at
            FROM daily_tasks dt
            WHERE dt.user_id = ?
            ORDER BY 
              CASE WHEN dt.status = 'todo' THEN 1 WHEN dt.status = 'in_progress' THEN 2 ELSE 3 END,
              COALESCE(dt.task_date, dt.created_at) DESC
            LIMIT 8
        `;

        // Received Tasks for user (assigned_to)
        const receivedTasksSql = `
            SELECT ta.assignment_id, ta.title, ta.description, ta.priority, ta.status, ta.due_date, ta.created_at,
                   CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) as assigner_name
            FROM task_assignments ta
            LEFT JOIN users u ON ta.assigned_by = u.user_id
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            WHERE ta.assigned_to = ?
            ORDER BY 
              CASE WHEN ta.status != 'completed' AND ta.status != 'confirmed' THEN 1 ELSE 2 END,
              CASE WHEN ta.priority = 'urgent' THEN 1 WHEN ta.priority = 'high' THEN 2 WHEN ta.priority = 'medium' THEN 3 ELSE 4 END,
              ta.created_at DESC
            LIMIT 8
        `;

        // Sent Tasks by user (assigned_by)
        const sentTasksSql = `
            SELECT ta.assignment_id, ta.title, ta.description, ta.priority, ta.status, ta.due_date, ta.created_at,
                   CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) as assignee_name
            FROM task_assignments ta
            LEFT JOIN users u ON ta.assigned_to = u.user_id
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            WHERE ta.assigned_by = ?
            ORDER BY 
              CASE WHEN ta.status != 'completed' AND ta.status != 'confirmed' THEN 1 ELSE 2 END,
              ta.created_at DESC
            LIMIT 8
        `;

        const role_id = req.role_id;
        const roleRows = await queryPromise('SELECT LOWER(role_name) as role_name FROM roles WHERE role_id = ?', [role_id]);
        let isGlobal = false;
        if (roleRows && roleRows.length > 0) {
            const rn = roleRows[0].role_name || '';
            if (rn.includes('admin') || rn.includes('ceo') || rn.includes('deputy')) {
                isGlobal = true;
            }
        }

        // Overdue Tasks (past due date & not completed/confirmed)
        const overdueTasksSql = `
            SELECT ta.assignment_id, ta.title, ta.description, ta.priority, ta.status, ta.due_date, ta.created_at,
                   DATEDIFF(NOW(), ta.due_date) as days_overdue,
                   CONCAT(COALESCE(e1.fname,''), ' ', COALESCE(e1.lname,'')) as assigner_name,
                   CONCAT(COALESCE(e2.fname,''), ' ', COALESCE(e2.lname,'')) as assignee_name,
                   ta.assigned_by, ta.assigned_to
            FROM task_assignments ta
            LEFT JOIN users u1 ON ta.assigned_by = u1.user_id
            LEFT JOIN employees e1 ON u1.employee_id = e1.employee_id
            LEFT JOIN users u2 ON ta.assigned_to = u2.user_id
            LEFT JOIN employees e2 ON u2.employee_id = e2.employee_id
            WHERE ta.due_date IS NOT NULL
              AND ta.due_date < NOW()
              AND ta.status NOT IN ('completed', 'confirmed', 'cancelled')
              ${isGlobal ? '' : 'AND (ta.assigned_to = ? OR ta.assigned_by = ?)'}
            ORDER BY ta.due_date ASC
            LIMIT 16
        `;

        const overdueParams = isGlobal ? [] : [user_id, user_id];

        const [userRows, meetings, dailyTasks, receivedTasks, sentTasks, overdueTasks] = await Promise.all([
            queryPromise(userSql, [user_id]),
            queryPromise(meetingsSql, []),
            queryPromise(dailyTasksSql, [user_id]),
            queryPromise(receivedTasksSql, [user_id]),
            queryPromise(sentTasksSql, [user_id]),
            queryPromise(overdueTasksSql, overdueParams)
        ]);

        const userInfo = (userRows && userRows.length > 0) ? userRows[0] : null;

        res.status(200).json({
            success: true,
            userInfo,
            meetings: meetings || [],
            dailyTasks: dailyTasks || [],
            receivedTasks: receivedTasks || [],
            sentTasks: sentTasks || [],
            overdueTasks: overdueTasks || []
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getDashboardStats, getDashboardActivityChart, getDashboardPillars, getDashboardTodayOverview };

