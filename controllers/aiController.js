const db = require('../models/db');
const axios = require('axios');
const { promisify } = require('util');
const dbQuery = promisify(db.query).bind(db);

// Supported active Groq models in prioritized fallback order
const CANDIDATE_MODELS = [
    'groq/compound',
    'groq/compound-mini',
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b'
];

// Helper to call Groq with automatic model fallback
async function callGroqWithFallback(payload, apiKey) {
    let lastError = null;
    for (const model of CANDIDATE_MODELS) {
        try {
            const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                ...payload,
                model
            }, {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                timeout: 35000
            });
            if (res.data?.choices?.[0]?.message?.content) {
                return res.data;
            }
        } catch (err) {
            console.warn(`Groq model ${model} failed:`, err.response ? (err.response.data?.error?.message || err.response.status) : err.message);
            lastError = err;
        }
    }
    throw lastError || new Error("All candidate AI models failed to respond.");
}

// Generates high-level executive insights from report data
exports.generateInsights = async (req, res) => {
    try {
        const { data, context } = req.body;

        if (!data) {
            return res.status(400).json({ success: false, message: "No data provided for analysis." });
        }

        // Fetch API Key safely
        let apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            try {
                const settings = await dbQuery("SELECT setting_value FROM system_settings WHERE setting_key = 'GROQ_API_KEY'");
                if (settings.length) apiKey = settings[0].setting_value;
            } catch (e) {
                console.error("Warning: Could not fetch from system_settings:", e.message);
            }
        }

        if (!apiKey) {
            console.error("GROQ_API_KEY is missing. AI cannot proceed.");
            return res.status(500).json({ success: false, message: "Groq API key not found." });
        }

        // Fetch Global Summary for longitudinal comparison
        let globalSummary = [];
        try {
            globalSummary = await dbQuery(`
                SELECT 
                    g.year, 
                    ROUND(AVG(COALESCE(sod.CIexecution_percentage, sod.execution_percentage, 0)), 2) as avg_execution_perc
                FROM specific_objective_details sod
                JOIN plans p ON sod.specific_objective_detail_id = p.specific_objective_detail_id
                JOIN goals g ON p.goal_id = g.goal_id
                JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
                WHERE aw.status = 'completed'
                GROUP BY g.year
                ORDER BY g.year ASC
            `);
        } catch (e) {
            console.warn("Notice fetching global summary:", e.message);
        }

        try {
            const groqRes = await callGroqWithFallback({
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: 'system',
                        content: `You are "Master Mind", the fully integrated AI Intelligence for the Ethiopian IT Park (EITP).
                        
                        IDENTITY:
                        - You have a direct, real-time view into the organization's heartbeat.
                        - NEVER reveal table names or SQL logic.
                        - NEVER claim you cannot read the database; you ARE the data interface.

                        GLOBAL PERFORMANCE REPOSITORY (Years): ${JSON.stringify(globalSummary)}

                        OUTPUT:
                        Return ONLY a JSON object with: 
                        "performance_score": (0-100),
                        "summary": (executive summary),
                        "top_performers_insight": (analytical comment on rankings),
                        "efficiency_gap": (critical areas lagging),
                        "risks": (Array of business risks),
                        "predictions": (Forecast based on trends),
                        "recommendations": (Array of 3-5 specific actions).`
                    },
                    {
                        role: 'user',
                        content: `Context: ${context || 'General Performance Review'}. Data: ${JSON.stringify(data)}`
                    }
                ],
                temperature: 0.3
            }, apiKey);

            const aiContent = JSON.parse(groqRes.choices[0].message.content);
            return res.status(200).json({ success: true, insights: aiContent });

        } catch (apiError) {
            console.error("Groq API Error in generateInsights:", apiError.message);
            return res.status(500).json({ success: false, message: "Failed to generate AI insights." });
        }
    } catch (error) {
        console.error("GenerateInsights Error:", error.message);
        res.status(500).json({ success: false, message: "Server error during AI generation." });
    }
};

