const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const con = require('../models/db');

// ─── Auto-register menu items in DB on startup ────────────────────────────────
(async function registerMenuPermissions() {
    try {
        const query = (sql, params) => new Promise((res, rej) => con.query(sql, params, (err, r) => err ? rej(err) : res(r)));
        const addMenu = async (name, path, icon, sort, parent_id = null) => {
            const ext = await query('SELECT id FROM menu_items WHERE path = ? AND name = ?', [path, name]);
            if (ext.length > 0) {
                if (parent_id) await query('UPDATE menu_items SET parent_id = ? WHERE id = ?', [parent_id, ext[0].id]);
                return ext[0].id;
            }
            const res = await query('INSERT INTO menu_items (name, path, icon, parent_id, sort_order, is_active) VALUES (?, ?, ?, ?, ?, 1)', [name, path, icon, parent_id, sort]);
            console.log(`[Auto-Reg] Created menu: ${name}`);
            return res.insertId;
        };
        const grant = async (menuId, roles) => {
            for (const r of roles) {
                const ext = await query('SELECT id FROM role_permissions WHERE role_id = ? AND menu_item_id = ?', [r, menuId]);
                if (ext.length === 0) await query('INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 0, 0, 0)', [r, menuId]);
            }
        };
        
        // Clean up old deprecated monolithic route
        await query('DELETE FROM role_permissions WHERE menu_item_id IN (SELECT id FROM menu_items WHERE path = ?)', ['/reports/module']);
        await query('DELETE FROM menu_items WHERE path = ?', ['/reports/module']);

        const roles = [1, 2, 3, 4, 5, 29];
        
        // Executive Report (Root)
        const execId = await addMenu('Executive Report', '/reports/executive', 'bi bi-bar-chart-steps', 10);
        await grant(execId, roles);
        
        // Parent Folder: Report Module
        const parentId = await addMenu('Report Module', '#reports', 'bi bi-pie-chart-fill', 11);
        await grant(parentId, roles);
        
        // Children under Report Module
        const planRepId = await addMenu('Plan Report', '/reports/plans', 'bi bi-clipboard-data', 1, parentId);
        await grant(planRepId, roles);
        
        const repSubId = await addMenu('Report Submissions', '/reports/submissions', 'bi bi-file-earmark-check', 2, parentId);
        await grant(repSubId, roles);
        
        const empRepId = await addMenu('Employee Report', '/reports/employees', 'bi bi-person-lines-fill', 3, parentId);
        await grant(empRepId, roles);
        
        const orgRepId = await addMenu('Org Structure Report', '/reports/org-structure', 'bi bi-diagram-3', 4, parentId);
        await grant(orgRepId, roles);
    } catch (e) {
        console.error('[Auto-Reg] Menu registration error:', e.message);
    }
})();

// ─── Shared period/filter WHERE builder ────────────────────────────────────────
function buildPeriodWhere(params, query) {
    const { year_from, year_to, year, quarter, month, week, plan_type, org_node_id, user_id, scope_user_ids, pillar_id, goal_id, objective_id, kpi_id } = query;
    const clauses = [];

    if (pillar_id && pillar_id !== 'all') { clauses.push('g.pillar_id = ?'); params.push(pillar_id); }
    if (goal_id && goal_id !== 'all') { clauses.push('(g.goal_id = ? OR sod.goal_id = ?)'); params.push(goal_id, goal_id); }
    if (objective_id && objective_id !== 'all') { clauses.push('so.objective_id = ?'); params.push(objective_id); }
    if (kpi_id && kpi_id !== 'all') { clauses.push('sod.specific_objective_id = ?'); params.push(kpi_id); }

    if (scope_user_ids && scope_user_ids !== 'all') {
        const ids = scope_user_ids.split(',').map(id => Number(id.trim())).filter(Boolean);
        if (ids.length > 0) { clauses.push('sod.user_id IN (?)'); params.push(ids); }
    } else if (user_id && user_id !== 'all') {
        clauses.push('sod.user_id = ?'); params.push(user_id);
    }

    if (year_from && year_to && year_from !== 'all' && year_to !== 'all') {
        clauses.push('COALESCE(g.year, YEAR(sod.created_at)) BETWEEN ? AND ?');
        params.push(Number(year_from), Number(year_to));
    } else if (year && year !== 'all') {
        clauses.push('COALESCE(g.year, YEAR(sod.created_at)) = ?'); params.push(year);
    }
    if (quarter && quarter !== 'all') { clauses.push('g.quarter = ?'); params.push(quarter); }
    if (month && month !== 'all') { clauses.push('MONTH(sod.created_at) = ?'); params.push(month); }
    if (week && week !== 'all') { clauses.push('WEEK(sod.created_at, 1) = ?'); params.push(week); }
    if (plan_type && plan_type !== 'all') { clauses.push('sod.plan_type = ?'); params.push(plan_type); }
    if (org_node_id && org_node_id !== 'all') {
        clauses.push('(ep.org_node_id = ? OR e.department_id = ?)'); params.push(org_node_id, org_node_id);
    }
    return clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';
}

