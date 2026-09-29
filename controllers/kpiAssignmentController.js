const con = require('../models/db');

// Helper to safely parse JSON strings or comma/array strings
const parseOrgNodeIds = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(v => String(v));
    try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map(v => String(v));
    } catch (e) {}
    if (typeof val === 'string') {
        return val.replace(/[\[\]"']/g, '').split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
};

// GET /api/kpis/assigned-to-my-position
const getMyAssignedKPIs = async (req, res) => {
    try {
        const user_id = req.user_id;

        // 1. Fetch user details, role, department, employee ID, and position org nodes
        const userDetailsSql = `
            SELECT 
                u.user_id,
                u.user_name as username,
                u.employee_id,
                e.department_id as emp_dept_id,
                r.role_name,
                GROUP_CONCAT(DISTINCT ep.org_node_id) as ep_org_nodes,
                GROUP_CONCAT(DISTINCT ep.position_id) as ep_positions
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN employee_positions ep ON u.employee_id = ep.employee_id
            WHERE u.user_id = ?
            GROUP BY u.user_id
        `;

        con.query(userDetailsSql, [user_id], (uErr, userRows) => {
            if (uErr) {
                console.error("Database Error fetching user profile:", uErr.message);
                return res.status(500).json({ success: false, message: uErr.message });
            }

            const userRow = (userRows && userRows.length > 0) ? userRows[0] : {};
            const roleName = (userRow.role_name || "").trim();
            const lowerRoleName = roleName.toLowerCase();

            // Broad privileged check for Admin/CEO/Executive
            const isGlobal = ["admin", "super admin", "administrator", "ceo", "deputy ceo", "executive", "top executive"]
                .some(r => lowerRoleName.includes(r));

            const userOrgNodes = new Set();
            // Add department from employees table
            if (userRow.emp_dept_id) userOrgNodes.add(String(userRow.emp_dept_id));
            // Add org_node_ids from employee_positions (primary way positions are stored)
            if (userRow.ep_org_nodes) {
                userRow.ep_org_nodes.split(',').forEach(id => userOrgNodes.add(String(id.trim())));
            }
            // Add position_id values (secondary)
            if (userRow.ep_positions) {
                userRow.ep_positions.split(',').forEach(id => userOrgNodes.add(String(id.trim())));
            }

            console.log(`[KPI Debug] user_id=${user_id}, role="${roleName}", emp_dept_id=${userRow.emp_dept_id}, ep_org_nodes=${userRow.ep_org_nodes}, userOrgNodes=[${Array.from(userOrgNodes).join(',')}]`);

            // 2. Fetch all organization_structure nodes & map names/Amharic names to IDs
            con.query('SELECT id, name, name_amharic FROM organization_structure', [], (orgErr, orgNodes) => {
                const orgMap = {};
                const nameToIdMap = {};

                if (orgNodes) {
                    orgNodes.forEach(node => {
                        const nid = String(node.id);
                        orgMap[nid] = node.name || node.name_amharic || `Position #${nid}`;
                        if (node.name) nameToIdMap[node.name.toLowerCase().trim()] = nid;
                        if (node.name_amharic) nameToIdMap[node.name_amharic.toLowerCase().trim()] = nid;
                    });
                }

                if (roleName && nameToIdMap[lowerRoleName]) {
                    userOrgNodes.add(nameToIdMap[lowerRoleName]);
                }

                // 3. Query specific_objectives (org_node_ids live here) + join sod for metrics
                const kpiSql = `
                    SELECT 
                        so.specific_objective_id,
                        so.specific_objective_id as specific_objective_detail_id,
                        so.specific_objective_name,
                        so.view,
                        so.weight,
                        so.plan_type,
                        so.department_id,
                        so.org_node_ids,
                        so.supportive_org_node_ids,
                        so.created_at,
                        os.name as department_name,
                        COALESCE(so.objective_id, o.objective_id) as objective_id,
                        COALESCE(o.name, (SELECT name FROM objectives WHERE objective_id = so.objective_id)) as objective_name,
                        COALESCE(o.description, (SELECT description FROM objectives WHERE objective_id = so.objective_id)) as objective_description,
                        COALESCE(g.goal_id, sod.goal_id, o.goal_id) as goal_id,
                        COALESCE(g.name, (SELECT name FROM goals WHERE goal_id = COALESCE(sod.goal_id, o.goal_id))) as goal_name,
                        COALESCE(g.description, (SELECT description FROM goals WHERE goal_id = COALESCE(sod.goal_id, o.goal_id))) as goal_description,
                        COALESCE(g.year, (SELECT year FROM goals WHERE goal_id = COALESCE(sod.goal_id, o.goal_id))) as goal_year,
                        COALESCE(g.quarter, (SELECT quarter FROM goals WHERE goal_id = COALESCE(sod.goal_id, o.goal_id))) as goal_quarter,
                        COALESCE(g.weight, (SELECT weight FROM goals WHERE goal_id = COALESCE(sod.goal_id, o.goal_id))) as goal_weight,
                        COALESCE(g.start_year, (SELECT start_year FROM goals WHERE goal_id = COALESCE(sod.goal_id, o.goal_id))) as goal_start_year,
                        COALESCE(g.end_year, (SELECT end_year FROM goals WHERE goal_id = COALESCE(sod.goal_id, o.goal_id))) as goal_end_year,
                        pp.name as pillar_name,
                        COALESCE(AVG(sod.execution_percentage), 0) as execution_percentage,
                        MAX(sod.baseline) as baseline,
                        MAX(sod.plan) as plan,
                        MAX(sod.measurement) as measurement,
                        MAX(sod.year) as year,
                        MAX(sod.priority) as priority,
                        MAX(sod.status) as status,
                        CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) as owner_name,
                        pbs_name.delegated_to_name,
                        pbs_name.delegated_to_user_id
                    FROM specific_objectives so
                    LEFT JOIN specific_objective_details sod ON sod.specific_objective_id = so.specific_objective_id
                    LEFT JOIN objectives o ON so.objective_id = o.objective_id
                    LEFT JOIN goals g ON (g.goal_id = o.goal_id OR g.goal_id = sod.goal_id)
                    LEFT JOIN plan_pillars pp ON g.pillar_id = pp.id
                    LEFT JOIN organization_structure os ON so.department_id = os.id
                    LEFT JOIN users u ON sod.user_id = u.user_id
                    LEFT JOIN employees e ON u.employee_id = e.employee_id
                    LEFT JOIN (
                        SELECT 
                            COALESCE(sod_sub.specific_objective_id, pbs.specific_objective_detail_id) as specific_objective_id,
                            pbs.supervisor_user_id as delegated_to_user_id,
                            CONCAT(COALESCE(e2.fname, u2.user_name, ''), ' ', COALESCE(e2.lname, '')) as delegated_to_name
                        FROM plan_breakdown_supervisors pbs
                        JOIN users u2 ON pbs.supervisor_user_id = u2.user_id
                        LEFT JOIN employees e2 ON u2.employee_id = e2.employee_id
                        LEFT JOIN specific_objective_details sod_sub ON sod_sub.specific_objective_detail_id = pbs.specific_objective_detail_id
                        UNION
                        SELECT 
                            COALESCE(sod_sub2.specific_objective_id, CAST(SUBSTRING_INDEX(ta.category, ':', -1) AS UNSIGNED)) as specific_objective_id,
                            ta.assigned_to as delegated_to_user_id,
                            CONCAT(COALESCE(e3.fname, u3.user_name, ''), ' ', COALESCE(e3.lname, '')) as delegated_to_name
                        FROM task_assignments ta
                        JOIN users u3 ON ta.assigned_to = u3.user_id
                        LEFT JOIN employees e3 ON u3.employee_id = e3.employee_id
                        LEFT JOIN specific_objective_details sod_sub2 ON sod_sub2.specific_objective_detail_id = CAST(SUBSTRING_INDEX(ta.category, ':', -1) AS UNSIGNED)
                        WHERE ta.category LIKE 'action_plan_breakdown:%'
                    ) pbs_name ON pbs_name.specific_objective_id = so.specific_objective_id
                    GROUP BY so.specific_objective_id, so.specific_objective_name, so.view, so.weight,
                             so.plan_type, so.department_id, so.org_node_ids, so.supportive_org_node_ids,
                             so.created_at, os.name, so.objective_id, o.objective_id, o.name, o.description,
                             g.goal_id, sod.goal_id, o.goal_id, g.name, g.description, g.year, g.quarter,
                             g.weight, g.start_year, g.end_year, pp.name, e.fname, e.lname,
                             pbs_name.delegated_to_name, pbs_name.delegated_to_user_id
                    ORDER BY so.specific_objective_id DESC
                `;

                con.query(kpiSql, [], (kErr, soRows) => {
                    if (kErr) {
                        console.error('[KPI Error] kpiSql failed:', kErr.message);
                        return res.status(500).json({ success: false, message: kErr.message });
                    }

                    const rawKpis = soRows || [];
                    console.log(`[KPI Debug] rawKpis count: ${rawKpis.length}, userOrgNodes: [${Array.from(userOrgNodes).join(',')}]`);

                    const activeOnly = req.query.active_only !== 'false';
                    const matchedKpis = [];

                    rawKpis.forEach(k => {
                        // If active_only filter is active, skip inactive KPIs
                        if (activeOnly && (k.is_active === 0 || (k.status || '').toLowerCase() === 'inactive')) {
                            return;
                        }

                        const leadNodeIds = parseOrgNodeIds(k.org_node_ids);
                        const suppNodeIds = parseOrgNodeIds(k.supportive_org_node_ids);

                        const leadNames = leadNodeIds.map(id => orgMap[id] || `Node #${id}`);
                        const suppNames = suppNodeIds.map(id => orgMap[id] || `Node #${id}`);

                        // Match checks
                        const isDelegated = k.delegated_to_user_id && String(k.delegated_to_user_id) === String(user_id);
                        const isLeadPos = leadNodeIds.some(id => userOrgNodes.has(id));
                        const isSuppPos = suppNodeIds.some(id => userOrgNodes.has(id));
                        const isDeptMatch = k.department_id && userOrgNodes.has(String(k.department_id));

                        const isMatch = isGlobal || isDelegated || isLeadPos || isSuppPos || isDeptMatch;

                        if (isMatch) {
                            matchedKpis.push({
                                ...k,
                                lead_positions: leadNames,
                                supportive_positions: suppNames,
                                is_lead_assigned: isLeadPos,
                                is_supportive_assigned: isSuppPos,
                                is_delegated: Boolean(k.delegated_to_name)
                            });
                        }
                    });

                    console.log(`[KPI Debug] matched ${matchedKpis.length} of ${rawKpis.length} KPIs`);

                    res.status(200).json({
                        success: true,
                        kpis: matchedKpis,
                        data: matchedKpis,
                        isGlobal
                    });
                });
            });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/kpis/subordinates - Get available subordinates for delegation under user's position / department
const getSubordinatesForKPI = async (req, res) => {
    try {
        const user_id = req.user_id;

        const sql = `
            SELECT u.user_id, u.user_name as username, u.role_id,
                   CONCAT(COALESCE(e.fname, u.user_name, ''), ' ', COALESCE(e.lname, '')) as full_name,
                   os.name as department_name,
                   r.role_name
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            LEFT JOIN organization_structure os ON e.department_id = os.id
            LEFT JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id != ?
            ORDER BY full_name ASC
        `;

        con.query(sql, [user_id], (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.status(200).json({ success: true, subordinates: rows || [] });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/kpis/delegate - Delegate one or multiple KPIs to a subordinate
const delegateKPI = async (req, res) => {
    try {
        const user_id = req.user_id;
        let { specific_objective_detail_id, specific_objective_detail_ids, delegate_to_user_id, note, due_date, priority } = req.body;

        const ids = specific_objective_detail_ids && Array.isArray(specific_objective_detail_ids) && specific_objective_detail_ids.length > 0
            ? specific_objective_detail_ids.map(Number).filter(id => !isNaN(id) && id > 0)
            : (specific_objective_detail_id ? [Number(specific_objective_detail_id)].filter(id => !isNaN(id) && id > 0) : []);

        if (ids.length === 0 || !delegate_to_user_id) {
            return res.status(400).json({ success: false, message: 'At least one KPI ID and Subordinate selection are required' });
        }

        // 1. Insert/update plan_breakdown_supervisors in bulk
        const pbsValues = ids.map(id => [id, delegate_to_user_id]);
        const pbsSql = `
            INSERT INTO plan_breakdown_supervisors (specific_objective_detail_id, supervisor_user_id)
            VALUES ?
            ON DUPLICATE KEY UPDATE supervisor_user_id = VALUES(supervisor_user_id)
        `;

        con.query(pbsSql, [pbsValues], (err) => {
            if (err) {
                console.error('Error inserting plan_breakdown_supervisors:', err);
                return res.status(500).json({ success: false, message: err.message });
            }

            // 2. Fetch KPI names
            con.query('SELECT specific_objective_id, specific_objective_name, name FROM specific_objectives WHERE specific_objective_id IN (?)', [ids], (kErr, kRows) => {
                const kpiMap = new Map();
                (kRows || []).forEach(r => kpiMap.set(Number(r.specific_objective_id), r.specific_objective_name || r.name || `KPI #${r.specific_objective_id}`));

                const taskValues = [];
                const notifValues = [];

                ids.forEach(id => {
                    const kpiName = kpiMap.get(id) || `KPI #${id}`;
                    const title = `⚡ Delegated KPI: ${kpiName}`;
                    const desc = note || `You have been delegated responsibility for KPI "${kpiName}". Please create or update its action plan breakdown.`;
                    const cat = `action_plan_breakdown:${id}`;

                    taskValues.push([title, desc, user_id, delegate_to_user_id, priority || 'high', 'pending', due_date || null, cat]);
                    notifValues.push([delegate_to_user_id, '⚡ KPI Delegated to You', desc, 'kpi_delegation', 0]);
                });

                const taskSql = `
                    INSERT INTO task_assignments (title, description, assigned_by, assigned_to, priority, status, due_date, category)
                    VALUES ?
                `;

                con.query(taskSql, [taskValues], (tErr) => {
                    if (tErr) console.error('Error inserting task assignments:', tErr);

                    const notifSql = `
                        INSERT INTO notifications (user_id, title, message, type, is_read)
                        VALUES ?
                    `;

                    con.query(notifSql, [notifValues], () => {
                        res.status(200).json({
                            success: true,
                            message: ids.length === 1
                                ? `KPI delegated successfully!`
                                : `${ids.length} KPIs delegated successfully to the selected subordinate!`
                        });
                    });
                });
            });
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getMyAssignedKPIs, getSubordinatesForKPI, delegateKPI };