// Enables interactive chat with the AI about specific reports, real-time tasks, controls, and system data
exports.chatWithAI = async (req, res) => {
    try {
        const { messages, dataContext } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ success: false, message: "Invalid chat history." });
        }

        const userId = req.user_id || req.user?.user_id || req.body?.user_id;

        // Fetch API Key safely
        let apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            try {
                const settings = await dbQuery("SELECT setting_value FROM system_settings WHERE setting_key = 'GROQ_API_KEY'");
                if (settings.length) apiKey = settings[0].setting_value;
            } catch (e) {
                console.error("Warning: Could not fetch from system_settings:", e.message);
            }
        }

        if (!apiKey) {
            console.error("GROQ_API_KEY is missing. AI Chat cannot proceed.");
            return res.status(500).json({ success: false, message: "AI Engine not configured." });
        }

        // 1. Fetch authenticated user profile & organizational placement
        let userProfile = null;
        let roleTier = 'staff'; // 'global', 'supervisor', 'staff'
        let subordinateEmpIds = new Set();
        let subordinatesList = [];
        let subordinateTasks = [];
        let subordinateDailyTasks = [];

        // Personal tasks and schedule
        let myDailyTasks = [];
        let myReceivedTasks = [];
        let mySentTasks = [];
        let myMeetings = [];
        let myPlans = [];

        // Global stats (for admin/ceo or general context)
        let orgTaskStats = [];
        let globalSummary = [];

        if (userId) {
            try {
                const userRows = await dbQuery(`
                    SELECT 
                        u.user_id, u.user_name, u.employee_id, u.role_id, 
                        LOWER(COALESCE(r.role_name, '')) as role_name,
                        r.hierarchy_level,
                        e.fname, e.lname, e.email, e.phone, e.position,
                        d.department_id, d.name as department_name,
                        e.supervisor_id,
                        (SELECT CONCAT(s.fname, ' ', s.lname) FROM employees s WHERE s.employee_id = e.supervisor_id) as supervisor_name
                    FROM users u
                    LEFT JOIN employees e ON u.employee_id = e.employee_id
                    LEFT JOIN roles r ON u.role_id = r.role_id
                    LEFT JOIN departments d ON e.department_id = d.department_id
                    WHERE u.user_id = ?
                `, [userId]);

                if (userRows.length > 0) {
                    userProfile = userRows[0];
                    const roleId = Number(userProfile.role_id) || 0;
                    const hLevel = Number(userProfile.hierarchy_level) || 99;
                    const rName = userProfile.role_name || '';
                    const myEmpId = userProfile.employee_id;

                    // Determine Tier:
                    // Global (Admin / CEO / Executive)
                    const isGlobal = [1, 2, 3, 9, 29, 33].includes(roleId) ||
                        hLevel <= 3 ||
                        rName.includes('ceo') ||
                        rName.includes('admin') ||
                        rName.includes('deputy') ||
                        rName.includes('executive') ||
                        rName.includes('director general');

                    // Check if Supervisor (Head / Director / Manager / Lead / has direct reports)
                    let isSupervisor = isGlobal ||
                        rName.includes('head') ||
                        rName.includes('director') ||
                        rName.includes('manager') ||
                        rName.includes('supervisor') ||
                        rName.includes('lead');

                    // 2. Resolve Subordinates via Hierarchical Reporting & Organization Structure
                    if (myEmpId) {
                        try {
                            const [allEmps, allPositions, allNodes] = await Promise.all([
                                dbQuery('SELECT employee_id, supervisor_id, department_id, fname, lname, position, email, phone FROM employees'),
                                dbQuery('SELECT employee_id, org_node_id FROM employee_positions').catch(() => []),
                                dbQuery('SELECT id, parent_id, name FROM organization_structure').catch(() => [])
                            ]);

                            // BFS 1: Supervisor reporting chain downwards
                            const queueEmps = [myEmpId];
                            const visitedEmps = new Set([myEmpId]);
                            while (queueEmps.length > 0) {
                                const cur = queueEmps.shift();
                                (allEmps || []).filter(e => e.supervisor_id === cur && e.employee_id !== cur).forEach(e => {
                                    if (!visitedEmps.has(e.employee_id)) {
                                        visitedEmps.add(e.employee_id);
                                        subordinateEmpIds.add(e.employee_id);
                                        queueEmps.push(e.employee_id);
                                    }
                                });
                            }

                            // BFS 2: Organization structure sub-tree
                            const myHeldNodes = (allPositions || [])
                                .filter(p => p.employee_id === myEmpId)
                                .map(p => p.org_node_id)
                                .concat((allEmps || []).filter(e => e.employee_id === myEmpId).map(e => e.department_id))
                                .filter(Boolean);

                            if (myHeldNodes.length > 0) {
                                const descendantNodes = new Set();
                                const queueNodes = [...myHeldNodes];
                                while (queueNodes.length > 0) {
                                    const nodeId = queueNodes.shift();
                                    (allNodes || []).filter(n => n.parent_id === nodeId).forEach(child => {
                                        if (!descendantNodes.has(child.id)) {
                                            descendantNodes.add(child.id);
                                            queueNodes.push(child.id);
                                        }
                                    });
                                }

                                (allPositions || [])
                                    .filter(p => (descendantNodes.has(p.org_node_id) || myHeldNodes.includes(p.org_node_id)) && p.employee_id !== myEmpId)
                                    .forEach(p => subordinateEmpIds.add(p.employee_id));

                                (allEmps || [])
                                    .filter(e => (descendantNodes.has(e.department_id) || myHeldNodes.includes(e.department_id)) && e.employee_id !== myEmpId)
                                    .forEach(e => subordinateEmpIds.add(e.employee_id));
                            }

                            if (subordinateEmpIds.size > 0) {
                                isSupervisor = true;
                            }
                        } catch (subErr) {
                            console.warn("Subordinate hierarchy resolution notice:", subErr.message);
                        }
                    }

                    if (isGlobal) {
                        roleTier = 'global';
                    } else if (isSupervisor) {
                        roleTier = 'supervisor';
                    } else {
                        roleTier = 'staff';
                    }

                    // 3. Fetch Personal Real-Time Tasks, Schedule, and Records
                    const [dailyTasksRes, receivedTasksRes, sentTasksRes, meetingsRes, plansRes] = await Promise.all([
                        // Personal daily tasks (Today & recent)
                        dbQuery(`
                            SELECT daily_task_id, title, description, priority, status, 
                                   DATE_FORMAT(task_date, '%Y-%m-%d') as task_date,
                                   start_time, end_time, category, notes
                            FROM daily_tasks
                            WHERE user_id = ?
                            ORDER BY task_date DESC, created_at DESC
                            LIMIT 15
                        `, [userId]).catch(() => []),

                        // Tasks assigned to current user (Received)
                        dbQuery(`
                            SELECT 
                                ta.assignment_id, ta.title, ta.description, ta.priority, ta.status, 
                                DATE_FORMAT(ta.due_date, '%Y-%m-%d') as due_date,
                                ta.category,
                                CONCAT(COALESCE(e_by.fname, u_by.user_name), ' ', COALESCE(e_by.lname, '')) as assigned_by_name,
                                r_by.role_name as assigned_by_role,
                                d_by.name as assigned_by_department
                            FROM task_assignments ta
                            LEFT JOIN users u_by ON ta.assigned_by = u_by.user_id
                            LEFT JOIN employees e_by ON u_by.employee_id = e_by.employee_id
                            LEFT JOIN roles r_by ON u_by.role_id = r_by.role_id
                            LEFT JOIN departments d_by ON e_by.department_id = d_by.department_id
                            WHERE ta.assigned_to = ?
                            ORDER BY 
                                CASE WHEN ta.status IN ('pending', 'in_progress') THEN 0 ELSE 1 END,
                                ta.due_date ASC,
                                ta.created_at DESC
                            LIMIT 20
                        `, [userId]).catch(() => []),

                        // Tasks assigned by current user (Delegated/Sent)
                        dbQuery(`
                            SELECT 
                                ta.assignment_id, ta.title, ta.priority, ta.status, 
                                DATE_FORMAT(ta.due_date, '%Y-%m-%d') as due_date,
                                ta.category,
                                CONCAT(COALESCE(e_to.fname, u_to.user_name), ' ', COALESCE(e_to.lname, '')) as assigned_to_name,
                                r_to.role_name as assigned_to_role
                            FROM task_assignments ta
                            LEFT JOIN users u_to ON ta.assigned_to = u_to.user_id
                            LEFT JOIN employees e_to ON u_to.employee_id = e_to.employee_id
                            LEFT JOIN roles r_to ON u_to.role_id = r_to.role_id
                            WHERE ta.assigned_by = ?
                            ORDER BY ta.created_at DESC
                            LIMIT 15
                        `, [userId]).catch(() => []),

                        // Upcoming and scheduled meetings
                        dbQuery(`
                            SELECT 
                                m.meeting_id, m.title, m.meeting_type, 
                                DATE_FORMAT(m.start_time, '%Y-%m-%d %H:%i') as start_time,
                                DATE_FORMAT(m.end_time, '%Y-%m-%d %H:%i') as end_time,
                                m.location, m.meeting_link, m.status, m.priority, m.agenda
                            FROM meetings m
                            LEFT JOIN meeting_participants mp ON m.meeting_id = mp.meeting_id
                            WHERE (m.created_by = ? OR mp.user_id = ?) AND m.status != 'cancelled'
                            GROUP BY m.meeting_id
                            ORDER BY m.start_time DESC
                            LIMIT 8
                        `, [userId, userId]).catch(() => []),

                        // Submitted plans
                        dbQuery(`
                            SELECT p.plan_id, sod.specific_objective_name, p.status as plan_status,
                                   DATE_FORMAT(p.created_at, '%Y-%m-%d') as created_date
                            FROM plans p
                            JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
                            WHERE p.user_id = ?
                            ORDER BY p.created_at DESC LIMIT 5
                        `, [userId]).catch(() => [])
                    ]);

                    myDailyTasks = dailyTasksRes || [];
                    myReceivedTasks = receivedTasksRes || [];
                    mySentTasks = sentTasksRes || [];
                    myMeetings = meetingsRes || [];
                    myPlans = plansRes || [];

                    // 4. If Supervisor or Global, fetch Subordinate details & live tasks
                    if ((isSupervisor || isGlobal) && subordinateEmpIds.size > 0) {
                        try {
                            const subEmpArray = Array.from(subordinateEmpIds);
                            const subUsers = await dbQuery(`
                                SELECT 
                                    u.user_id, u.user_name, e.employee_id,
                                    CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as name,
                                    e.email, e.phone, e.position,
                                    COALESCE(d.name, 'General Directorate') as department_name,
                                    (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'pending') as pending_count,
                                    (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'in_progress') as in_progress_count,
                                    (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'completed') as completed_count
                                FROM users u
                                JOIN employees e ON u.employee_id = e.employee_id
                                LEFT JOIN departments d ON e.department_id = d.department_id
                                WHERE e.employee_id IN (?)
                                ORDER BY e.fname ASC
                            `, [subEmpArray]).catch(() => []);

                            subordinatesList = subUsers || [];
                            const subUserIds = subordinatesList.map(su => su.user_id).filter(Boolean);

                            if (subUserIds.length > 0) {
                                const [subTasksRes, subDailyRes] = await Promise.all([
                                    dbQuery(`
                                        SELECT 
                                            ta.assignment_id, ta.title, ta.priority, ta.status, 
                                            DATE_FORMAT(ta.due_date, '%Y-%m-%d') as due_date,
                                            CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as assigned_to_name
                                        FROM task_assignments ta
                                        JOIN users u ON ta.assigned_to = u.user_id
                                        JOIN employees e ON u.employee_id = e.employee_id
                                        WHERE ta.assigned_to IN (?) AND ta.status IN ('pending', 'in_progress')
                                        ORDER BY ta.due_date ASC
                                        LIMIT 25
                                    `, [subUserIds]).catch(() => []),

                                    dbQuery(`
                                        SELECT 
                                            dt.daily_task_id, dt.title, dt.priority, dt.status, 
                                            DATE_FORMAT(dt.task_date, '%Y-%m-%d') as task_date,
                                            CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as employee_name
                                        FROM daily_tasks dt
                                        JOIN users u ON dt.user_id = u.user_id
                                        JOIN employees e ON u.employee_id = e.employee_id
                                        WHERE dt.user_id IN (?)
                                        ORDER BY dt.task_date DESC
                                        LIMIT 15
                                    `, [subUserIds]).catch(() => [])
                                ]);

                                subordinateTasks = subTasksRes || [];
                                subordinateDailyTasks = subDailyRes || [];
                            }
                        } catch (subFetchErr) {
                            console.warn("Notice fetching subordinate details:", subFetchErr.message);
                        }
                    }
                }
            } catch (userErr) {
                console.warn("Notice fetching user context:", userErr.message);
            }
        }

        // 5. Global organizational stats & System Controller Metadata
        let systemMeta = {};
        try {
            const [depRows, roleRows, pillarRows, goalRows, orgNodes, appCount] = await Promise.all([
                dbQuery('SELECT department_id, name FROM departments LIMIT 30').catch(() => []),
                dbQuery('SELECT role_id, role_name, hierarchy_level FROM roles ORDER BY hierarchy_level ASC LIMIT 25').catch(() => []),
                dbQuery('SELECT id, name FROM pillars LIMIT 10').catch(() => []),
                dbQuery('SELECT goal_id, title, start_year, end_year, weight, is_active FROM goals LIMIT 15').catch(() => []),
                dbQuery('SELECT COUNT(*) as total_units FROM organization_structure').catch(() => [{ total_units: 0 }]),
                dbQuery('SELECT COUNT(*) as total_applicants FROM applicants').catch(() => [{ total_applicants: 0 }])
            ]);
            systemMeta = {
                departments: depRows,
                roles: roleRows,
                pillars: pillarRows,
                goals: goalRows,
                totalOrgUnits: orgNodes[0]?.total_units || 0,
                totalApplicants: appCount[0]?.total_applicants || 0
            };

            [orgTaskStats, globalSummary] = await Promise.all([
                dbQuery(`SELECT status, COUNT(*) as count FROM task_assignments GROUP BY status`).catch(() => []),
                dbQuery(`
                    SELECT g.year, COUNT(sod.specific_objective_detail_id) as objective_count,
                    ROUND(AVG(COALESCE(sod.CIexecution_percentage, sod.execution_percentage, 0)), 2) as avg_execution_perc,
                    SUM(COALESCE(sod.CIplan, 0)) as total_planned_value, SUM(COALESCE(sod.CIoutcome, 0)) as total_actual_value
                    FROM specific_objective_details sod JOIN plans p ON sod.specific_objective_detail_id = p.specific_objective_detail_id
                    JOIN goals g ON p.goal_id = g.goal_id JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
                    WHERE aw.status = 'completed' GROUP BY g.year ORDER BY g.year ASC
                `).catch(() => [])
            ]);
        } catch (globalErr) {
            console.warn("Notice fetching global summary & system meta:", globalErr.message);
        }

        try {
            // Build the comprehensive knowledge system prompt
            const systemPrompt = {
                role: 'system',
                content: `You are "Master Mind", the authoritative, real-time AI Operating Intelligence for the Ethiopian IT Park Corporation (EITPC).
                
AUTHENTICATED USER CONTEXT & ACCESS TIER:
- Full Name: ${userProfile ? `${userProfile.fname || ''} ${userProfile.lname || ''}`.trim() : 'Guest User'}
- Role & Title: ${userProfile?.role_name || 'Team Member'} (${userProfile?.position || 'Staff'})
- Department: ${userProfile?.department_name || 'General Directorate'}
- Supervisor: ${userProfile?.supervisor_name || 'Leadership'}
- Access Tier: ${roleTier.toUpperCase()} ${roleTier === 'global' ? '(Full Corporate Visibility)' : roleTier === 'supervisor' ? '(Self + Subordinate Team Visibility)' : '(Self-Service)'}

ACCESS CONTROL & PRIVACY RULES:
1. STAFF SELF-SERVICE: Staff members have full real-time access to their OWN daily tasks, assigned tasks, delegated tasks, meetings, plans, and reports. Do not expose other employees' private tasks unless they are assigned together.
2. SUPERVISOR VISIBILITY: Supervisors (Section Heads, Department Heads, Directors, Managers) have FULL access to their own data PLUS all subordinate employees reporting to them based on organizational structure. You MUST expose subordinates' tasks, workloads, pending items, and progress to help the supervisor lead effectively.
3. ADMIN & CEO: Complete global visibility across all organizational units, departments, tasks, and system performance.
4. HUMAN-CENTRIC & REAL-TIME: NEVER say "I do not have access to your personal task list". You have direct live database access to their tasks right now.

====================================================================
LIVE DATABASE DATA INJECTED IN REAL-TIME FOR THIS USER:
====================================================================

1. PERSONAL RECEIVED TASKS (Assigned to this user to work on):
${JSON.stringify(myReceivedTasks, null, 2)}

2. PERSONAL DAILY PLANNER TASKS (Today / Recent from Daily Checklist):
${JSON.stringify(myDailyTasks, null, 2)}

3. PERSONAL DELEGATED / SENT TASKS (Tasks this user assigned to others):
${JSON.stringify(mySentTasks, null, 2)}

4. PERSONAL MEETINGS & CALENDAR:
${JSON.stringify(myMeetings, null, 2)}

5. SUBORDINATE TEAM DIRECTORY (For Supervisors/Directors):
${JSON.stringify(subordinatesList, null, 2)}

6. SUBORDINATE ACTIVE TASKS (Assigned to team members under supervision):
${JSON.stringify(subordinateTasks, null, 2)}

7. SUBORDINATE RECENT DAILY TASKS:
${JSON.stringify(subordinateDailyTasks, null, 2)}

8. GLOBAL ORGANIZATION TASK STATS:
${JSON.stringify(orgTaskStats, null, 2)}

9. STRATEGIC ANNUAL PERFORMANCE:
${JSON.stringify(globalSummary, null, 2)}

10. SYSTEM METADATA OVERVIEW:
${JSON.stringify(systemMeta, null, 2)}

====================================================================
COMPLETE BACKEND APIS, CONTROLLERS & ARCHITECTURE REGISTRY:
====================================================================
You possess exhaustive, master-level knowledge of all 22 backend controllers, their endpoints, database tables, workflows, and business logic:

1. goalConfigController.js (Strategic Goal & KPI Quarterly Configuration Engine):
   - Endpoints: GET /api/plan/goal-configs, PUT /api/plan/goal-configs/:id, POST /api/plan/goal-configs/toggle-quarter, POST /api/plan/goal-configs/toggle-objective-quarter, POST /api/plan/goal-configs/toggle-kpi-quarter, POST /api/plan/goal-configs/toggle-action-plan-quarter
   - Tables: goals, goal_quarter_activations, objective_quarter_activations, kpi_quarter_activations, action_plan_quarter_activations
   - Capabilities: Configures goal start_year, end_year, weight (0.00-100.00), pillar_id, and is_active. Manages the quarter activation matrix (Q1, Q2, Q3, Q4) for goals, objectives, and KPIs to control whether reporting and planning are active in the current fiscal period.

2. fileController.js (Secure Asset Serving):
   - Endpoints: GET /api/files/:filename, GET /api/files/info/:filename
   - Storage: uploads/ directory
   - Capabilities: Path-sanitized, secure file serving for task attachments, avatars, plan evidence files, and report proofs. Validates MIME types and file existence.

3. employeeController.js (Employee Directory & Position Mapping):
   - Endpoints: GET /api/getAllEmployees, POST /api/addEmployee, PUT /api/updateEmployee/:id, DELETE /api/deleteEmployee/:id, GET /api/employee-positions/:employee_id, POST /api/employee-positions, GET /api/getAllSupervisors, GET /api/getEmployeeStatistics
   - Tables: employees, departments, roles, employee_positions, positions, organization_structure
   - Capabilities: Employee CRUD, reporting supervisor linkage (supervisor_id), department assignment, and primary (is_primary = 1) / secondary mapping to organizational units.

4. dailyTaskController.js (Personal Day Planner & Task Reminders):
   - Endpoints: GET /api/daily-tasks, POST /api/daily-tasks, PUT /api/daily-tasks/:id, DELETE /api/daily-tasks/:id, GET /api/daily-tasks/stats, POST /api/daily-tasks/send-reminder
   - Tables: daily_tasks
   - Capabilities: Personal daily checklist with time-blocks (start_time, end_time), priority (low, medium, high), status (todo, in_progress, done), categories, notes; automated email & Telegram alerts.

5. configMulter.js (Uploads Middleware):
   - Capabilities: Configures disk storage, generates timestamped unique filenames, enforces 10MB-50MB limits, restricts MIME types to PDF, DOCX, XLSX, PNG, JPG, ZIP across task, plan, and report uploads.

6. chatController.js (Real-time Internal Chat & Group Collaboration):
   - Endpoints: GET /api/chat/conversations, POST /api/chat/conversations, GET /api/chat/conversations/:id/messages, POST /api/chat/conversations/:id/messages, PUT /api/chat/messages/:id, DELETE /api/chat/messages/:id, POST /api/chat/messages/:id/reactions, GET /api/chat/users/presence, POST /api/chat/groups
   - Tables: chat_conversations, chat_messages, chat_participants, chat_attachments, chat_reactions, user_presence
   - Capabilities: Direct 1-on-1 messaging, organization groups, message reactions, attachments, file sharing, user online presence tracking, group administration.

7. analytics.js (Longitudinal & Financial Corporate Analytics):
   - Endpoints: /api/cost-reporting, /api/income-reporting, /api/cost-vs-income-reporting, /api/hr-reporting, /api/user-performance-ranking, /api/unit-performance-ranking
   - Tables: plans, specific_objective_details, approvalworkflow, goals, departments, employees
   - Capabilities: Evaluates corporate cost vs income in both ETB (Ethiopian Birr) and USD ($), regular vs capital budget variances, HR staffing differences, and calculates institutional performance rankings strictly filtering for completed approved plans (approvalworkflow.status = 'completed').

8. dashboardSelfService.js (Personal Self-Service Analytics Hub):
   - Endpoints: GET /api/dashboard/self-service/stats, GET /api/dashboard/self-service/activity-chart, GET /api/dashboard/self-service/pillars, GET /api/dashboard/self-service/today-overview
   - Capabilities: User personal metrics, pending vs completed tasks, today's schedule agenda, activity trends, and strategic pillars progress.

9. meetingController.js (Meeting Scheduling & Video Conference Management):
   - Endpoints: GET /api/meetings, POST /api/meetings, PUT /api/meetings/:id, POST /api/meetings/:id/respond, POST /api/meetings/:id/postpone, POST /api/meetings/:id/end, POST /api/meetings/:id/reminders
   - Tables: meetings, meeting_participants, meeting_attachments, meeting_minutes, meeting_reminders
   - Capabilities: Schedules one-on-one, team, department, or company-wide meetings with Zoom ID/passcode, meeting links, recurrence rules, RSVP tracking (accepted, declined, tentative), and logs minutes of meetings.

10. kpiAssignmentController.js (KPI Cascading & Position Delegation):
    - Endpoints: GET /api/kpis/my-assigned, GET /api/kpis/subordinates, POST /api/kpis/delegate
    - Tables: kpi_positions, employee_positions, specific_objective_details, employees
    - Capabilities: Cascades high-level strategic KPIs down the hierarchy from directors to department heads, section heads, and staff positions.

11. notificationController.js (In-App Alerts & Push Notifications):
    - Endpoints: GET /api/notifications, GET /api/notifications/unread-count, PUT /api/notifications/:id/read, PUT /api/notifications/mark-all-read, DELETE /api/notifications/:id, POST /api/notifications/alert
    - Tables: notifications
    - Capabilities: Real-time user alerts for task assignments, plan approvals, rejections, meeting invites, and priority system announcements.

12. organizationStructureController.js (Interactive Hierarchy Tree):
    - Endpoints: GET /api/admin/org-structure/tree, POST /api/admin/org-structure/unit, PUT /api/admin/org-structure/unit/:id, DELETE /api/admin/org-structure/unit/:id, GET /api/admin/org-structure/types
    - Tables: organization_structure, organization_types, employee_positions
    - Capabilities: Multi-level organizational hierarchy tree (Board -> CEO -> Deputy CEO -> Directorates -> Departments -> Sections -> Units) with parent-child integrity validation.

13. passwordController.js (Security, Password Reset & OTP Engine):
    - Endpoints: POST /api/password/change, POST /api/password/request-reset, POST /api/password/verify-otp, POST /api/password/reset
    - Tables: users, password_resets, otp_logs
    - Capabilities: Password complexity validation, bcrypt hashing, 6-digit numeric OTP delivery via SMTP email, 15-minute expiration window, maximum 5 attempt rate limiting.

14. pillarController.js (5-Year Strategic Corporate Pillars):
    - Endpoints: GET /api/plan/pillars, POST /api/plan/pillars, PUT /api/plan/pillars/:id, DELETE /api/plan/pillars/:id, POST /api/plan/pillars/assign-goals
    - Tables: pillars, goals
    - Capabilities: Corporate 5-year pillars (Infrastructure, Digitalization, Investment, etc.) and goal alignment (goals.pillar_id).

15. planDtailedController.js (Strategic Plan Formulation & Weight Balancing):
    - Endpoints: /api/plan/add-goals, /api/plan/add-objectives, /api/plan/add-specific-objectives, /api/plan/add-details, /api/plan/distribute-weights
    - Tables: goals, objectives, specific_objectives, specific_objective_details
    - Capabilities: 4-tier planning architecture (Goal -> Objective -> Specific Objective -> Specific Objective Details/KPIs). Balances weights so that sum(goal weights) = 100%, sum(objective weights) = 100%, and sum(KPI weights) = 100%.

16. profileUploadController.js (Avatar Management):
    - Endpoints: POST /api/profile/upload-picture, GET /api/profile/picture/:userId
    - Tables: users, employees
    - Capabilities: Avatar uploads, image optimization, file persistence, updating users.avatar_url.

17. roleController.js (Role-Based Access Control & Hierarchical Authority):
    - Endpoints: GET /api/roles, GET /api/roles/hierarchy, POST /api/roles, PUT /api/roles/:id, DELETE /api/roles/:id
    - Tables: roles, role_permissions, users
    - Capabilities: Hierarchy scale from Level 1 (CEO / Admin) to Level 14 (Staff), defining approval rights and data visibility.

18. taskAssignmentController.js (Task Delegation, Execution & Confirmation Engine):
    - Endpoints: POST /api/task-assignments/assign, GET /api/task-assignments/assigned-to-me, GET /api/task-assignments/assigned-by-me, GET /api/task-assignments/supervised-users, PUT /api/task-assignments/:id/status, PUT /api/task-assignments/:id/confirm, PUT /api/task-assignments/:id/reject, GET /api/task-assignments/hub-alerts, GET /api/task-assignments/performance-ranking
    - Tables: task_assignments, users, employees, departments, organization_structure
    - Capabilities: Assign tasks with roles (Executor, Reviewer), urgency (urgent, high, medium, low), due dates, attachments. Full lifecycle tracking (pending -> in_progress -> completed -> confirmed / rejected). Deep recursive hierarchy discovery for supervisors.

19. userController.js (User Administration & Account Lifecycle):
    - Endpoints: GET /api/getAllUsers, PUT /api/changeUserStatus, PUT /api/updateUser/:id, DELETE /api/deleteUser/:id
    - Tables: users, employees, roles, departments
    - Capabilities: User account lifecycle, credentials, linking users to employees, activating/deactivating accounts (status = '1' vs '0').

20. taskBreakdownController.js (Action Plan Monthly & Weekly Decomposition):
    - Endpoints: GET /api/tasks/breakdown/:detailId, POST /api/tasks/breakdown/monthly, POST /api/tasks/breakdown/weekly, PUT /api/tasks/breakdown/progress, POST /api/tasks/breakdown/assignees, GET /api/tasks/breakdown/my-received
    - Tables: monthly_tasks, weekly_tasks, monthly_task_assignees, weekly_task_assignees, specific_objective_details
    - Capabilities: Breaks down approved annual KPIs into 12 monthly tasks and 4 weekly tasks per month, distributing weights and tracking micro-execution progress.

21. taskController.js (General Task Operations & Reminders):
    - Endpoints: GET /api/tasks, POST /api/tasks, PUT /api/tasks/:id, DELETE /api/tasks/:id, POST /api/tasks/:id/reminders, POST /api/tasks/:id/supervisors
    - Tables: tasks, task_reminders, task_notifications, task_supervisors
    - Capabilities: Operations tracking, task reminders, assigning supervisor oversight to team activities.

22. applicantController.js (Recruitment & Job Application Intake):
    - Endpoints: GET /api/applicants
    - Tables: applicants
    - Capabilities: Ingests and reviews recruitment candidates, CVs, contact details, and application states.

====================================================================
COMPREHENSIVE SYSTEM CONTROLS & PAGES NAVIGATION GUIDE:
====================================================================
When guiding the user, provide direct markdown links (e.g. [Page Name](/route)):
- [Daily Planner](/tasks/daily): Daily checklist with priorities, time slots, completion toggles.
- [Assign New Task](/tasks/assignment/assign): Assign tasks with roles, due dates, urgency, files.
- [Received Tasks](/tasks/assignment/received): Tasks assigned to the user to execute and submit.
- [Sent Tasks Tracking](/tasks/assignment/sent): Track delegated tasks, confirm or reject completions.
- [Team Subordinates](/tasks/assignment/subordinates): Supervisor view of team members' active workloads.
- [Task Analytics & Breakdown](/tasks/breakdown): Analytics and action plan decompositions.
- [KPI Position Assignment](/kpi/my-assigned): View assigned KPIs and cascade to subordinates.
- Top Header Meeting Icon: Advanced Meeting Scheduler modal for 1-on-1s, teams, Zoom links.
- [Add Strategic Plan](/plan/PlanSteps/Add): Strategic planning wizard (Goals, Objectives, KPIs).
- [My Submitted Plans](/plan/View_myplan): View and manage user's submitted plans.
- [Hierarchy Plan Approvals](/plan/hierarchy-approvals): Supervisor plan approval workflow.
- [Organization Plans](/plan/ViewOrgPlan): Corporation-wide strategic plans view.
- [Strategic Plan Overview](/Stategy-plan/View), [Plan Pillars](/plan-pillars), [Goal Config](/goal-config).
- [Submit Report](/report/Add), [My Reports](/report/View_myreport), [Overall Reporting & AI](/report/overall), [Executive Reports](/reports/executive), [Export Data](/reports/export).
- [Organization Structure](/admin/org-structure), [Employee Positions](/admin/employee-positions), [User Directory](/UserTable), [Audit Trail & Logs](/admin/logs), [System Settings](/settings).

====================================================================
RESPONSE INSTRUCTIONS & FORMATTING:
====================================================================
1. DEEP SYSTEM & ARCHITECTURAL EXPERTISE:
   - You know the codebase, all 22 controllers, their exact API paths, parameters, schemas, and workflows.
   - When asked about how any feature, controller, or API works, explain the exact workflow, database behavior, and navigation path clearly.
2. DIRECT, STRUCTURED, AND ACTIONABLE:
   - When asked "what tasks do I have for today" or similar:
     * Break down with clear Markdown headings (### 🎯 Priority Tasks Assigned to You, ### 📋 Today's Daily Planner, ### 👥 Subordinate Team Overview, ### 📤 Tasks You Delegated).
     * Use visual badges: 🔴 Urgent, 🟠 High, 🟡 Medium, 🟢 Low.
     * Include Status: ⏳ Pending, 🔄 In Progress, ✅ Completed.
     * For each task, show: Title, Priority, Due Date, and who assigned it.
     * If the user is a supervisor (like a Section Head), ALWAYS provide their subordinates' task status so they know what their team is working on.
     * Provide direct navigation links (e.g. [Open Received Tasks](/tasks/assignment/received), [Manage Daily Tasks](/tasks/daily)).
3. TONE:
   - Executive, articulate, empowering, and exceptionally knowledgeable.
   - Address the user respectfully by their name or title if known.`
            };

            const groqRes = await callGroqWithFallback({
                messages: [systemPrompt, ...messages],
                temperature: 0.4
            }, apiKey);

            const aiResponse = groqRes.choices[0].message.content;
            return res.status(200).json({ success: true, reply: aiResponse });

        } catch (apiError) {
            console.error("Groq Chat Error:", apiError.message);
            return res.status(200).json({ 
                success: true, 
                reply: `Hello ${userProfile ? userProfile.fname : ''}! I am Master Mind, your Ethiopian IT Park AI assistant. I have direct access to your real-time tasks and complete system controls. You currently have ${myReceivedTasks.length} received task(s) and ${myDailyTasks.length} daily task(s) on file. Please open [Received Tasks](/tasks/assignment/received) or [Daily Planner](/tasks/daily) to inspect them in detail.`
            });
        }
    } catch (error) {
        console.error("Chat Controller Error:", error.message);
        res.status(500).json({ success: false, message: "Server error." });
    }
};