// ─── Shared plan SELECT + JOINs ───────────────────────────────────────────────
const PLAN_SQL_BASE = `
    SELECT
        sod.specific_objective_detail_id AS plan_id,
        COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS plan_name,
        sod.plan_type, sod.status, COALESCE(sod.priority,'Normal') AS priority,
        COALESCE(sod.weight, sod.plan, 0) AS plan_weight,
        sod.CIplan, sod.plan AS plan_value, sod.CIbaseline, sod.CIoutcome, sod.outcome,
        sod.baseline, sod.measurement, sod.deadline,
        YEAR(sod.created_at) AS plan_year, MONTH(sod.created_at) AS plan_month,
        WEEK(sod.created_at, 1) AS plan_week,
        COALESCE(p.name,'') AS pillar_name,
        g.year AS goal_year, g.quarter AS goal_quarter, COALESCE(g.name,'') AS goal_name,
        COALESCE(o.name,'') AS objective_name,
        COALESCE(so.specific_objective_name, so.name,'') AS kpi_name,
        CONCAT(COALESCE(e.fname,''),' ',COALESCE(e.lname,'')) AS employee_name,
        COALESCE(pos.title, pos.name,'Staff') AS position_name,
        COALESCE(os.name_amharic, os.name,'N/A') AS dept_name,
        os.id AS org_node_id, os.level AS org_level, os.type AS org_type,
        e.employee_id, sod.user_id,
        CASE
            WHEN COALESCE(NULLIF(sod.CIplan,0),(CASE WHEN sod.plan>1 THEN sod.plan ELSE NULL END),0)>0
                THEN LEAST(100, ROUND(COALESCE(sod.outcome,sod.CIoutcome,0)/COALESCE(NULLIF(sod.CIplan,0),(CASE WHEN sod.plan>1 THEN sod.plan ELSE NULL END))*100,2))
            WHEN COALESCE(sod.execution_percentage,sod.CIexecution_percentage,sod.progress,0)>0
                THEN COALESCE(sod.execution_percentage,sod.CIexecution_percentage,sod.progress,0)
            WHEN UPPER(COALESCE(sod.status,''))='COMPLETED' THEN 100
            ELSE 0
        END AS execution_pct,
        ROUND((CASE
            WHEN COALESCE(NULLIF(sod.CIplan,0),(CASE WHEN sod.plan>1 THEN sod.plan ELSE NULL END),0)>0
                THEN LEAST(100, ROUND(COALESCE(sod.outcome,sod.CIoutcome,0)/COALESCE(NULLIF(sod.CIplan,0),(CASE WHEN sod.plan>1 THEN sod.plan ELSE NULL END))*100,2))
            WHEN COALESCE(sod.execution_percentage,sod.CIexecution_percentage,sod.progress,0)>0
                THEN COALESCE(sod.execution_percentage,sod.CIexecution_percentage,sod.progress,0)
            WHEN UPPER(COALESCE(sod.status,''))='COMPLETED' THEN 100
            ELSE 0
        END/100.0)*COALESCE(NULLIF(sod.weight,0),(CASE WHEN sod.plan<=1 THEN sod.plan ELSE NULL END),1.0),4) AS weight_achieved,
        (SELECT COUNT(*) FROM monthly_tasks mt WHERE mt.specific_objective_detail_id=sod.specific_objective_detail_id) AS task_count,
        (SELECT COUNT(*) FROM reports r WHERE r.plan_id=sod.specific_objective_detail_id) AS report_count
    FROM specific_objective_details sod
    LEFT JOIN specific_objectives so ON sod.specific_objective_id=so.specific_objective_id
    LEFT JOIN objectives o ON so.objective_id=o.objective_id
    LEFT JOIN goals g ON g.goal_id=COALESCE(sod.goal_id,o.goal_id)
    LEFT JOIN plan_pillars p ON g.pillar_id=p.id
    LEFT JOIN users u ON sod.user_id=u.user_id
    LEFT JOIN employees e ON u.employee_id=e.employee_id
    LEFT JOIN (
        SELECT employee_id, MAX(position_id) as position_id FROM employee_positions WHERE is_primary=1 GROUP BY employee_id
    ) ep ON e.employee_id=ep.employee_id
    LEFT JOIN positions pos ON ep.position_id=pos.position_id
    LEFT JOIN organization_structure os ON sod.department_id=os.id
`;

