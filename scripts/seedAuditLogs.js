/**
 * Seed script: insert rich sample audit log data for
 * Plans, Reports, Permissions, Tasks, and System categories.
 *
 * Usage: node scripts/seedAuditLogs.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql');

const con = mysql.createConnection({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT || 3306,
});

// ── helpers ──────────────────────────────────────────────────────────────────

/** random integer between min and max (inclusive) */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** random element from array */
const pick = (arr) => arr[rand(0, arr.length - 1)];

/** ISO timestamp between now and `daysBack` days ago */
const randomTs = (daysBack = 30) => {
    const ms = Date.now() - rand(0, daysBack * 86400 * 1000);
    return new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
};

const meta = (extra = {}) => JSON.stringify({
    ip_address: `192.168.1.${rand(10, 200)}`,
    user_agent: pick([
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605',
        'Mozilla/5.0 (X11; Linux x86_64) Firefox/125',
    ]),
    endpoint: extra.endpoint || '/api/unknown',
    method:   extra.method   || 'POST',
    timestamp: new Date().toISOString(),
    ...extra,
});

// ── sample user IDs (adjust to real IDs in your DB) ──────────────────────────
// ── assemble all rows ─────────────────────────────────────────────────────────

con.connect((err) => {
    if (err) { console.error('❌ DB connection failed:', err.message); process.exit(1); }
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME);

    // Fetch valid user IDs to prevent foreign key constraint issues
    con.query('SELECT user_id FROM users', (err, results) => {
        if (err || results.length === 0) {
            console.error('❌ Failed to fetch valid user IDs. Are there any users in the DB?');
            process.exit(1);
        }

        const validUserIds = results.map(row => row.user_id);
        const getRandomUserId = () => validUserIds[rand(0, validUserIds.length - 1)];

        const planTitles = [
            'Annual IT Infrastructure Upgrade',
            'Q2 Budget Forecast Plan',
            'Employee Training Programme 2025',
            'Construction Safety Roadmap',
            'Digital Transformation Initiative',
            'Marketing Strategy 2026',
            'Legal Compliance Review Plan',
            'HR Onboarding Automation',
        ];
        const reportTitles = [
            'Q1 Financial Summary Report',
            'IT Incident Response Report',
            'Monthly Employee Performance',
            'Annual Audit Report 2024',
            'Construction Progress Report',
            'Budget Variance Analysis',
            'Risk Assessment Report',
        ];
        const roleNames    = ['Staff', 'Team Leader', 'Expert', 'Manager', 'Admin'];
        const menuNames    = ['Dashboard', 'Reports', 'Plans', 'Settings', 'Admin Panel', 'Tasks'];
        const taskTitles   = [
            'Review server backups',
            'Update employee records',
            'Prepare Q2 budget sheet',
            'Fix API timeout issues',
            'Complete security audit',
            'Deploy hotfix to production',
            'Train new team members',
        ];


        // Generate rows using valid DB user IDs
        const planRows = () => {
            const rows = [];
            const actions = [
                'PLAN_CREATE', 'PLAN_UPDATE', 'PLAN_SUBMIT',
                'PLAN_APPROVE', 'PLAN_DECLINE', 'PLAN_DELETE', 'PLAN_VIEW',
            ];
            for (let i = 0; i < 60; i++) {
                const action = pick(actions);
                const title  = pick(planTitles);
                const uid    = getRandomUserId();
                const planId = rand(100, 500);
                const desc = {
                    PLAN_CREATE:  `Created plan: "${title}" (ID ${planId})`,
                    PLAN_UPDATE:  `Updated plan: "${title}" — revised budget & timeline`,
                    PLAN_SUBMIT:  `Submitted plan: "${title}" for approval`,
                    PLAN_APPROVE: `Approved plan: "${title}" (ID ${planId})`,
                    PLAN_DECLINE: `Declined plan: "${title}" — insufficient detail`,
                    PLAN_DELETE:  `Deleted plan: "${title}" (ID ${planId})`,
                    PLAN_VIEW:    `Viewed plan: "${title}"`,
                }[action];
                rows.push([uid, action, desc,
                    meta({ endpoint: `/api/plans/${planId}`, method: action === 'PLAN_CREATE' ? 'POST' : 'PUT', plan_id: planId }),
                    randomTs(30)]);
            }
            return rows;
        };

        const reportRows = () => {
            const rows = [];
            const actions = [
                'REPORT_CREATE', 'REPORT_UPDATE', 'REPORT_SUBMIT',
                'REPORT_APPROVE', 'REPORT_DECLINE', 'REPORT_DELETE', 'REPORT_VIEW',
            ];
            for (let i = 0; i < 55; i++) {
                const action = pick(actions);
                const title  = pick(reportTitles);
                const uid    = getRandomUserId();
                const repId  = rand(200, 700);
                const desc = {
                    REPORT_CREATE:  `Created report: "${title}"`,
                    REPORT_UPDATE:  `Updated report: "${title}" — added Q3 data`,
                    REPORT_SUBMIT:  `Submitted report: "${title}" for review`,
                    REPORT_APPROVE: `Approved report: "${title}"`,
                    REPORT_DECLINE: `Declined report: "${title}" — data inconsistency`,
                    REPORT_DELETE:  `Deleted report: "${title}" (ID ${repId})`,
                    REPORT_VIEW:    `Viewed report: "${title}"`,
                }[action];
                rows.push([uid, action, desc,
                    meta({ endpoint: `/api/reports/${repId}`, method: action === 'REPORT_CREATE' ? 'POST' : 'GET', report_id: repId }),
                    randomTs(30)]);
            }
            return rows;
        };

        const permissionRows = () => {
            const rows = [];
            const actions = [
                'PERMISSION_UPDATE', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE',
                'MENU_CREATE', 'MENU_UPDATE', 'MENU_DELETE',
            ];
            for (let i = 0; i < 40; i++) {
                const action = pick(actions);
                const role   = pick(roleNames);
                const menu   = pick(menuNames);
                const uid    = getRandomUserId();
                const desc = {
                    PERMISSION_UPDATE: `Updated permissions for role "${role}" — toggled access to [${menu}, ${pick(menuNames)}]`,
                    ROLE_CREATE:       `Created new role: "${role} Level ${rand(1,3)}"`,
                    ROLE_UPDATE:       `Updated role "${role}" — renamed & permission set revised`,
                    ROLE_DELETE:       `Deleted role "${role}" and reassigned ${rand(2, 8)} users`,
                    MENU_CREATE:       `Created menu item: "${menu}" (path /${menu.toLowerCase().replace(/ /g,'-')})`,
                    MENU_UPDATE:       `Updated menu item "${menu}" — changed icon & display order`,
                    MENU_DELETE:       `Deleted menu item "${menu}" and cleaned up role_permissions`,
                }[action];
                rows.push([uid, action, desc,
                    meta({ endpoint: '/api/menu-permissions', method: 'POST', role, menu }),
                    randomTs(30)]);
            }
            return rows;
        };

        const taskRows = () => {
            const rows = [];
            const actions = ['TASK_CREATE', 'TASK_UPDATE', 'TASK_COMPLETE', 'TASK_DELETE'];
            for (let i = 0; i < 50; i++) {
                const action = pick(actions);
                const title  = pick(taskTitles);
                const uid    = getRandomUserId();
                const taskId = rand(1, 300);
                const desc = {
                    TASK_CREATE:   `Created task: "${title}" assigned to team`,
                    TASK_UPDATE:   `Updated task: "${title}" — changed deadline & priority`,
                    TASK_COMPLETE: `Completed task: "${title}" (ID ${taskId}) ahead of schedule`,
                    TASK_DELETE:   `Deleted task: "${title}" (ID ${taskId}) — cancelled`,
                }[action];
                rows.push([uid, action, desc,
                    meta({ endpoint: `/api/tasks/${taskId}`, method: action === 'TASK_CREATE' ? 'POST' : 'PUT', task_id: taskId }),
                    randomTs(30)]);
            }
            return rows;
        };

        const systemRows = () => {
            const rows = [];
            for (let i = 0; i < 35; i++) {
                const type = pick(['error', 'start', 'settings', 'export', 'backup']);
                const uid  = pick([null, getRandomUserId(), getRandomUserId()]);
                const [action, desc, endpoint] = {
                    error: [
                        'SYSTEM_ERROR',
                        `Unhandled exception in ${pick(['/api/plans/approve', '/api/reports', '/api/users'])} — ${pick(['Timeout', 'Null reference', 'DB connection lost', 'JWT expired'])}`,
                        '/api/system/errors',
                    ],
                    start: [
                        'SYSTEM_START',
                        `Server started on port 5001 — DB connected, ${rand(5, 20)} routes registered`,
                        '/api/system/start',
                    ],
                    settings: [
                        'SETTINGS_CHANGE',
                        `System setting changed: ${pick(['email_notifications', 'max_login_attempts', 'session_timeout', 'backup_schedule'])} updated`,
                        '/api/settings',
                    ],
                    export: [
                        'DATA_EXPORT',
                        `Data exported: ${pick(['employees', 'plans', 'reports', 'audit_logs'])} table — ${rand(100, 5000)} rows as CSV`,
                        '/api/admin/export',
                    ],
                    backup: [
                        'DATA_EXPORT',
                        `Scheduled database backup completed — ${rand(20, 200)} MB archived`,
                        '/api/admin/backup',
                    ],
                }[type];

                rows.push([uid, action, desc,
                    meta({ endpoint, method: 'POST' }),
                    randomTs(30)]);
            }
            return rows;
        };

        const meetingRows = () => {
            const rows = [];
            const actions = ['MEETING_CREATE', 'MEETING_UPDATE', 'MEETING_JOIN', 'MEETING_END', 'MEETING_POSTPONE'];
            const titles = ['Q2 Strategy Meeting', 'IT Daily Standup', 'Budget Review Session', 'Annual Planning Workshop', 'Audit Debrief'];
            for (let i = 0; i < 25; i++) {
                const action = pick(actions);
                const title  = pick(titles);
                const uid    = getRandomUserId();
                const mid    = rand(1, 100);
                const desc = {
                    MEETING_CREATE:   `Scheduled meeting: "${title}" — ${rand(2, 15)} attendees invited`,
                    MEETING_UPDATE:   `Updated meeting: "${title}" — agenda revised`,
                    MEETING_JOIN:     `Joined meeting: "${title}"`,
                    MEETING_END:      `Ended meeting: "${title}" — duration ${rand(15, 180)} minutes`,
                    MEETING_POSTPONE: `Postponed meeting: "${title}" to next week`,
                }[action];
                rows.push([uid, action, desc,
                    meta({ endpoint: `/api/meetings/${mid}`, method: 'POST', meeting_id: mid }),
                    randomTs(30)]);
            }
            return rows;
        };

        const allRows = [
            ...planRows(),
            ...reportRows(),
            ...permissionRows(),
            ...taskRows(),
            ...systemRows(),
            ...meetingRows(),
        ];

        // Shuffle so timestamps are interleaved
        allRows.sort(() => Math.random() - 0.5);

        const sql = `INSERT INTO audit_logs (user_id, action, description, metadata, created_at) VALUES ?`;

        con.query(sql, [allRows], (err, result) => {
            if (err) {
                console.error('❌ Seed failed:', err.message);
            } else {
                console.log(`\n🎉 Successfully seeded ${result.affectedRows} audit log entries!`);
                console.log(`   📋 Plans:       ~60 events`);
                console.log(`   📄 Reports:     ~55 events`);
                console.log(`   🛡  Permissions: ~40 events`);
                console.log(`   ✅ Tasks:        ~50 events`);
                console.log(`   ⚙  System:       ~35 events`);
                console.log(`   📅 Meetings:     ~25 events`);
            }
            con.end();
            process.exit(err ? 1 : 0);
        });
    });
});

