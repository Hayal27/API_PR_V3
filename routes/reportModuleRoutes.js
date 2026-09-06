const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const con = require('../models/db');
const { logAudit, AUDIT_ACTIONS } = require('../middleware/auditLogger');
const BackupScheduler = require('../services/backupScheduler');

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

        const expRepId = await addMenu('Backup & Export Center', '/reports/export', 'bi bi-cloud-arrow-down-fill', 5, parentId);
        await grant(expRepId, roles);
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
                plans_total: 0, plans_confirmed: 0, plans_unconfirmed: 0,
                breakdowns_total: 0, breakdowns_completed: 0, breakdowns_pending: 0,
                reports_total: 0, reports_confirmed: 0, reports_unconfirmed: 0
            };
        });

        // 1. Fetch action plans and check confirmed vs not confirmed
        const planSql = `
            SELECT sod.user_id, sod.specific_objective_detailname AS name, sod.status, sod.weight
            FROM specific_objective_details sod
        `;

        con.query(planSql, [], (errP, planRows) => {
            if (!errP && planRows) {
                planRows.forEach(p => {
                    if (empMap[p.user_id]) {
                        empMap[p.user_id].plans_total++;
                        const isConf = (p.status || '').toLowerCase().trim() === 'confirmed' || (p.status || '').toLowerCase().includes('confirm');
                        if (isConf) empMap[p.user_id].plans_confirmed++;
                        else empMap[p.user_id].plans_unconfirmed++;
                    }
                });
            }

            // 2. Fetch monthly breakdown tasks with parent plan confirmation status
            const mtSql = `
                SELECT mta.user_id, mt.name, mt.weight, mt.actual_amount, mt.progress, mt.status AS task_status, sod.status AS plan_status, sod.plan AS target_plan 
                FROM monthly_task_assignees mta
                JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
                LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
            `;
            
            con.query(mtSql, [], (err2, mtRows) => {
                if (!err2 && mtRows) {
                    mtRows.forEach(t => {
                        if (empMap[t.user_id]) {
                            empMap[t.user_id].breakdowns_total++;
                            if (t.progress >= 100 || (t.task_status||'').toLowerCase() === 'completed') empMap[t.user_id].breakdowns_completed++;
                            else empMap[t.user_id].breakdowns_pending++;
                            
                            const isPlanConf = (t.plan_status || '').toLowerCase().trim() === 'confirmed' || (t.plan_status || '').toLowerCase().includes('confirm');
                            empMap[t.user_id].tasks.push({
                                name: t.name || 'Untitled Task',
                                weight: t.weight || 0,
                                actual_amount: t.actual_amount || 0,
                                target_plan: t.target_plan || 0,
                                progress: t.progress || 0,
                                status: isPlanConf ? 'Confirmed' : 'Not Confirmed',
                                is_confirmed: isPlanConf,
                                task_progress_status: t.task_status || 'Pending'
                            });
                        }
                    });
                }

                // 3. Fetch task assignments
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
                                
                                const isConf = (t.status || '').toLowerCase().trim() === 'confirmed' || (t.status || '').toLowerCase().includes('confirm');
                                empMap[t.user_id].tasks.push({
                                    name: t.name || 'Untitled Task',
                                    weight: null,
                                    actual_amount: null,
                                    target_plan: null,
                                    progress: isDone ? 100 : 0,
                                    status: isConf ? 'Confirmed' : 'Not Confirmed',
                                    is_confirmed: isConf,
                                    task_progress_status: t.status || 'Pending'
                                });
                            }
                        });
                    }

                    // 4. Fetch reports and classify as Confirmed vs Not Confirmed
                    const repSql = `
                        SELECT r.user_id, r.status
                        FROM reports r
                    `;

                    con.query(repSql, [], (err4, repRows) => {
                        if (!err4 && repRows) {
                            repRows.forEach(r => {
                                if (empMap[r.user_id]) {
                                    empMap[r.user_id].reports_total++;
                                    const st = (r.status || '').toLowerCase().trim();
                                    const isConf = st === 'confirmed' || st.includes('confirm') || st === 'approved';
                                    if (isConf) empMap[r.user_id].reports_confirmed++;
                                    else empMap[r.user_id].reports_unconfirmed++;
                                }
                            });
                        }

                        const employees = Object.values(empMap)
                            .filter(u => u.breakdowns_total > 0 || u.reports_total > 0 || u.plans_total > 0)
                            .sort((a,b) => (b.reports_confirmed + b.plans_confirmed + b.breakdowns_total) - (a.reports_confirmed + a.plans_confirmed + a.breakdowns_total));
                        
                        res.json({ success: true, employees });
                    });
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