function buildSummary(rows) {
    const byMonth={}, byQuarter={}, byWeek={}, byType={};
    rows.forEach(r => {
        const ym=`${r.goal_year||r.plan_year||'?'}-${String(r.plan_month||0).padStart(2,'0')}`;
        const qk=`${r.goal_year||r.plan_year||'?'} ${r.goal_quarter||''}`.trim();
        const wk=`W${r.plan_week||0}`;
        [[byMonth,ym],[byQuarter,qk],[byWeek,wk]].forEach(([map,k])=>{
            if(!map[k]) map[k]={period:k,plans:0,total_pct:0,weight:0,achieved:0};
            map[k].plans++; map[k].total_pct+=Number(r.execution_pct)||0;
            map[k].weight+=Number(r.plan_weight)||0; map[k].achieved+=Number(r.weight_achieved)||0;
        });
        const t=r.plan_type||'general';
        if(!byType[t]) byType[t]={type:t,plans:0,total_pct:0,target:0,achieved_val:0};
        byType[t].plans++; byType[t].total_pct+=Number(r.execution_pct)||0;
        byType[t].target+=Number(r.CIplan)>1?Number(r.CIplan):(Number(r.plan_value)>1?Number(r.plan_value):0);
        byType[t].achieved_val+=Number(r.CIoutcome)||Number(r.outcome)||0;
    });
    const toTrend=map=>Object.values(map).map(v=>({...v,avg_pct:v.plans>0?Math.round(v.total_pct/v.plans*10)/10:0})).sort((a,b)=>a.period.localeCompare(b.period));
    return {
        total_plans: rows.length,
        total_planned_weight: Math.round(rows.reduce((s,r)=>s+(Number(r.plan_weight)||0),0)*100)/100,
        total_achieved_weight: Math.round(rows.reduce((s,r)=>s+(Number(r.weight_achieved)||0),0)*100)/100,
        avg_execution_pct: rows.length>0?Math.round(rows.reduce((s,r)=>s+(Number(r.execution_pct)||0),0)/rows.length*10)/10:0,
        completed: rows.filter(r=>(r.status||'').toLowerCase()==='completed'||(Number(r.execution_pct)||0)>=99.9).length,
        in_progress: rows.filter(r=>{const p=Number(r.execution_pct)||0;return p>0&&p<99.9;}).length,
        pending: rows.filter(r=>(Number(r.execution_pct)||0)===0).length,
        by_type: Object.values(byType).map(t=>({...t,avg_pct:t.plans>0?Math.round(t.total_pct/t.plans*10)/10:0})),
        monthly_trend: toTrend(byMonth),
        quarterly_trend: toTrend(byQuarter),
        weekly_trend: toTrend(byWeek),
    };
}

// ─── 1. GET /api/report-module/plans ─────────────────────────────────────────
router.get('/plans', verifyToken, (req, res) => {
    const params=[];
    let where = buildPeriodWhere(params, req.query);
    const {search} = req.query;
    const extra=[];
    if(search){extra.push(`(COALESCE(sod.specific_objective_detailname,sod.name,'') LIKE ? OR CONCAT(COALESCE(e.fname,''),' ',COALESCE(e.lname,'')) LIKE ? OR COALESCE(os.name,'') LIKE ?)`);const s=`%${search}%`;params.push(s,s,s);}
    if(extra.length>0) where = where ? where+' AND '+extra.join(' AND ') : 'WHERE '+extra.join(' AND ');
    const sql=PLAN_SQL_BASE+where+' ORDER BY execution_pct DESC, plan_weight DESC LIMIT 2000';
    con.query(sql,params,(err,rows)=>{
        if(err) return res.status(500).json({success:false,error:err.message});
        res.json({success:true, plans:rows, summary:buildSummary(rows)});
    });
});

