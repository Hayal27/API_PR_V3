const con = require('../models/db');

async function testEmployees() {
    try {
        const queryAsync = (sql, params) => new Promise((resolve, reject) => {
            con.query(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // 1. Get employees
        const empSql = `
            SELECT 
                u.user_id, 
                CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) AS name
            FROM users u
            JOIN employees e ON u.employee_id = e.employee_id
            WHERE u.status = 'active'
        `;
        const employees = await queryAsync(empSql, []);
        console.log(`Fetched ${employees.length} employees`);
        
        const empMap = {};
        employees.forEach(e => {
            empMap[e.user_id] = {
                ...e, 
                breakdowns_total: 0, breakdowns_completed: 0, breakdowns_pending: 0,
                reports_total: 0, reports_confirmed: 0, reports_pending: 0, reports_declined: 0
            };
        });

        // 2. Fetch monthly/weekly task assignments for breakdowns
        const mtSql = `
            SELECT mta.user_id, mt.progress, mt.status 
            FROM monthly_task_assignees mta
            JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
        `;
        const mtRows = await queryAsync(mtSql, []);
        console.log(`Fetched ${mtRows.length} monthly task assignments`);
        mtRows.forEach(t => {
            if (empMap[t.user_id]) {
                empMap[t.user_id].breakdowns_total++;
            } else {
                console.log(`Found task for unknown user: ${t.user_id}`);
            }
        });

        // 3. Fetch action plan breakdown task_assignments
        const taSql = `
            SELECT ta.assigned_to AS user_id, ta.progress, ta.status
            FROM task_assignments ta
            WHERE ta.category LIKE 'action_plan_breakdown:%'
        `;
        const taRows = await queryAsync(taSql, []);
        console.log(`Fetched ${taRows.length} task_assignments`);
        taRows.forEach(t => {
            if (empMap[t.user_id]) {
                empMap[t.user_id].breakdowns_total++;
            }
        });

        // 4. Fetch formal reports
        const repSql = `
            SELECT r.user_id, r.status
            FROM reports r
        `;
        const repRows = await queryAsync(repSql, []);
        console.log(`Fetched ${repRows.length} reports`);
        repRows.forEach(r => {
            if (empMap[r.user_id]) {
                empMap[r.user_id].reports_total++;
            }
        });

        const activeUsers = Object.values(empMap).filter(u => u.breakdowns_total > 0 || u.reports_total > 0);
        console.log(`Active breakdown users: ${activeUsers.length}`);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
testEmployees();