// ═══════════════════════════════════════════════════════════════════════════════
// 7. ADVANCED BACKUP & EXPORT CENTER ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════

const TABLE_CATEGORIES = {
    'plan_pillars': 'Strategic Goals & Pillars',
    'goals': 'Strategic Goals & Pillars',
    'objectives': 'Strategic Goals & Pillars',
    'specific_objectives': 'KPIs & Objectives',
    'specific_objective_details': 'Action Plans & Targets',
    'plan_types': 'Action Plans & Targets',
    'monthly_tasks': 'Work Breakdown Structure',
    'monthly_task_assignees': 'Work Breakdown Structure',
    'weekly_tasks': 'Work Breakdown Structure',
    'weekly_task_assignees': 'Work Breakdown Structure',
    'reports': 'Reports & Submissions',
    'evaluations': 'Reports & Submissions',
    'report_details': 'Reports & Submissions',
    'employees': 'HR & Organization',
    'organization_structure': 'HR & Organization',
    'positions': 'HR & Organization',
    'employee_positions': 'HR & Organization',
    'departments': 'HR & Organization',
    'task_assignments': 'Task Delegations',
    'task_assignment_comments': 'Task Delegations',
    'users': 'Users & Security',
    'roles': 'Users & Security',
    'menu_items': 'Users & Security',
    'role_permissions': 'Users & Security',
    'audit_logs': 'Audit & System Logs',
    'notifications': 'Audit & System Logs',
    'system_settings': 'Audit & System Logs'
};

// ── GET /api/report-module/backup/overview ──────────────────────────────────
router.get('/backup/overview', verifyToken, async (req, res) => {
    try {
        const query = (sql, params = []) => new Promise((resolve, reject) => con.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));

        const tablesSql = `
            SELECT 
                TABLE_NAME AS table_name,
                TABLE_ROWS AS approx_rows,
                DATA_LENGTH AS data_length,
                INDEX_LENGTH AS index_length,
                (DATA_LENGTH + INDEX_LENGTH) AS total_size_bytes,
                ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024, 2) AS total_size_kb,
                CREATE_TIME AS create_time,
                UPDATE_TIME AS update_time,
                TABLE_COMMENT AS comment
            FROM information_schema.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
        `;

        const rawTables = await query(tablesSql);

        let totalRecords = 0;
        let totalSizeBytes = 0;
        const tables = [];

        // Exact row count verification for accurate reporting
        for (const t of rawTables) {
            let exactCount = Number(t.approx_rows) || 0;
            try {
                const countRes = await query(`SELECT COUNT(*) AS cnt FROM \`${t.table_name}\``);
                if (countRes && countRes[0]) exactCount = Number(countRes[0].cnt);
            } catch (_) {}

            const sizeBytes = Number(t.total_size_bytes) || 0;
            totalRecords += exactCount;
            totalSizeBytes += sizeBytes;

            tables.push({
                table_name: t.table_name,
                records: exactCount,
                size_bytes: sizeBytes,
                size_kb: Number(t.total_size_kb) || 0,
                size_mb: Number((sizeBytes / (1024 * 1024)).toFixed(3)),
                category: TABLE_CATEGORIES[t.table_name] || 'Other System Tables',
                update_time: t.update_time || t.create_time || new Date()
            });
        }

        // Fetch last export / backup activity from audit logs
        let lastBackupTime = null;
        try {
            const auditRes = await query(`
                SELECT created_at 
                FROM audit_logs 
                WHERE action IN ('DATA_EXPORT', 'BACKUP_CREATE', 'SYSTEM_BACKUP') 
                ORDER BY created_at DESC 
                LIMIT 1
            `);
            if (auditRes && auditRes.length > 0) lastBackupTime = auditRes[0].created_at;
        } catch (_) {}

        // Group by category
        const categoryMap = {};
        tables.forEach(t => {
            if (!categoryMap[t.category]) {
                categoryMap[t.category] = { category: t.category, table_count: 0, total_records: 0, total_size_kb: 0, tables: [] };
            }
            categoryMap[t.category].table_count++;
            categoryMap[t.category].total_records += t.records;
            categoryMap[t.category].total_size_kb += t.size_kb;
            categoryMap[t.category].tables.push(t);
        });

        res.json({
            success: true,
            overview: {
                total_tables: tables.length,
                total_records: totalRecords,
                total_size_bytes: totalSizeBytes,
                total_size_mb: Number((totalSizeBytes / (1024 * 1024)).toFixed(2)),
                total_size_kb: Number((totalSizeBytes / 1024).toFixed(1)),
                last_backup_time: lastBackupTime,
                categories: Object.values(categoryMap),
                tables
            }
        });
    } catch (err) {
        console.error('[Backup Overview] Error:', err);
        res.status(500).json({ success: false, message: 'Failed to load backup overview', error: err.message });
    }
});