// ─── 2. GET /api/report-module/reports ───────────────────────────────────────
router.get('/reports', verifyToken, (req, res) => {
    const params = [];
    const { year_from, year_to, year, quarter, month, week, plan_type, org_node_id, user_id, search } = req.query;
    const clauses = [];

    if (year_from && year_to && year_from !== 'all' && year_to !== 'all') {
        clauses.push('YEAR(r.created_at) BETWEEN ? AND ?'); params.push(Number(year_from), Number(year_to));
    } else if (year && year !== 'all') { clauses.push('YEAR(r.created_at)=?'); params.push(year); }
    if (quarter && quarter !== 'all') { clauses.push("CASE WHEN MONTH(r.created_at) IN (1,2,3) THEN 'Q1' WHEN MONTH(r.created_at) IN (4,5,6) THEN 'Q2' WHEN MONTH(r.created_at) IN (7,8,9) THEN 'Q3' ELSE 'Q4' END=?"); params.push(quarter); }
    if (month && month !== 'all') { clauses.push('MONTH(r.created_at)=?'); params.push(month); }
    if (week && week !== 'all') { clauses.push('WEEK(r.created_at,1)=?'); params.push(week); }
    if (user_id && user_id !== 'all') { clauses.push('r.user_id=?'); params.push(user_id); }
    if (org_node_id && org_node_id !== 'all') { clauses.push('os.id=?'); params.push(org_node_id); }
    if (plan_type && plan_type !== 'all') { clauses.push('sod.plan_type=?'); params.push(plan_type); }
    if (search) { clauses.push("(COALESCE(sod.specific_objective_detailname,sod.name,'') LIKE ? OR CONCAT(COALESCE(e.fname,''),' ',COALESCE(e.lname,'')) LIKE ?)"); const s = `%${search}%`; params.push(s, s); }

    const whereStr = clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';

    const sql = `
        SELECT
            r.report_id,
            r.plan_id,
            r.user_id,
            r.status,
            r.created_at AS submitted_at,
            COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS plan_name,
            COALESCE(sod.plan_type, 'general') AS plan_type,
            CONCAT(COALESCE(e.fname,''),' ',COALESCE(e.lname,'')) AS employee_name,
            COALESCE(pos.title, pos.name, 'Staff') AS position_name,
            COALESCE(os.name_amharic, os.name, 'N/A') AS dept_name,
            os.id AS org_node_id,
            MONTH(r.created_at) AS report_month_num,
            YEAR(r.created_at) AS report_year_num,
            WEEK(r.created_at,1) AS report_week,
            CASE WHEN MONTH(r.created_at) IN (1,2,3) THEN 'Q1' WHEN MONTH(r.created_at) IN (4,5,6) THEN 'Q2' WHEN MONTH(r.created_at) IN (7,8,9) THEN 'Q3' ELSE 'Q4' END AS report_quarter,
            CASE
                WHEN sod.specific_objective_detail_id IS NULL THEN 0
                WHEN COALESCE(NULLIF(sod.CIplan,0),(CASE WHEN sod.plan>1 THEN sod.plan ELSE NULL END),0)>0
                    THEN LEAST(100, ROUND(COALESCE(sod.outcome,sod.CIoutcome,0)/NULLIF(COALESCE(NULLIF(sod.CIplan,0),(CASE WHEN sod.plan>1 THEN sod.plan ELSE NULL END)),0)*100,2))
                WHEN COALESCE(sod.execution_percentage,sod.CIexecution_percentage,sod.progress,0)>0
                    THEN COALESCE(sod.execution_percentage,sod.CIexecution_percentage,sod.progress,0)
                WHEN UPPER(COALESCE(sod.status,''))='COMPLETED' THEN 100
                ELSE 0
            END AS execution_pct
        FROM reports r
        LEFT JOIN specific_objective_details sod ON r.plan_id = sod.specific_objective_detail_id
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN (SELECT employee_id, MAX(position_id) as position_id FROM employee_positions WHERE is_primary=1 GROUP BY employee_id) ep ON e.employee_id = ep.employee_id
        LEFT JOIN positions pos ON ep.position_id = pos.position_id
        LEFT JOIN organization_structure os ON sod.department_id = os.id
        ${whereStr} ORDER BY r.created_at DESC LIMIT 2000
    `;

    con.query(sql, params, (err, rows) => {
        if (err) { console.error('[Reports] SQL error:', err.message); return res.status(500).json({ success: false, error: err.message }); }
        const byMonth = {}, byQuarter = {}, byStatus = {};
        rows.forEach(r => {
            const ym = `${r.report_year_num}-${String(r.report_month_num).padStart(2, '0')}`;
            if (!byMonth[ym]) byMonth[ym] = { period: ym, count: 0, approved: 0, declined: 0, pending: 0 };
            byMonth[ym].count++;
            const st = (r.status || 'Pending').toLowerCase();
            if (byMonth[ym][st] !== undefined) byMonth[ym][st]++; else byMonth[ym].pending++;
            const qk = `${r.report_year_num} ${r.report_quarter}`;
            if (!byQuarter[qk]) byQuarter[qk] = { period: qk, count: 0, approved: 0, declined: 0, pending: 0 };
            byQuarter[qk].count++;
            if (byQuarter[qk][st] !== undefined) byQuarter[qk][st]++; else byQuarter[qk].pending++;
            byStatus[st] = (byStatus[st] || 0) + 1;
        });
        res.json({
            success: true,
            reports: rows,
            summary: {
                total: rows.length,
                approved: byStatus['approved'] || 0,
                declined: byStatus['declined'] || 0,
                pending: (byStatus['pending'] || 0) + (byStatus['submitted'] || 0),
                avg_rating: 0,
                monthly_trend: Object.values(byMonth).sort((a, b) => a.period.localeCompare(b.period)),
                quarterly_trend: Object.values(byQuarter).sort((a, b) => a.period.localeCompare(b.period)),
            }
        });
    });
});


