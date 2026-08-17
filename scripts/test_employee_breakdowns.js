const con = require('../models/db');

async function getDetailedEmployeeReport() {
    try {
        const queryAsync = (sql, params) => new Promise((resolve, reject) => {
            con.query(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // 1. Get all employees
        const empSql = `
            SELECT 
                u.user_id, 
                CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) AS name,
                e.employee_id,
                COALESCE(pos.title, pos.name, 'Staff') AS position,
                COALESCE(os.name_amharic, os.name, 'N/A') AS dept,
                os.id AS org_node_id
            FROM users u
            JOIN employees e ON u.employee_id = e.employee_id
            LEFT JOIN (SELECT employee_id, MAX(position_id) as position_id FROM employee_positions WHERE is_primary=1 GROUP BY employee_id) ep ON e.employee_id = ep.employee_id
            LEFT JOIN positions pos ON ep.position_id = pos.position_id
            LEFT JOIN organization_structure os ON e.department_id = os.id
            WHERE u.status = 'active'
        `;
        const employees = await queryAsync(empSql, []);
        
        // 2. Get monthly_tasks assigned to them
        const mtSql = `
            SELECT mta.user_id, mt.monthly_task_id, mt.name, mt.progress, mt.status 
            FROM monthly_task_assignees mta
            JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
        `;
        const monthlyTasks = await queryAsync(mtSql, []);

        // 3. Get action_plan_breakdown task_assignments
        const taSql = `
            SELECT ta.assigned_to AS user_id, ta.task_id, ta.task_description AS name, ta.progress, ta.status
            FROM task_assignments ta
            WHERE ta.category LIKE 'action_plan_breakdown:%'
        `;
        const actionBreakdowns = await queryAsync(taSql, []);

        // 4. Get reports pushed
        const repSql = `
            SELECT r.user_id, r.report_id, r.status
            FROM reports r
        `;
        const reports = await queryAsync(repSql, []);

        console.log(`Fetched ${employees.length} employees, ${monthlyTasks.length} monthly tasks, ${actionBreakdowns.length} action breakdowns, ${reports.length} reports`);
        
        const map = {};
        employees.forEach(e => {
            map[e.user_id] = { ...e, breakdowns_total: 0, breakdowns_completed: 0, breakdowns_pending: 0, reports_total: 0, reports_confirmed: 0, reports_pending: 0, reports_declined: 0, tasks: [] };
        });

        const mergeTask = (userId, task, type) => {
            if (!map[userId]) return;
            map[userId].breakdowns_total++;
            const isCompleted = (task.progress >= 100 || (task.status || '').toLowerCase() === 'completed');
            if (isCompleted) map[userId].breakdowns_completed++;
            else map[userId].breakdowns_pending++;
            
            map[userId].tasks.push({ type, name: task.name, progress: task.progress, status: task.status, isCompleted });
        };

        monthlyTasks.forEach(t => mergeTask(t.user_id, t, 'monthly_task'));
        actionBreakdowns.forEach(t => mergeTask(t.user_id, t, 'delegated_breakdown'));

        reports.forEach(r => {
            if (!map[r.user_id]) return;
            map[r.user_id].reports_total++;
            const st = (r.status || '').toLowerCase();
            if (st === 'approved') map[r.user_id].reports_confirmed++;
            else if (st === 'declined') map[r.user_id].reports_declined++;
            else map[r.user_id].reports_pending++;
        });

        // Filter only those who have either a breakdown or a report
        const activeUsers = Object.values(map).filter(u => u.breakdowns_total > 0 || u.reports_total > 0);
        console.log(`Active breakdown users: ${activeUsers.length}`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
getDetailedEmployeeReport();