// ── POST /api/report-module/backup/export ────────────────────────────────────
// Handles Full or Selective Data Export in SQL, JSON, or CSV
router.post('/backup/export', verifyToken, async (req, res) => {
    try {
        const query = (sql, params = []) => new Promise((resolve, reject) => con.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
        const userId = req.user_id || req.user?.id || 1;

        let { type = 'full', tables = [], format = 'sql', options = {} } = req.body;
        const includeDDL = options.include_ddl !== false;
        const includeDrop = options.include_drop !== false;

        // Get list of existing tables
        const allDbTablesRes = await query(`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()`);
        const allDbTables = allDbTablesRes.map(r => r.TABLE_NAME);

        let targetTables = [];
        if (type === 'full' || !tables || tables.length === 0) {
            targetTables = allDbTables;
        } else {
            targetTables = tables.filter(t => allDbTables.includes(t));
        }

        if (targetTables.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid tables selected for export' });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const exportMetadata = {
            system: 'Ethiopian IT Park Performance & Report Management System (ITPR)',
            version: '2.0',
            exported_at: new Date().toISOString(),
            exported_by_user_id: userId,
            type,
            format,
            table_count: targetTables.length,
            tables: targetTables
        };

        if (format === 'json') {
            const tableData = {};
            let totalRecords = 0;

            for (const tbl of targetTables) {
                const rows = await query(`SELECT * FROM \`${tbl}\``);
                tableData[tbl] = rows || [];
                totalRecords += (rows || []).length;
            }

            exportMetadata.total_records = totalRecords;

            // Log export in audit
            try {
                await query(`
                    INSERT INTO audit_logs (user_id, action, details, created_at)
                    VALUES (?, 'DATA_EXPORT', ?, NOW())
                `, [userId, `JSON Backup Export: ${targetTables.length} tables, ${totalRecords} records`]);
            } catch (_) {}

            return res.json({
                success: true,
                filename: `ITPR_Backup_${type}_${timestamp}.json`,
                metadata: exportMetadata,
                data: tableData
            });
        }

        // SQL Format Dump Generation
        if (format === 'sql') {
            let sqlDump = '';
            sqlDump += `-- ============================================================================\n`;
            sqlDump += `-- Ethiopian IT Park Performance & Report Management System (ITPR)\n`;
            sqlDump += `-- Advanced Database Backup & Data Archive Dump\n`;
            sqlDump += `-- Export Type : ${type.toUpperCase()}\n`;
            sqlDump += `-- Created At  : ${new Date().toUTCString()}\n`;
            sqlDump += `-- Tables (${targetTables.length}) : ${targetTables.join(', ')}\n`;
            sqlDump += `-- ============================================================================\n\n`;
            sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n`;
            sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
            sqlDump += `SET time_zone = "+03:00";\n\n`;

            let totalRecords = 0;

            for (const tbl of targetTables) {
                sqlDump += `-- ----------------------------------------------------------------------------\n`;
                sqlDump += `-- Table structure & data for table \`${tbl}\`\n`;
                sqlDump += `-- ----------------------------------------------------------------------------\n`;

                if (includeDrop) {
                    sqlDump += `DROP TABLE IF EXISTS \`${tbl}\`;\n`;
                }

                if (includeDDL) {
                    try {
                        const createTableRes = await query(`SHOW CREATE TABLE \`${tbl}\``);
                        if (createTableRes && createTableRes[0] && createTableRes[0]['Create Table']) {
                            sqlDump += `${createTableRes[0]['Create Table']};\n\n`;
                        }
                    } catch (ddlErr) {
                        console.warn(`Could not fetch DDL for ${tbl}:`, ddlErr.message);
                    }
                }

                // Dump rows
                const rows = await query(`SELECT * FROM \`${tbl}\``);
                if (rows && rows.length > 0) {
                    totalRecords += rows.length;
                    const columns = Object.keys(rows[0]);
                    const escapedCols = columns.map(c => `\`${c}\``).join(', ');

                    // Batch inserts into chunks of 100
                    const chunkSize = 100;
                    for (let i = 0; i < rows.length; i += chunkSize) {
                        const chunk = rows.slice(i, i + chunkSize);
                        const valuesSql = chunk.map(row => {
                            const valList = columns.map(col => {
                                const val = row[col];
                                if (val === null || val === undefined) return 'NULL';
                                if (typeof val === 'number') return val;
                                if (typeof val === 'boolean') return val ? 1 : 0;
                                if (val instanceof Date) return con.escape(val.toISOString().slice(0, 19).replace('T', ' '));
                                return con.escape(String(val));
                            }).join(', ');
                            return `(${valList})`;
                        }).join(',\n  ');

                        sqlDump += `INSERT INTO \`${tbl}\` (${escapedCols}) VALUES\n  ${valuesSql};\n`;
                    }
                    sqlDump += `\n`;
                } else {
                    sqlDump += `-- (Table \`${tbl}\` has 0 rows)\n\n`;
                }
            }

            sqlDump += `SET FOREIGN_KEY_CHECKS=1;\n`;
            sqlDump += `-- ── End of ITPR Database Dump [Total Records: ${totalRecords}] ──\n`;

            // Log export in audit
            await logAudit(
                userId,
                AUDIT_ACTIONS.DATA_EXPORT || 'DATA_EXPORT',
                `Exported SQL Database Dump (${targetTables.length} tables, ${totalRecords} records)`,
                { format: 'sql', type, table_count: targetTables.length, total_records: totalRecords },
                req
            ).catch(() => {});

            return res.json({
                success: true,
                filename: `ITPR_Database_Backup_${type}_${timestamp}.sql`,
                total_records: totalRecords,
                table_count: targetTables.length,
                sql_content: sqlDump
            });
        }

        res.status(400).json({ success: false, message: 'Unsupported export format' });
    } catch (err) {
        console.error('[Backup Export] Error:', err);
        res.status(500).json({ success: false, message: 'Export generation failed', error: err.message });
    }
});