// ─── 3. GET /api/report-module/employees ─────────────────────────────────────
router.get('/employees', verifyToken, (req, res) => {
    const { org_node_id, search } = req.query;
    const params = [];
    let whereClauses = ["u.status = '1'"];

    if (org_node_id && org_node_id !== 'all') {
        whereClauses.push("os.id = ?");
        params.push(org_node_id);
    }
    if (search) {
        whereClauses.push("(CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) LIKE ?)");
        params.push(`%${search}%`);
    }
    
    const whereStr = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    const empSql = `
        SELECT 
            u.user_id, 
            CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) AS name,
            e.employee_id,
            COALESCE(pos.title, pos.name, e.position, 'Staff') AS position,
            COALESCE(os.name_amharic, os.name, 'N/A') AS dept,
            COALESCE(e.department_id, ep.org_node_id) AS org_node_id
        FROM users u
        JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN (SELECT employee_id, MAX(position_id) as position_id, MAX(org_node_id) as org_node_id FROM employee_positions WHERE is_primary=1 GROUP BY employee_id) ep ON e.employee_id = ep.employee_id
        LEFT JOIN positions pos ON ep.position_id = pos.position_id
        LEFT JOIN organization_structure os ON COALESCE(e.department_id, ep.org_node_id) = os.id
        ${whereStr}
    `;

    con.query(empSql, params, (err, empRows) => {
        if (err) { console.error('[Employees] SQL error:', err.message); return res.status(500).json({success: false, error: err.message}); }
        
        const empMap = {};
        empRows.forEach(e => {
            empMap[e.user_id] = {
                ...e, 
                tasks: [],
                breakdowns_total: 0, breakdowns_completed: 0, breakdowns_pending: 0,
                reports_total: 0, reports_confirmed: 0, reports_pending: 0, reports_declined: 0
            };
        });

        const mtSql = `
            SELECT mta.user_id, mt.name, mt.weight, mt.actual_amount, mt.progress, mt.status, sod.plan AS target_plan 
            FROM monthly_task_assignees mta
            JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
            LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
        `;
        
        con.query(mtSql, [], (err2, mtRows) => {
            if (!err2 && mtRows) {
                mtRows.forEach(t => {
                    if (empMap[t.user_id]) {
                        empMap[t.user_id].breakdowns_total++;
                        if (t.progress >= 100 || (t.status||'').toLowerCase() === 'completed') empMap[t.user_id].breakdowns_completed++;
                        else empMap[t.user_id].breakdowns_pending++;
                        
                        empMap[t.user_id].tasks.push({
                            name: t.name || 'Untitled Task',
                            weight: t.weight || 0,
                            actual_amount: t.actual_amount || 0,
                            target_plan: t.target_plan || 0,
                            progress: t.progress || 0,
                            status: t.status || 'Pending'
                        });
                    }
                });
            }

            const taSql = `
                SELECT ta.assigned_to AS user_id, ta.title AS name, ta.status
                FROM task_assignments ta
                WHERE ta.category LIKE 'action_plan_breakdown:%'
            `;
            
            con.query(taSql, [], (err3, taRows) => {
                if (!err3 && taRows) {
                    taRows.forEach(t => {
                        if (empMap[t.user_id]) {
                            empMap[t.user_id].breakdowns_total++;
                            const isDone = (t.status||'').toLowerCase() === 'completed';
                            if (isDone) empMap[t.user_id].breakdowns_completed++;
                            else empMap[t.user_id].breakdowns_pending++;
                            
                            empMap[t.user_id].tasks.push({
                                name: t.name || 'Untitled Task',
                                weight: null,
                                actual_amount: null,
                                target_plan: null,
                                progress: isDone ? 100 : 0,
                                status: t.status || 'Pending'
                            });
                        }
                    });
                }

                const repSql = `
                    SELECT r.user_id, r.status
                    FROM reports r
                `;

                con.query(repSql, [], (err4, repRows) => {
                    if (!err4 && repRows) {
                        repRows.forEach(r => {
                            if (empMap[r.user_id]) {
                                empMap[r.user_id].reports_total++;
                                const st = (r.status || '').toLowerCase();
                                if (st === 'approved') empMap[r.user_id].reports_confirmed++;
                                else if (st === 'declined') empMap[r.user_id].reports_declined++;
                                else empMap[r.user_id].reports_pending++;
                            }
                        });
                    }

                    const employees = Object.values(empMap)
                        .filter(u => u.breakdowns_total > 0 || u.reports_total > 0)
                        .sort((a,b) => (b.breakdowns_total + b.reports_total) - (a.breakdowns_total + a.reports_total));
                    
                    res.json({ success: true, employees });
                });
            });
        });
    });
});

