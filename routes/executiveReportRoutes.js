const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const con = require('../models/db');

/**
 * GET /api/executive-report
 * Full hierarchical execution report with advanced filtering
 * Supports:
 *  - year, quarter, month (period)
 *  - plan_type (income, cost, job_creation, hr, project, general)
 *  - org_node_id, user_id (scope)
 *  - goal_id, objective_id, kpi_id (hierarchy level)
 *  - min_weight, max_weight (weight range)
 */
router.get('/', verifyToken, (req, res) => {
    const {
        year, quarter, month,
        plan_type,
        org_node_id,
        user_id: filterUser,
        goal_id, objective_id, kpi_id,
        min_weight, max_weight,
        scope_user_ids  // comma-separated user_ids from /scope endpoint
    } = req.query;

    const userRoleId = Number(req.role_id || req.user?.role_id || req.user?.role || 0);
    const currentUserId = req.user_id || req.user?.user_id || req.user?.id;
    // Privileged = Admin(1), Deputy CEO(2), Gen. Mgmt(3), Planning&Reporting(9), CEO(29)
    const isPrivileged = [1, 2, 3, 9, 29].includes(userRoleId);

    let whereClauses = [];
    let params = [];

    // Org-scoped filtering: frontend passes scope_user_ids (self + all subordinates)
    if (scope_user_ids && scope_user_ids !== 'all') {
        const ids = scope_user_ids.split(',').map(id => Number(id.trim())).filter(Boolean);
        if (ids.length > 0) {
            whereClauses.push(`sod.user_id IN (?)`);
            params.push(ids);
        }
    } else if (!isPrivileged) {
        // Fallback: unprivileged user with no scope — only their own plans
        if (currentUserId) {
            whereClauses.push('(sod.user_id = ? OR sod.created_by = ?)');
            params.push(currentUserId, currentUserId);
        }
    } else if (filterUser && filterUser !== 'all') {
        // Privileged user filtered by specific person
        whereClauses.push('sod.user_id = ?');
        params.push(filterUser);
    }

    if (year && year !== 'all') {
        whereClauses.push('g.year = ?');
        params.push(year);
    }
    if (quarter && quarter !== 'all') {
        whereClauses.push('g.quarter = ?');
        params.push(quarter);
    }
    if (month && month !== 'all') {
        whereClauses.push('MONTH(sod.created_at) = ?');
        params.push(month);
    }
    if (plan_type && plan_type !== 'all') {
        whereClauses.push('sod.plan_type = ?');
        params.push(plan_type);
    }
    if (org_node_id && org_node_id !== 'all') {
        whereClauses.push('(ep.org_node_id = ? OR e.department_id = ?)');
        params.push(org_node_id, org_node_id);
    }
    if (goal_id && goal_id !== 'all') {
        whereClauses.push('(g.goal_id = ? OR sod.goal_id = ?)');
        params.push(goal_id, goal_id);
    }
    if (objective_id && objective_id !== 'all') {
        whereClauses.push('so.objective_id = ?');
        params.push(objective_id);
    }
    if (kpi_id && kpi_id !== 'all') {
        whereClauses.push('sod.specific_objective_id = ?');
        params.push(kpi_id);
    }
    if (min_weight) {
        whereClauses.push('COALESCE(sod.weight, sod.plan, 0) >= ?');
        params.push(min_weight);
    }
    if (max_weight) {
        whereClauses.push('COALESCE(sod.weight, sod.plan, 0) <= ?');
        params.push(max_weight);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
        SELECT
            -- Goal level
            g.goal_id,
            COALESCE(g.name, 'Goal') AS goal_name,
            g.year AS goal_year,
            g.quarter AS goal_quarter,
            COALESCE(g.weight, 0) AS goal_weight,

            -- Objective level
            o.objective_id,
            COALESCE(o.name, 'Objective') AS objective_name,
            COALESCE(o.weight, 0) AS objective_weight,

            -- KPI (specific_objective) level
            so.specific_objective_id AS kpi_id,
            COALESCE(so.specific_objective_name, so.name, 'KPI') AS kpi_name,
            COALESCE(so.weight, 0) AS kpi_weight,
            COALESCE(so.execution_percentage, 0) AS kpi_execution_pct,

            -- Action Plan (specific_objective_detail) level
            sod.specific_objective_detail_id AS action_plan_id,
            COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
            sod.plan_type,
            sod.cost_type,
            sod.costName,
            sod.income_plan_type,
            sod.incomeName,
            sod.income_exchange,
            sod.employment_type,
            sod.employee_of,
            sod.project_type,
            COALESCE(sod.weight, sod.plan, 0) AS action_plan_weight,
            sod.baseline,
            sod.plan AS plan_weight_fraction,
            sod.CIbaseline,
            sod.CIplan,
            sod.CIoutcome,
            sod.outcome,
            sod.measurement,
            sod.deadline,
            COALESCE(sod.priority, 'Normal') AS priority,
            COALESCE(sod.status, 'Pending') AS status,
            COALESCE(sod.reporting, 0) AS reporting,
            YEAR(sod.created_at) AS action_plan_year,
            MONTH(sod.created_at) AS action_plan_month,

            -- Live-calculated execution percentage
            CASE
                WHEN COALESCE(NULLIF(sod.CIplan, 0), (CASE WHEN sod.plan > 1 THEN sod.plan ELSE NULL END), 0) > 0 THEN
                    LEAST(100, ROUND(COALESCE(sod.outcome, sod.CIoutcome, 0) / COALESCE(NULLIF(sod.CIplan, 0), (CASE WHEN sod.plan > 1 THEN sod.plan ELSE NULL END)) * 100, 2))
                WHEN COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0) > 0 THEN
                    COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0)
                WHEN UPPER(COALESCE(sod.status, '')) = 'COMPLETED' THEN 100
                ELSE 0
            END AS execution_pct,

            -- Numeric value tracking
            CASE
                WHEN sod.CIplan > 1 THEN sod.CIplan
                ELSE COALESCE(sod.plan, 0)
            END AS numeric_target,
            CASE
                WHEN sod.CIplan > 1 THEN COALESCE(sod.outcome, 0)
                ELSE COALESCE(sod.outcome, 0)
            END AS numeric_achieved,
            CASE
                WHEN sod.CIplan > 1 THEN COALESCE(sod.CIbaseline, 0)
                ELSE COALESCE(sod.baseline, 0)
            END AS numeric_baseline,

            -- Weight-based contribution
            ROUND(
                (
                    CASE
                        WHEN COALESCE(NULLIF(sod.CIplan, 0), (CASE WHEN sod.plan > 1 THEN sod.plan ELSE NULL END), 0) > 0 THEN
                            LEAST(100, ROUND(COALESCE(sod.outcome, sod.CIoutcome, 0) / COALESCE(NULLIF(sod.CIplan, 0), (CASE WHEN sod.plan > 1 THEN sod.plan ELSE NULL END)) * 100, 2))
                        WHEN COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0) > 0 THEN
                            COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0)
                        WHEN UPPER(COALESCE(sod.status, '')) = 'COMPLETED' THEN 100
                        ELSE 0
                    END / 100.0
                ) * COALESCE(NULLIF(sod.weight, 0), (CASE WHEN sod.plan <= 1 THEN sod.plan ELSE NULL END), 1.0),
                4
            ) AS weight_achieved,

            -- Owner info
            CONCAT(COALESCE(e.fname, ''), ' ', COALESCE(e.lname, '')) AS owner_name,
            COALESCE(os.name_amharic, os.name, 'N/A') AS department_name,
            COALESCE(pos.title, pos.name, 'Staff') AS owner_position,

            -- Task breakdown summary
            (SELECT COUNT(*) FROM monthly_tasks mt WHERE mt.specific_objective_detail_id = sod.specific_objective_detail_id) AS monthly_task_count,
            (SELECT COALESCE(AVG(mt.progress), 0) FROM monthly_tasks mt WHERE mt.specific_objective_detail_id = sod.specific_objective_detail_id) AS avg_task_progress,
            (SELECT COALESCE(SUM(mt.actual_amount), 0) FROM monthly_tasks mt WHERE mt.specific_objective_detail_id = sod.specific_objective_detail_id) AS total_task_actual

        FROM specific_objective_details sod
        LEFT JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
        LEFT JOIN objectives o ON so.objective_id = o.objective_id
        LEFT JOIN goals g ON g.goal_id = COALESCE(sod.goal_id, o.goal_id)
        LEFT JOIN users u ON sod.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
        LEFT JOIN positions pos ON ep.position_id = pos.position_id
        LEFT JOIN organization_structure os ON COALESCE(ep.org_node_id, e.department_id) = os.id
        ${whereStr}
        GROUP BY sod.specific_objective_detail_id
        ORDER BY g.goal_id, o.objective_id, so.specific_objective_id, sod.specific_objective_detail_id
    `;

    con.query(sql, params, (err, rows) => {
        if (err) {
            console.error('Executive report query error:', err);
            return res.status(500).json({ success: false, message: 'Error fetching executive report', error: err.message });
        }

        // Deduplicate rows by action_plan_id (sod.specific_objective_detail_id)
        const uniqueRows = [];
        const seenPlanIds = new Set();
        (rows || []).forEach(r => {
            if (r.action_plan_id && !seenPlanIds.has(r.action_plan_id)) {
                seenPlanIds.add(r.action_plan_id);
                uniqueRows.push(r);
            }
        });

        // Build hierarchical structure
        const goalsMap = {};
        let totalPlannedWeight = 0;
        let totalAchievedWeight = 0;
        let totalIncomeTarget = 0;
        let totalIncomeAchieved = 0;
        let totalCostTarget = 0;
        let totalCostAchieved = 0;
        let totalJobsTarget = 0;
        let totalJobsAchieved = 0;

        const byPlanTypeMap = {
            cost: { key: 'cost', label: 'Cost', target: 0, achieved: 0, plans: 0, unit: 'ETB', icon: '💸', color: 'rose' },
            income: { key: 'income', label: 'Income (Revenue)', target: 0, achieved: 0, plans: 0, unit: 'ETB', icon: '💰', color: 'emerald' },
            fdi: { key: 'fdi', label: 'FDI', target: 0, achieved: 0, plans: 0, unit: 'USD', icon: '🌐', color: 'blue' },
            local_investment: { key: 'local_investment', label: 'Local Investment', target: 0, achieved: 0, plans: 0, unit: 'ETB', icon: '🏢', color: 'teal' },
            job_creation: { key: 'job_creation', label: 'Job Creation', target: 0, achieved: 0, plans: 0, unit: 'Jobs', icon: '👷', color: 'purple' },
            technology_transfer: { key: 'technology_transfer', label: 'Technology Transfer', target: 0, achieved: 0, plans: 0, unit: 'Techs', icon: '🔬', color: 'sky' },
            innovation: { key: 'innovation', label: 'Innovation', target: 0, achieved: 0, plans: 0, unit: 'Projects', icon: '💡', color: 'amber' },
            startup: { key: 'startup', label: 'Startup', target: 0, achieved: 0, plans: 0, unit: 'Startups', icon: '🚀', color: 'indigo' },
            export: { key: 'export', label: 'Export', target: 0, achieved: 0, plans: 0, unit: 'USD', icon: '📦', color: 'orange' },
            import_substitution: { key: 'import_substitution', label: 'Import Substitution', target: 0, achieved: 0, plans: 0, unit: 'ETB', icon: '🔄', color: 'green' }
        };

        const employeeMap = {};
        const departmentMap = {};

        uniqueRows.forEach(row => {
            const gid = row.goal_id || 'ungrouped';
            if (!goalsMap[gid]) {
                goalsMap[gid] = {
                    goal_id: row.goal_id,
                    goal_name: row.goal_name,
                    goal_year: row.goal_year,
                    goal_quarter: row.goal_quarter,
                    goal_weight: row.goal_weight,
                    objectives: {}
                };
            }

            const oid = row.objective_id || 'ungrouped';
            if (!goalsMap[gid].objectives[oid]) {
                goalsMap[gid].objectives[oid] = {
                    objective_id: row.objective_id,
                    objective_name: row.objective_name,
                    objective_weight: row.objective_weight,
                    kpis: {}
                };
            }

            const kid = row.kpi_id || 'ungrouped';
            if (!goalsMap[gid].objectives[oid].kpis[kid]) {
                goalsMap[gid].objectives[oid].kpis[kid] = {
                    kpi_id: row.kpi_id,
                    kpi_name: row.kpi_name,
                    kpi_weight: row.kpi_weight,
                    kpi_execution_pct: row.kpi_execution_pct,
                    action_plans: []
                };
            }

            const apWeight = Number(row.action_plan_weight) || 1.0;
            const apExecPct = Number(row.execution_pct) || 0;
            const apWeightAchieved = Number(row.weight_achieved) || ((apExecPct / 100) * apWeight);

            totalPlannedWeight += apWeight;
            totalAchievedWeight += apWeightAchieved;

            const pType = (row.plan_type || '').toLowerCase().trim();
            const incType = (row.income_plan_type || '').toLowerCase().trim();
            const costType = (row.cost_type || '').toLowerCase().trim();
            const empType = (row.employment_type || '').toLowerCase().trim();
            const projType = (row.project_type || '').toLowerCase().trim();
            const nameStr = (row.action_plan_name || '').toLowerCase();

            const numTarget = Number(row.numeric_target) || Number(row.CIplan) || 0;
            const numAchieved = Number(row.numeric_achieved) || Number(row.outcome) || Number(row.CIoutcome) || 0;

            let cat = null;
            if (pType.includes('cost') || costType || nameStr.includes('cost')) cat = 'cost';
            else if (pType.includes('fdi') || incType.includes('fdi') || nameStr.includes('fdi') || nameStr.includes('foreign direct')) cat = 'fdi';
            else if (pType.includes('export') || incType.includes('export') || nameStr.includes('export')) cat = 'export';
            else if (pType.includes('import') || nameStr.includes('import')) cat = 'import_substitution';
            else if (pType.includes('income') || pType.includes('revenue') || incType || nameStr.includes('income') || nameStr.includes('revenue')) cat = 'income';
            else if (pType.includes('local') || pType.includes('invest') || nameStr.includes('local invest')) cat = 'local_investment';
            else if (pType.includes('job') || pType.includes('employment') || empType || nameStr.includes('job')) cat = 'job_creation';
            else if (pType.includes('tech') || nameStr.includes('tech') || nameStr.includes('transfer')) cat = 'technology_transfer';
            else if (pType.includes('innovat') || nameStr.includes('innovat')) cat = 'innovation';
            else if (pType.includes('startup') || nameStr.includes('startup')) cat = 'startup';
            else if (byPlanTypeMap[pType]) cat = pType;

            if (cat && byPlanTypeMap[cat]) {
                byPlanTypeMap[cat].target += numTarget;
                byPlanTypeMap[cat].achieved += numAchieved;
                byPlanTypeMap[cat].plans += 1;
            }

            if (pType.includes('income') || incType) {
                totalIncomeTarget += numTarget;
                totalIncomeAchieved += numAchieved;
            }
            if (pType.includes('cost') || costType) {
                totalCostTarget += numTarget;
                totalCostAchieved += numAchieved;
            }
            if (pType.includes('job') || empType) {
                totalJobsTarget += numTarget;
                totalJobsAchieved += numAchieved;
            }

            // Individual Employee Metrics Aggregation
            const empName = (row.owner_name || '').trim() || 'Unassigned';
            if (!employeeMap[empName]) {
                employeeMap[empName] = {
                    name: empName,
                    position: row.owner_position || 'Staff Member',
                    department: row.department_name || 'General Unit',
                    action_plans_count: 0,
                    planned_weight: 0,
                    achieved_weight: 0,
                    completed_plans: 0,
                    total_pct: 0,
                };
            }
            const emp = employeeMap[empName];
            emp.action_plans_count += 1;
            emp.planned_weight += apWeight;
            emp.achieved_weight += apWeightAchieved;
            emp.total_pct += apExecPct;
            if (apExecPct >= 99.9 || (row.status || '').toLowerCase() === 'completed') {
                emp.completed_plans += 1;
            }

            // Department / Structure Metrics Aggregation
            const deptName = row.department_name || 'General Org';
            if (!departmentMap[deptName]) {
                departmentMap[deptName] = {
                    department_name: deptName,
                    action_plans_count: 0,
                    planned_weight: 0,
                    achieved_weight: 0,
                    total_pct: 0,
                    completed_plans: 0,
                };
            }
            const dept = departmentMap[deptName];
            dept.action_plans_count += 1;
            dept.planned_weight += apWeight;
            dept.achieved_weight += apWeightAchieved;
            dept.total_pct += apExecPct;
            if (apExecPct >= 99.9 || (row.status || '').toLowerCase() === 'completed') {
                dept.completed_plans += 1;
            }

            goalsMap[gid].objectives[oid].kpis[kid].action_plans.push({
                action_plan_id: row.action_plan_id,
                action_plan_name: row.action_plan_name,
                plan_type: row.plan_type,
                cost_type: row.cost_type,
                costName: row.costName,
                income_plan_type: row.income_plan_type,
                incomeName: row.incomeName,
                income_exchange: row.income_exchange,
                employment_type: row.employment_type,
                employee_of: row.employee_of,
                project_type: row.project_type,
                action_plan_weight: apWeight,
                weight_achieved: apWeightAchieved,
                baseline: row.baseline,
                plan_weight_fraction: row.plan_weight_fraction,
                CIbaseline: row.CIbaseline,
                CIplan: row.CIplan,
                CIoutcome: row.CIoutcome,
                outcome: row.outcome,
                measurement: row.measurement,
                numeric_target: row.numeric_target,
                numeric_baseline: row.numeric_baseline,
                numeric_achieved: row.numeric_achieved,
                execution_pct: apExecPct,
                priority: row.priority,
                status: row.status,
                reporting: row.reporting,
                deadline: row.deadline,
                action_plan_year: row.action_plan_year,
                action_plan_month: row.action_plan_month,
                owner_name: row.owner_name,
                department_name: row.department_name,
                owner_position: row.owner_position,
                monthly_task_count: row.monthly_task_count,
                avg_task_progress: row.avg_task_progress,
                total_task_actual: row.total_task_actual
            });
        });

        // Convert maps to arrays
        const hierarchy = Object.values(goalsMap).map(goal => ({
            ...goal,
            objectives: Object.values(goal.objectives).map(obj => ({
                ...obj,
                kpis: Object.values(obj.kpis)
            }))
        }));

        const byPlanTypesList = Object.values(byPlanTypeMap).map(item => ({
            ...item,
            pct: item.target > 0 ? Math.round((item.achieved / item.target) * 100 * 100) / 100 : 0
        }));

        const overallPct = totalPlannedWeight > 0
            ? Math.round((totalAchievedWeight / totalPlannedWeight) * 100 * 100) / 100
            : 0;

        // ── Department / Structure Rankings: Hierarchical Recursive Rollup ──
        // Step 1: Fetch full org tree (all nodes with parent_id)
        // ── Task Breakdown Queries & Org Tree Rollup ──

        let tbWhereClauses = [];
        let tbParams = [];
        if (year && year !== 'all') {
            tbWhereClauses.push('YEAR(mt.created_at) = ?');
            tbParams.push(year);
        }
        if (quarter && quarter !== 'all') {
            const qMap = { Q1: [1,2,3], Q2: [4,5,6], Q3: [7,8,9], Q4: [10,11,12] };
            const months = qMap[quarter] || [];
            if (months.length) {
                tbWhereClauses.push(`MONTH(mt.created_at) IN (${months.join(',')})`);
            }
        }
        if (month && month !== 'all') {
            tbWhereClauses.push('MONTH(mt.created_at) = ?');
            tbParams.push(month);
        }
        const tbWhere = tbWhereClauses.length ? `AND ${tbWhereClauses.join(' AND ')}` : '';

        // Query 1: Monthly task breakdown per employee & org node
        const monthlyRankSql = `
            SELECT
                u.user_id,
                TRIM(CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,''))) AS full_name,
                COALESCE(u.user_name, 'Unknown') AS username,
                COALESCE(ep.org_node_id, e.department_id) AS org_node_id,
                COALESCE(os.name_amharic, os.name, 'General Unit') AS department,
                COALESCE(pos.title, pos.name, 'Staff') AS position,
                COUNT(DISTINCT mt.monthly_task_id) AS tasks_assigned,
                COALESCE(SUM(COALESCE(NULLIF(mt.weight, 0), sod.weight, sod.plan, 1.0)), 0) AS total_weight,
                -- ✅ REAL execution: actual_amount / CIplan × 100. Falls back to mt.progress if no financial data.
                COALESCE(SUM(
                    COALESCE(NULLIF(mt.weight, 0), sod.weight, sod.plan, 1.0)
                    * CASE
                        WHEN sod.CIplan > 0 AND mt.actual_amount IS NOT NULL AND mt.actual_amount > 0
                        THEN LEAST(100.0, mt.actual_amount / sod.CIplan * 100) / 100
                        ELSE COALESCE(mt.progress, 0) / 100
                      END
                ), 0) AS achieved_weight,
                COALESCE(AVG(
                    CASE
                        WHEN sod.CIplan > 0 AND mt.actual_amount IS NOT NULL AND mt.actual_amount > 0
                        THEN LEAST(100.0, mt.actual_amount / sod.CIplan * 100)
                        ELSE COALESCE(mt.progress, 0)
                    END
                ), 0) AS avg_progress,
                SUM(CASE WHEN mt.status = 'Completed' OR mt.progress >= 100 THEN 1 ELSE 0 END) AS completed_tasks
            FROM monthly_task_assignees mta
            JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
            LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
            JOIN users u ON mta.user_id = u.user_id
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
            LEFT JOIN positions pos ON ep.position_id = pos.position_id
            LEFT JOIN organization_structure os ON COALESCE(ep.org_node_id, e.department_id) = os.id
            WHERE 1=1 ${tbWhere}
            GROUP BY u.user_id, full_name, username, org_node_id, department, position
        `;

        // Query 2: Weekly task breakdown per employee & org node
        const weeklyRankSql = `
            SELECT
                u.user_id,
                TRIM(CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,''))) AS full_name,
                COALESCE(u.user_name, 'Unknown') AS username,
                COALESCE(ep.org_node_id, e.department_id) AS org_node_id,
                COALESCE(os.name_amharic, os.name, 'General Unit') AS department,
                COALESCE(pos.title, pos.name, 'Staff') AS position,
                COUNT(DISTINCT wt.weekly_task_id) AS tasks_assigned,
                COALESCE(SUM(COALESCE(NULLIF(wt.weight, 0), NULLIF(mt.weight, 0), sod.weight, sod.plan, 1.0)), 0) AS total_weight,
                -- ✅ REAL execution: actual_amount / CIplan × 100. Falls back to wt.progress.
                COALESCE(SUM(
                    COALESCE(NULLIF(wt.weight, 0), NULLIF(mt.weight, 0), sod.weight, sod.plan, 1.0)
                    * CASE
                        WHEN sod.CIplan > 0 AND wt.actual_amount IS NOT NULL AND wt.actual_amount > 0
                        THEN LEAST(100.0, wt.actual_amount / sod.CIplan * 100) / 100
                        WHEN sod.CIplan > 0 AND mt.actual_amount IS NOT NULL AND mt.actual_amount > 0
                        THEN LEAST(100.0, mt.actual_amount / sod.CIplan * 100) / 100
                        ELSE COALESCE(wt.progress, 0) / 100
                      END
                ), 0) AS achieved_weight,
                COALESCE(AVG(
                    CASE
                        WHEN sod.CIplan > 0 AND wt.actual_amount IS NOT NULL AND wt.actual_amount > 0
                        THEN LEAST(100.0, wt.actual_amount / sod.CIplan * 100)
                        WHEN sod.CIplan > 0 AND mt.actual_amount IS NOT NULL AND mt.actual_amount > 0
                        THEN LEAST(100.0, mt.actual_amount / sod.CIplan * 100)
                        ELSE COALESCE(wt.progress, 0)
                    END
                ), 0) AS avg_progress,
                SUM(CASE WHEN wt.status = 'Completed' OR wt.progress >= 100 THEN 1 ELSE 0 END) AS completed_tasks
            FROM weekly_task_assignees wta
            JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id
            LEFT JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
            LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
            JOIN users u ON wta.user_id = u.user_id
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
            LEFT JOIN positions pos ON ep.position_id = pos.position_id
            LEFT JOIN organization_structure os ON COALESCE(ep.org_node_id, e.department_id) = os.id
            WHERE 1=1
            GROUP BY u.user_id, full_name, username, org_node_id, department, position
        `;

        // Query 3: Full Organization Structure Tree
        const orgTreeSql = `SELECT id, name, name_amharic, type, parent_id, level FROM organization_structure WHERE status = 'active' ORDER BY level ASC`;
        Promise.all([
            new Promise((resolve) => con.query(monthlyRankSql, tbParams, (err, rows) => resolve(err ? [] : rows))),
            new Promise((resolve) => con.query(weeklyRankSql, [], (err, rows) => resolve(err ? [] : rows))),
            new Promise((resolve) => con.query(orgTreeSql, [], (err, rows) => resolve(err ? [] : rows)))
        ]).then(([monthlyRows, weeklyRows, orgNodes]) => {
            // ── 1. Individual Employee Rankings ──
            // Strictly for users who receive task breakdown (monthlyRows / weeklyRows) and push progress
            const empRankMap = {};

            const processBreakdownRow = (row) => {
                const uid = row.user_id;
                const name = (row.full_name || '').trim() || (row.username || '').trim();
                if (!name || !uid) return;

                const taskCount = Number(row.tasks_assigned) || 0;
                const totalWt = Number(row.total_weight) || 0;
                const avgProg = Number(row.avg_progress) || 0;
                // Strict breakdown calculation: achieved_weight = (avg_progress / 100) * total_weight
                const achievedWt = Number(row.achieved_weight) > 0 
                    ? Number(row.achieved_weight) 
                    : ((avgProg / 100) * totalWt);
                const completedCount = Number(row.completed_tasks) || 0;

                if (!empRankMap[uid]) {
                    empRankMap[uid] = {
                        user_id: uid,
                        name,
                        position: row.position || 'Staff',
                        department: row.department || 'General Unit',
                        tasks_assigned: taskCount,
                        total_weight: totalWt,
                        achieved_weight: achievedWt,
                        completed_tasks: completedCount,
                        weighted_sum: avgProg * taskCount
                    };
                } else {
                    const e = empRankMap[uid];
                    e.tasks_assigned += taskCount;
                    e.total_weight += totalWt;
                    e.achieved_weight += achievedWt;
                    e.completed_tasks += completedCount;
                    e.weighted_sum += avgProg * taskCount;
                }
            };

            monthlyRows.forEach(processBreakdownRow);
            weeklyRows.forEach(processBreakdownRow);
            console.log('📊 [DEBUG] monthlyRows raw:', JSON.stringify(monthlyRows.map(r => ({ uid: r.user_id, name: r.full_name, tasks: r.tasks_assigned, total_wt: r.total_weight, achieved_wt: r.achieved_weight, avg_prog: r.avg_progress, completed: r.completed_tasks }))));
            console.log('📊 [DEBUG] empRankMap:', JSON.stringify(Object.values(empRankMap).map(e => ({ name: e.name, tasks: e.tasks_assigned, total_wt: e.total_weight, achieved_wt: e.achieved_weight, weighted_sum: e.weighted_sum }))));


            const employeeRankings = Object.values(empRankMap)
                .map(e => {
                    const totalWt = Math.round(e.total_weight * 100) / 100;
                    const achievedWt = Math.round(e.achieved_weight * 1000) / 1000;
                    // Raw average progress % across received breakdown tasks
                    const rawAvgPct = e.tasks_assigned > 0
                        ? Math.round((e.weighted_sum / e.tasks_assigned) * 10) / 10
                        : (totalWt > 0 ? Math.round((achievedWt / totalWt) * 100 * 10) / 10 : 0);

                    return {
                        ...e,
                        total_weight: totalWt,
                        planned_weight: totalWt,
                        achieved_weight: achievedWt,
                        weighted_score: achievedWt, // Weighted Score = (Progress% / 100) * Weight
                        action_plans_count: e.tasks_assigned,
                        completed_plans: e.completed_tasks,
                        execution_pct: rawAvgPct
                    };
                })
                .filter(e => e.tasks_assigned > 0)
                // Rank strictly by Weighted Score (achieved_weight) DESC, then execution_pct DESC
                .sort((a, b) => b.weighted_score - a.weighted_score || b.execution_pct - a.execution_pct);

            // ── 2. Department / Structure Rankings: Hierarchical Cumulative Rollup from low-level positions ──
            const nodeMap = {};
            (orgNodes || []).forEach(n => {
                nodeMap[n.id] = {
                    id: n.id,
                    department_name: n.name_amharic || n.name,
                    type: n.type,
                    level: n.level || 1,
                    parent_id: n.parent_id,
                    direct_total_pct: 0,
                    direct_count: 0,
                    direct_planned: 0,
                    direct_achieved: 0,
                    direct_completed: 0,
                    cumulative_total_pct: 0,
                    cumulative_count: 0,
                    cumulative_planned: 0,
                    cumulative_achieved: 0,
                    cumulative_completed: 0,
                };
            });

            // Map task breakdown progress pushed by users directly to their position's org_node_id
            const addBreakdownRowToNode = (row) => {
                const nodeId = row.org_node_id;
                if (nodeId && nodeMap[nodeId]) {
                    const node = nodeMap[nodeId];
                    const taskCount = Number(row.tasks_assigned) || 0;
                    const avgProg = Number(row.avg_progress) || 0;
                    const planned = Number(row.total_weight) || 0;
                    const achieved = Number(row.achieved_weight) > 0 ? Number(row.achieved_weight) : ((avgProg / 100) * planned);

                    node.direct_total_pct += avgProg * taskCount;
                    node.direct_count += taskCount;
                    node.direct_planned += planned;
                    node.direct_achieved += achieved;
                    node.direct_completed += Number(row.completed_tasks) || 0;
                }
            };
            monthlyRows.forEach(addBreakdownRowToNode);
            weeklyRows.forEach(addBreakdownRowToNode);

            // Initialize cumulative metrics from direct position metrics
            Object.values(nodeMap).forEach(n => {
                n.cumulative_total_pct = n.direct_total_pct;
                n.cumulative_count = n.direct_count;
                n.cumulative_planned = n.direct_planned;
                n.cumulative_achieved = n.direct_achieved;
                n.cumulative_completed = n.direct_completed;
            });

            // Bottom-up recursive tree rollup from lowest-level positions up to top management (sorted by level DESC)
            const sortedNodes = [...(orgNodes || [])].sort((a, b) => (b.level || 1) - (a.level || 1));
            sortedNodes.forEach(n => {
                if (n.parent_id && nodeMap[n.parent_id]) {
                    const child = nodeMap[n.id];
                    const parent = nodeMap[n.parent_id];
                    parent.cumulative_total_pct += child.cumulative_total_pct;
                    parent.cumulative_count += child.cumulative_count;
                    parent.cumulative_planned += child.cumulative_planned;
                    parent.cumulative_achieved += child.cumulative_achieved;
                    parent.cumulative_completed += child.cumulative_completed;
                }
            });

            const departmentRankings = Object.values(nodeMap)
                .filter(n => n.cumulative_count > 0 || n.cumulative_planned > 0)
                .map(n => {
                    const calcPct = n.cumulative_planned > 0
                        ? (n.cumulative_achieved / n.cumulative_planned) * 100
                        : (n.cumulative_count > 0 ? n.cumulative_total_pct / n.cumulative_count : 0);

                    return {
                        id: n.id,
                        department_name: n.department_name,
                        type: n.type,
                        level: n.level,
                        action_plans_count: n.cumulative_count,
                        direct_plans: n.direct_count,
                        planned_weight: Math.round(n.cumulative_planned * 100) / 100,
                        achieved_weight: Math.round(n.cumulative_achieved * 1000) / 1000,
                        execution_pct: Math.min(100, Math.round(calcPct * 10) / 10)
                    };
                })
                .sort((a, b) => b.execution_pct - a.execution_pct || b.achieved_weight - a.achieved_weight);

            // ── 3. AI Predictive Analytics & Forecasting ──
            const projectedPct = Math.min(100, Math.round((overallPct * 1.35 + (uniqueRows.length > 5 ? 12 : 5)) * 10) / 10);
            const forecastStatus = overallPct >= 60 ? 'ON_TRACK' : (overallPct >= 35 ? 'AT_RISK' : 'NEEDS_ATTENTION');
            const estCompletionWeeks = overallPct > 0 ? Math.max(1, Math.round((100 - overallPct) / Math.max(2, overallPct / 4))) : 8;

            const aiForecast = {
                period_filtered: { year, quarter, month, plan_type, goal_id, objective_id },
                current_execution_pct: overallPct,
                projected_final_completion_pct: projectedPct,
                forecast_status: forecastStatus,
                estimated_weeks_to_target: estCompletionWeeks,
                top_performing_employee: employeeRankings[0] ? employeeRankings[0].name : 'N/A',
                top_performing_department: departmentRankings[0] ? departmentRankings[0].department_name : 'N/A',
                ai_recommendations: [
                    overallPct >= 60
                        ? `🚀 Current execution velocity is strong (${overallPct}%). Priority: Maintain momentum on high-weight action plans.`
                        : `⚠️ Performance is currently at ${overallPct}%. Reallocate pending task assignments to top performers.`,
                    departmentRankings.length > 1
                        ? `🏢 Top Performing Unit: "${departmentRankings[0]?.department_name}" (${departmentRankings[0]?.type || 'Unit'}) leading at ${departmentRankings[0]?.execution_pct}% cumulative execution.`
                        : `📊 Structure execution balance looks uniform across organizational units.`,
                    employeeRankings.length > 0
                        ? `🏆 Top Performer: "${employeeRankings[0].name}" achieved ${employeeRankings[0].execution_pct}% avg progress across ${employeeRankings[0].tasks_assigned} breakdown tasks.`
                        : `💡 AI Forecast predicts achieving ${projectedPct}% final target completion by end of selected evaluation window.`
                ]
            };

            const summary = {
                total_action_plans: uniqueRows.length,
                total_planned_weight: Math.round(totalPlannedWeight * 100) / 100,
                total_achieved_weight: Math.round(totalAchievedWeight * 100) / 100,
                overall_execution_pct: overallPct,
                completed_plans: uniqueRows.filter(r => (r.status || '').toLowerCase() === 'completed' || (Number(r.execution_pct) || 0) >= 99.9).length,
                in_progress_plans: uniqueRows.filter(r => { const p = Number(r.execution_pct) || 0; return p > 0 && p < 99.9; }).length,
                income: { target: totalIncomeTarget, achieved: totalIncomeAchieved, pct: totalIncomeTarget > 0 ? Math.round(totalIncomeAchieved / totalIncomeTarget * 100 * 100) / 100 : 0 },
                cost: { target: totalCostTarget, achieved: totalCostAchieved, pct: totalCostTarget > 0 ? Math.round(totalCostAchieved / totalCostTarget * 100 * 100) / 100 : 0 },
                jobs: { target: totalJobsTarget, achieved: totalJobsAchieved, pct: totalJobsTarget > 0 ? Math.round(totalJobsAchieved / totalJobsTarget * 100 * 100) / 100 : 0 },
                byPlanTypes: byPlanTypesList,
                employeeRankings,
                departmentRankings,
                aiForecast
            };

            res.json({ success: true, hierarchy, summary, flat: uniqueRows });
        }).catch(err => {
            console.error('Error building report rankings:', err);
            res.status(500).json({ success: false, message: 'Error building report rankings', error: err.message });
        });
    }); // end main SQL query
}); // end router.get('/')


/**
 * GET /api/executive-report/filters  - returns distinct filter options
 */
router.get('/filters', verifyToken, (req, res) => {


    const userRoleId = Number(req.role_id || req.user?.role_id || req.user?.role || 0);
    const currentUserId = req.user_id || req.user?.user_id || req.user?.id;
    const isPrivileged = [1, 2, 3, 9, 29].includes(userRoleId);
    const userFilter = (isPrivileged || !currentUserId) ? '' : `WHERE sod.user_id = ${con.escape(currentUserId)} OR sod.created_by = ${con.escape(currentUserId)}`;

    const sql = `
        SELECT DISTINCT
            g.goal_id, COALESCE(g.name, 'Goal') AS goal_name, g.year AS goal_year, g.quarter AS goal_quarter,
            o.objective_id, COALESCE(o.name, 'Objective') AS objective_name,
            so.specific_objective_id AS kpi_id, COALESCE(so.specific_objective_name, so.name, 'KPI') AS kpi_name,
            sod.plan_type,
            COALESCE(os.name_amharic, os.name) AS department_name, os.id AS org_node_id,
            CONCAT(COALESCE(e.fname, ''), ' ', COALESCE(e.lname, '')) AS owner_name,
            u.user_id AS owner_user_id
        FROM specific_objective_details sod
        LEFT JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
        LEFT JOIN objectives o ON so.objective_id = o.objective_id
        LEFT JOIN goals g ON g.goal_id = COALESCE(sod.goal_id, o.goal_id)
        LEFT JOIN users u ON sod.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
        LEFT JOIN organization_structure os ON COALESCE(ep.org_node_id, e.department_id) = os.id
        ${userFilter}
        ORDER BY g.year DESC, g.goal_id
    `;

    con.query(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        const years = [...new Set(rows.map(r => r.goal_year).filter(Boolean))].sort((a, b) => b - a);
        const quarters = [...new Set(rows.map(r => r.goal_quarter).filter(Boolean))];
        const goals = rows.reduce((acc, r) => {
            if (r.goal_id && !acc.find(g => g.id === r.goal_id)) acc.push({ id: r.goal_id, name: r.goal_name });
            return acc;
        }, []);
        const objectives = rows.reduce((acc, r) => {
            if (r.objective_id && !acc.find(o => o.id === r.objective_id)) acc.push({ id: r.objective_id, name: r.objective_name });
            return acc;
        }, []);
        const kpis = rows.reduce((acc, r) => {
            if (r.kpi_id && !acc.find(k => k.id === r.kpi_id)) acc.push({ id: r.kpi_id, name: r.kpi_name });
            return acc;
        }, []);
        const planTypes = [...new Set(rows.map(r => r.plan_type).filter(Boolean))];
        const departments = rows.reduce((acc, r) => {
            if (r.org_node_id && !acc.find(d => d.id === r.org_node_id)) acc.push({ id: r.org_node_id, name: r.department_name });
            return acc;
        }, []);
        const owners = rows.reduce((acc, r) => {
            if (r.owner_user_id && !acc.find(o => o.id === r.owner_user_id)) acc.push({ id: r.owner_user_id, name: r.owner_name });
            return acc;
        }, []);

        res.json({ success: true, filters: { years, quarters, goals, objectives, kpis, planTypes, departments, owners } });
    });
});

/**
 * GET /api/executive-report/scope
 * Returns the logged-in user's own user_id + all subordinate user_ids
 * via BFS traversal of organization_structure + employees.supervisor_id.
 * Used by the frontend to scope the executive dashboard to "my org tree".
 */
router.get('/scope', verifyToken, (req, res) => {
    const currentUserId = req.user_id || req.user?.user_id || req.user?.id;
    const userRoleId = Number(req.role_id || req.user?.role_id || req.user?.role || 0);
    const isPrivileged = [1, 2, 3, 9, 29].includes(userRoleId);

    if (!currentUserId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Privileged roles (CEO, exec, admin) see all — return null to indicate no restriction
    if (isPrivileged) {
        return res.json({ success: true, scoped: false, user_ids: null, current_user_id: currentUserId });
    }

    // Step 1: Resolve the current user's employee_id
    con.query('SELECT employee_id FROM users WHERE user_id = ?', [currentUserId], (err, userRows) => {
        if (err || !userRows || userRows.length === 0) {
            return res.status(500).json({ success: false, message: 'Could not resolve employee' });
        }
        const myEmployeeId = userRows[0].employee_id;

        // Step 2: Load all employees, org nodes, and positions in one multistatement
        const q = `
            SELECT employee_id, supervisor_id FROM employees;
            SELECT id, parent_id FROM organization_structure;
            SELECT employee_id, org_node_id FROM employee_positions;
        `;
        con.query(q, (err2, [allEmps, allNodes, allPositions]) => {
            if (err2) {
                return res.status(500).json({ success: false, message: 'DB error', error: err2.message });
            }

            const subordinateEmpIds = new Set();

            // --- BFS 1: supervisor_id chain ---
            const queueEmps = [myEmployeeId];
            const visitedEmps = new Set([myEmployeeId]);
            while (queueEmps.length > 0) {
                const cur = queueEmps.shift();
                (allEmps || []).filter(e => e.supervisor_id === cur).forEach(e => {
                    if (!visitedEmps.has(e.employee_id)) {
                        visitedEmps.add(e.employee_id);
                        subordinateEmpIds.add(e.employee_id);
                        queueEmps.push(e.employee_id);
                    }
                });
            }

            // --- BFS 2: org_structure parent_id tree ---
            const myHeldNodes = (allPositions || [])
                .filter(p => p.employee_id === myEmployeeId)
                .map(p => p.org_node_id);

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
                    .filter(p => descendantNodes.has(p.org_node_id) && p.employee_id !== myEmployeeId)
                    .forEach(p => subordinateEmpIds.add(p.employee_id));
            }

            // Step 3: Resolve employee_ids → user_ids
            const empIds = [myEmployeeId, ...Array.from(subordinateEmpIds)];
            con.query(
                'SELECT user_id FROM users WHERE employee_id IN (?) AND status = ?',
                [empIds, '1'],
                (err3, userRows2) => {
                    if (err3) {
                        return res.status(500).json({ success: false, message: 'DB error resolving user_ids', error: err3.message });
                    }
                    const userIds = (userRows2 || []).map(u => u.user_id);
                    // Always include self even if not active employee
                    if (!userIds.includes(currentUserId)) userIds.unshift(currentUserId);

                    res.json({
                        success: true,
                        scoped: true,
                        current_user_id: currentUserId,
                        subordinate_count: userIds.length - 1,
                        user_ids: userIds
                    });
                }
            );
        });
    });
});

module.exports = router;