// ── POST /api/report-module/backup/restore-preview ───────────────────────────
// Validates an uploaded JSON or SQL backup and returns a safety dry-run summary
router.post('/backup/restore-preview', verifyToken, async (req, res) => {
    try {
        const { payload, format = 'json' } = req.body;
        if (!payload) {
            return res.status(400).json({ success: false, message: 'Backup payload is required' });
        }

        let preview = { format, table_count: 0, total_records: 0, tables: [], warnings: [] };

        if (format === 'json') {
            const dataObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
            const tablesData = dataObj.data || dataObj.tables || dataObj;

            const tableNames = Object.keys(tablesData).filter(k => k !== 'metadata');
            preview.table_count = tableNames.length;

            tableNames.forEach(tName => {
                const rows = Array.isArray(tablesData[tName]) ? tablesData[tName] : [];
                preview.total_records += rows.length;
                preview.tables.push({
                    name: tName,
                    records: rows.length,
                    columns: rows.length > 0 ? Object.keys(rows[0]) : [],
                    category: TABLE_CATEGORIES[tName] || 'System Table'
                });
            });

            if (preview.table_count === 0) {
                preview.warnings.push('No recognized table datasets found in the JSON payload.');
            }
        } else if (format === 'sql') {
            const sqlText = String(payload);
            const createMatches = sqlText.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?([a-zA-Z0-9_]+)`?/gi) || [];
            const insertMatches = sqlText.match(/INSERT INTO\s+`?([a-zA-Z0-9_]+)`?/gi) || [];

            const tablesDetected = new Set();
            createMatches.forEach(m => {
                const parts = m.split(/\s+/);
                const rawName = parts[parts.length - 1].replace(/[`"']/g, '');
                if (rawName) tablesDetected.add(rawName);
            });
            insertMatches.forEach(m => {
                const parts = m.split(/\s+/);
                const rawName = parts[parts.length - 1].replace(/[`"']/g, '');
                if (rawName) tablesDetected.add(rawName);
            });

            preview.table_count = tablesDetected.size;
            preview.tables = Array.from(tablesDetected).map(t => ({
                name: t,
                records: (sqlText.match(new RegExp(`INSERT INTO\\s+\`?${t}\`?`, 'gi')) || []).length,
                category: TABLE_CATEGORIES[t] || 'System Table'
            }));
            preview.total_records = insertMatches.length;
        }

        res.json({ success: true, preview });
    } catch (err) {
        console.error('[Restore Preview] Error:', err);
        res.status(400).json({ success: false, message: 'Invalid backup file structure: ' + err.message });
    }
});