// ─── 4. GET /api/report-module/org-structure ─────────────────────────────────
router.get('/org-structure', verifyToken, (req, res) => {
    const params=[];
    let where=buildPeriodWhere(params,req.query);
    const {search}=req.query;
    if(search){const s=`%${search}%`;const ex=`COALESCE(os.name_amharic,os.name,'') LIKE ?`;params.push(s);where=where?where+' AND '+ex:'WHERE '+ex;}
    const sql=PLAN_SQL_BASE+where+' ORDER BY org_node_id';
    con.query(sql,params,(err,rows)=>{
        if(err) return res.status(500).json({success:false,error:err.message});
        const orgMap={};
        rows.forEach(r=>{
            const oid=r.org_node_id||0;
            if(!orgMap[oid]) orgMap[oid]={org_node_id:oid,dept_name:r.dept_name,org_level:r.org_level,org_type:r.org_type,plan_count:0,completed:0,in_progress:0,pending:0,total_weight:0,achieved_weight:0,total_pct:0,report_count:0,task_count:0,emp_set:new Set()};
            orgMap[oid].plan_count++;
            orgMap[oid].total_pct+=Number(r.execution_pct)||0;
            orgMap[oid].total_weight+=Number(r.plan_weight)||0;
            orgMap[oid].achieved_weight+=Number(r.weight_achieved)||0;
            orgMap[oid].report_count+=Number(r.report_count)||0;
            orgMap[oid].task_count+=Number(r.task_count)||0;
            if(r.employee_id) orgMap[oid].emp_set.add(r.employee_id);
            const st=(r.status||'').toLowerCase();
            if(st==='completed'||(Number(r.execution_pct)||0)>=99.9) orgMap[oid].completed++;
            else if((Number(r.execution_pct)||0)>0) orgMap[oid].in_progress++;
            else orgMap[oid].pending++;
        });
        const units=Object.values(orgMap).map(u=>({...u,employee_count:u.emp_set.size,emp_set:undefined,avg_execution_pct:u.plan_count>0?Math.round(u.total_pct/u.plan_count*10)/10:0,achieved_weight:Math.round(u.achieved_weight*1000)/1000})).sort((a,b)=>b.avg_execution_pct-a.avg_execution_pct);
        res.json({success:true,units});
    });
});

// ─── 5. GET /api/report-module/filters ───────────────────────────────────────
router.get('/filters', verifyToken, (req, res) => {
    const userRoleId=Number(req.role_id||req.user?.role_id||req.user?.role||0);
    const currentUserId=req.user_id||req.user?.user_id||req.user?.id;
    const isPrivileged=[1,2,3,9,29].includes(userRoleId);
    const userFilter=(isPrivileged||!currentUserId)?'':`WHERE sod.user_id=${con.escape(currentUserId)} OR sod.created_by=${con.escape(currentUserId)}`;
    const sql=`SELECT DISTINCT COALESCE(g.year,YEAR(sod.created_at)) AS year,g.quarter,p.id AS pillar_id,COALESCE(p.name,'') AS pillar_name,g.goal_id,COALESCE(g.name,'') AS goal_name,o.objective_id,COALESCE(o.name,'') AS objective_name,so.specific_objective_id AS kpi_id,COALESCE(so.specific_objective_name,so.name,'') AS kpi_name,sod.plan_type,os.id AS org_node_id,COALESCE(os.name_amharic,os.name) AS dept_name,u.user_id,CONCAT(COALESCE(e.fname,''),' ',COALESCE(e.lname,'')) AS employee_name FROM specific_objective_details sod LEFT JOIN specific_objectives so ON sod.specific_objective_id=so.specific_objective_id LEFT JOIN objectives o ON so.objective_id=o.objective_id LEFT JOIN goals g ON g.goal_id=COALESCE(sod.goal_id,o.goal_id) LEFT JOIN plan_pillars p ON g.pillar_id=p.id LEFT JOIN users u ON sod.user_id=u.user_id LEFT JOIN employees e ON u.employee_id=e.employee_id LEFT JOIN (SELECT employee_id, MAX(position_id) as position_id FROM employee_positions WHERE is_primary=1 GROUP BY employee_id) ep ON e.employee_id=ep.employee_id LEFT JOIN organization_structure os ON sod.department_id=os.id ${userFilter} ORDER BY year DESC`;
    con.query(sql,[],(err,rows)=>{
        if(err) return res.status(500).json({success:false,error:err.message});
        const years=[...new Set(rows.map(r=>r.year).filter(Boolean))].sort((a,b)=>b-a);
        const quarters=[...new Set(rows.map(r=>r.quarter).filter(Boolean))];
        const pillars=rows.reduce((acc,r)=>{if(r.pillar_id&&!acc.find(x=>x.id===r.pillar_id))acc.push({id:r.pillar_id,name:r.pillar_name});return acc;},[]);
        const goals=rows.reduce((acc,r)=>{if(r.goal_id&&!acc.find(g=>g.id===r.goal_id))acc.push({id:r.goal_id,name:r.goal_name});return acc;},[]);
        const objectives=rows.reduce((acc,r)=>{if(r.objective_id&&!acc.find(o=>o.id===r.objective_id))acc.push({id:r.objective_id,name:r.objective_name});return acc;},[]);
        const kpis=rows.reduce((acc,r)=>{if(r.kpi_id&&!acc.find(k=>k.id===r.kpi_id))acc.push({id:r.kpi_id,name:r.kpi_name});return acc;},[]);
        const planTypes=[...new Set(rows.map(r=>r.plan_type).filter(Boolean))];
        const departments=rows.reduce((acc,r)=>{if(r.org_node_id&&!acc.find(d=>d.id===r.org_node_id))acc.push({id:r.org_node_id,name:r.dept_name});return acc;},[]);
        const employees=rows.reduce((acc,r)=>{if(r.user_id&&!acc.find(u=>u.id===r.user_id))acc.push({id:r.user_id,name:r.employee_name});return acc;},[]);
        res.json({success:true,filters:{years,quarters,pillars,goals,objectives,kpis,planTypes,departments,employees}});
    });
});