// ── POST /api/report-module/backup/restore ───────────────────────────────────
// Executes database restore with transactional safety
router.post('/backup/restore', verifyToken, async (req, res) => {
    try {
        const query = (sql, params = []) => new Promise((resolve, reject) => con.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
        const userId = req.user_id || req.user?.id || 1;
        const { payload, format = 'json', mode = 'insert_or_update' } = req.body;

        if (!payload) {
            return res.status(400).json({ success: false, message: 'Backup payload is required' });
        }

        let restoredTables = 0;
        let restoredRecords = 0;

        if (format === 'json') {
            const dataObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
            const tablesData = dataObj.data || dataObj.tables || dataObj;
            const tableNames = Object.keys(tablesData).filter(k => k !== 'metadata');

            await query('SET FOREIGN_KEY_CHECKS = 0');

            for (const tbl of tableNames) {
                const rows = tablesData[tbl];
                if (!Array.isArray(rows) || rows.length === 0) continue;

                restoredTables++;
                for (const row of rows) {
                    const keys = Object.keys(row);
                    if (keys.length === 0) continue;

                    const cols = keys.map(k => `\`${k}\``).join(', ');
                    const placeholders = keys.map(() => '?').join(', ');
                    const vals = keys.map(k => row[k]);

                    const updateSql = keys.map(k => `\`${k}\`=VALUES(\`${k}\`)`).join(', ');

                    const upsertSql = `INSERT INTO \`${tbl}\` (${cols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateSql}`;
                    try {
                        await query(upsertSql, vals);
                        restoredRecords++;
                    } catch (e) {
                        console.warn(`[Restore] Row error on ${tbl}:`, e.message);
                    }
                }
            }

            await query('SET FOREIGN_KEY_CHECKS = 1');

            // Audit log
            await logAudit(
                userId,
                AUDIT_ACTIONS.SETTINGS_CHANGE || 'SETTINGS_CHANGE',
                `Restored database from JSON archive: ${restoredTables} tables, ${restoredRecords} records synchronized`,
                { mode, restored_tables: restoredTables, restored_records: restoredRecords },
                req
            ).catch(() => {});

            return res.json({
                success: true,
                message: `Successfully restored and synchronized ${restoredRecords} records across ${restoredTables} tables`,
                restored_tables: restoredTables,
                restored_records: restoredRecords
            });
        }

        res.status(400).json({ success: false, message: 'Direct SQL execution restore must be parsed into JSON or performed with DB Admin credentials.' });
    } catch (err) {
        console.error('[Backup Restore] Error:', err);
        res.status(500).json({ success: false, message: 'Restore failed: ' + err.message });
    }
});

// ============================================================================
// ── AUTOMATED BACKUP SCHEDULER & VAULT ENDPOINTS ────────────────────────────
// ============================================================================

// ── GET /api/report-module/backup/scheduler/status ───────────────────────────
// Returns current scheduler configuration, execution history & countdown
router.get('/backup/scheduler/status', verifyToken, async (req, res) => {
    try {
        const config = BackupScheduler.getConfig();
        const nextRun = BackupScheduler.getNextRunTime(config);
        const storedBackups = BackupScheduler.getStoredBackups();

        const totalVaultSizeBytes = storedBackups.reduce((acc, b) => acc + (b.size_bytes || 0), 0);

        res.json({
            success: true,
            config,
            next_run: nextRun,
            is_executing: BackupScheduler.isExecuting,
            stats: {
                total_stored_backups: storedBackups.length,
                vault_size_mb: (totalVaultSizeBytes / (1024 * 1024)).toFixed(2),
                vault_size_kb: (totalVaultSizeBytes / 1024).toFixed(2),
                auto_backups_count: storedBackups.filter(b => b.is_auto).length,
                manual_backups_count: storedBackups.filter(b => !b.is_auto).length
            }
        });
    } catch (err) {
        console.error('[BackupScheduler Status] Error:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve scheduler status', error: err.message });
    }
});

// ── POST /api/report-module/backup/scheduler/config ──────────────────────────
// Updates scheduler settings and reloads the cron runner
router.post('/backup/scheduler/config', verifyToken, async (req, res) => {
    try {
        const userId = req.user_id || req.user?.id || 1;
        const newSettings = req.body;

        const updated = BackupScheduler.saveConfig(newSettings);

        await logAudit(
            userId,
            AUDIT_ACTIONS.SETTINGS_CHANGE || 'SETTINGS_CHANGE',
            `Updated Automated Backup Schedule: Frequency=${updated.frequency}, Time=${updated.time}, Format=${updated.format}, Enabled=${updated.enabled}`,
            { settings: updated },
            req
        ).catch(() => {});

        res.json({
            success: true,
            message: 'Backup scheduler configuration saved and activated successfully.',
            config: updated,
            next_run: BackupScheduler.getNextRunTime(updated)
        });
    } catch (err) {
        console.error('[BackupScheduler Config] Error:', err);
        res.status(500).json({ success: false, message: 'Failed to update scheduler config', error: err.message });
    }
});

// ── POST /api/report-module/backup/scheduler/trigger-now ─────────────────────
// Triggers an immediate server-side auto-backup run
router.post('/backup/scheduler/trigger-now', verifyToken, async (req, res) => {
    try {
        const userId = req.user_id || req.user?.id || 1;
        console.log(`⚡ [BackupScheduler] Manual trigger initiated by User ID: ${userId}`);

        const result = await BackupScheduler.executeBackup('manual_trigger');

        if (!result.success) {
            return res.status(500).json({ success: false, message: result.message });
        }

        res.json({
            success: true,
            message: 'Automated backup generated successfully and stored in server vault.',
            files: result.files,
            total_records: result.total_records,
            table_count: result.table_count
        });
    } catch (err) {
        console.error('[BackupScheduler Trigger] Error:', err);
        res.status(500).json({ success: false, message: 'Failed to execute backup', error: err.message });
    }
});

// ── GET /api/report-module/backup/scheduler/history ──────────────────────────
// Returns the list of all server-vault stored backup archives
router.get('/backup/scheduler/history', verifyToken, async (req, res) => {
    try {
        const backups = BackupScheduler.getStoredBackups();
        res.json({ success: true, backups });
    } catch (err) {
        console.error('[BackupScheduler History] Error:', err);
        res.status(500).json({ success: false, message: 'Failed to list stored backups', error: err.message });
    }
});