// ─── 6. GET /api/report-module/user-progress ─────────────────────────────────
// Per-user: plans assigned, breakdowns, reports submitted, confirmed status
router.get('/user-progress', verifyToken, (req, res) => {
    const params = [];
    let where = buildPeriodWhere(params, req.query);
    const { search, org_node_id } = req.query;
    if (search) {
        const s = `%${search}%`;
        const ex = `CONCAT(COALESCE(e.fname,''),' ',COALESCE(e.lname,'')) LIKE ?`;
        params.push(s);
        where = where ? where + ' AND ' + ex : 'WHERE ' + ex;
    }

    // Per-user aggregation from PLAN_SQL_BASE
    const planSql = PLAN_SQL_BASE + where + ' ORDER BY sod.user_id';
    con.query(planSql, params, (err, planRows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        // Build per-user map from plans
        const userMap = {};
        planRows.forEach(r => {
            const uid = r.user_id || 0;
            if (!userMap[uid]) userMap[uid] = {
                user_id: uid,
                name: r.employee_name || 'Unknown',
                position: r.position_name || '—',
                dept: r.dept_name || '—',
                org_node_id: r.org_node_id,
                plan_count: 0,
                total_pct: 0,
                completed: 0,
                in_progress: 0,
                pending_plans: 0,
                total_weight: 0,
                achieved_weight: 0,
                report_count: 0,
                report_confirmed: 0,
                report_pending: 0,
                breakdown_total: 0,
                breakdown_completed: 0,
            };
            const u = userMap[uid];
            u.plan_count++;
            u.total_pct += Number(r.execution_pct) || 0;
            u.total_weight += Number(r.plan_weight) || 0;
            u.achieved_weight += Number(r.weight_achieved) || 0;
            u.report_count += Number(r.report_count) || 0;
            const pct = Number(r.execution_pct) || 0;
            const st = (r.status || '').toLowerCase();
            if (st === 'completed' || pct >= 99.9) u.completed++;
            else if (pct > 0) u.in_progress++;
            else u.pending_plans++;
        });

        if (Object.keys(userMap).length === 0) {
            return res.json({ success: true, users: [] });
        }

        // Build user IDs
        const userIds = Object.keys(userMap).map(Number).filter(x => x > 0);
        const idPlaceholders = userIds.map(() => '?').join(',');

        // Filter by org_node_id if given
        const orgFilter = (org_node_id && org_node_id !== 'all') ? userMap : userMap;

        // Query reports submitted by these users
        const reportSql = `
            SELECT r.user_id,
                COUNT(*) AS report_count,
                SUM(CASE WHEN LOWER(r.status) IN ('approved','confirmed') THEN 1 ELSE 0 END) AS confirmed,
                SUM(CASE WHEN LOWER(r.status) NOT IN ('approved','confirmed') THEN 1 ELSE 0 END) AS pending_review
            FROM reports r
            WHERE r.user_id IN (${idPlaceholders})
            GROUP BY r.user_id
        `;
        con.query(reportSql, userIds, (rErr, reportRows) => {
            if (!rErr) {
                reportRows.forEach(r => {
                    if (userMap[r.user_id]) {
                        userMap[r.user_id].report_confirmed = Number(r.confirmed) || 0;
                        userMap[r.user_id].report_pending = Number(r.pending_review) || 0;
                        // Override report_count with accurate direct count
                        userMap[r.user_id].report_count = Number(r.report_count) || 0;
                    }
                });
            }

            // Query task_assignments (breakdowns) for these users
            const taskSql = `
                SELECT ta.assigned_to AS user_id,
                    COUNT(*) AS total,
                    SUM(CASE WHEN LOWER(ta.status) IN ('completed','confirmed') THEN 1 ELSE 0 END) AS completed
                FROM task_assignments ta
                WHERE ta.assigned_to IN (${idPlaceholders})
                  AND ta.category LIKE 'action_plan_breakdown:%'
                GROUP BY ta.assigned_to
            `;
            con.query(taskSql, userIds, (tErr, taskRows) => {
                if (!tErr) {
                    taskRows.forEach(t => {
                        if (userMap[t.user_id]) {
                            userMap[t.user_id].breakdown_total = Number(t.total) || 0;
                            userMap[t.user_id].breakdown_completed = Number(t.completed) || 0;
                        }
                    });
                }

                const users = Object.values(userMap)
                    .map(u => ({
                        ...u,
                        avg_execution_pct: u.plan_count > 0 ? Math.round(u.total_pct / u.plan_count * 10) / 10 : 0,
                        breakdown_pct: u.breakdown_total > 0 ? Math.round(u.breakdown_completed / u.breakdown_total * 100) : null,
                        report_confirmed_pct: u.report_count > 0 ? Math.round(u.report_confirmed / u.report_count * 100) : 0,
                        achieved_weight: Math.round(u.achieved_weight * 1000) / 1000,
                    }))
                    .sort((a, b) => b.avg_execution_pct - a.avg_execution_pct);

                res.json({ success: true, users });
            });
        });
    });
});

module.exports = router;