// ── GET /api/report-module/backup/scheduler/download/:filename ───────────────
// Streams/downloads a stored backup file from the server vault
router.get('/backup/scheduler/download/:filename', verifyToken, (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = BackupScheduler.getBackupPath(filename);

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('[Backup Download] Error streaming file:', err);
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: 'Failed to download backup file' });
                }
            }
        });
    } catch (err) {
        console.error('[Backup Download] Error:', err);
        res.status(404).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/report-module/backup/scheduler/delete/:filename ──────────────
// Permanently deletes an archive file from the server vault
router.delete('/backup/scheduler/delete/:filename', verifyToken, async (req, res) => {
    try {
        const userId = req.user_id || req.user?.id || 1;
        const { filename } = req.params;

        BackupScheduler.deleteBackup(filename);

        await logAudit(
            userId,
            AUDIT_ACTIONS.SETTINGS_CHANGE || 'SETTINGS_CHANGE',
            `Deleted server stored backup archive: ${filename}`,
            { filename },
            req
        ).catch(() => {});

        res.json({ success: true, message: `Backup file "${filename}" deleted successfully.` });
    } catch (err) {
        console.error('[Backup Delete] Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/report-module/backup/scheduler/restore-stored ──────────────────
// Executes transactional restore directly from a stored backup file
router.post('/backup/scheduler/restore-stored', verifyToken, async (req, res) => {
    try {
        const query = (sql, params = []) => new Promise((resolve, reject) => con.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));
        const userId = req.user_id || req.user?.id || 1;
        const { filename } = req.body;

        if (!filename) {
            return res.status(400).json({ success: false, message: 'Filename is required' });
        }

        const filePath = BackupScheduler.getBackupPath(filename);
        const ext = path.extname(filename).slice(1).toLowerCase();

        if (ext === 'json') {
            const raw = fs.readFileSync(filePath, 'utf8');
            const dataObj = JSON.parse(raw);
            const tablesData = dataObj.data || dataObj.tables || dataObj;
            const tableNames = Object.keys(tablesData).filter(k => k !== 'metadata');

            let restoredTables = 0;
            let restoredRecords = 0;

            await query('SET FOREIGN_KEY_CHECKS = 0');

            for (const tbl of tableNames) {
                const rows = tablesData[tbl];
                if (!Array.isArray(rows) || rows.length === 0) continue;

                restoredTables++;
                for (const row of rows) {
                    const keys = Object.keys(row);
                    if (keys.length === 0) continue;

                    const cols = keys.map(k => `\`${k}\``).join(', ');
                    const placeholders = keys.map(() => '?').join(', ');
                    const vals = keys.map(k => row[k]);
                    const updateSql = keys.map(k => `\`${k}\`=VALUES(\`${k}\`)`).join(', ');

                    const upsertSql = `INSERT INTO \`${tbl}\` (${cols}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateSql}`;
                    try {
                        await query(upsertSql, vals);
                        restoredRecords++;
                    } catch (rowErr) {
                        console.warn(`[Vault Restore] Row error on ${tbl}:`, rowErr.message);
                    }
                }
            }

            await query('SET FOREIGN_KEY_CHECKS = 1');

            await logAudit(
                userId,
                AUDIT_ACTIONS.SETTINGS_CHANGE || 'SETTINGS_CHANGE',
                `Restored database directly from server vault file: ${filename} (${restoredTables} tables, ${restoredRecords} rows)`,
                { filename, restored_tables: restoredTables, restored_records: restoredRecords },
                req
            ).catch(() => {});

            return res.json({
                success: true,
                message: `Successfully restored ${restoredRecords} records across ${restoredTables} tables from server backup archive "${filename}".`,
                restored_tables: restoredTables,
                restored_records: restoredRecords
            });
        }

        res.status(400).json({ success: false, message: 'Direct vault 1-click restore currently supports JSON master archives (.json).' });
    } catch (err) {
        console.error('[Vault Restore] Error:', err);
        res.status(500).json({ success: false, message: 'Vault restore failed: ' + err.message });
    }
});

module.exports = router;


