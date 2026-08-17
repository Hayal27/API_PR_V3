const con = require('../models/db');

// Ensure tables and columns exist on load
const initGoalConfigDb = () => {
  const alterQueries = [
    `ALTER TABLE goals ADD COLUMN start_year INT NULL`,
    `ALTER TABLE goals ADD COLUMN end_year INT NULL`,
    `ALTER TABLE goals ADD COLUMN is_active TINYINT(1) DEFAULT 1`,
    `ALTER TABLE goals ADD COLUMN weight DECIMAL(5,2) DEFAULT 0.00`,
    `ALTER TABLE goals ADD COLUMN pillar_id INT NULL`
  ];

  alterQueries.forEach(q => {
    con.query(q, () => {});
  });

  const createTables = [
    `CREATE TABLE IF NOT EXISTS goal_quarter_activations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      goal_id INT NOT NULL,
      year INT NOT NULL,
      quarter VARCHAR(10) NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_goal_year_quarter (goal_id, year, quarter)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS objective_quarter_activations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      objective_id INT NOT NULL,
      year INT NOT NULL,
      quarter VARCHAR(10) NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_obj_year_quarter (objective_id, year, quarter)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS kpi_quarter_activations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      specific_objective_id INT NOT NULL,
      year INT NOT NULL,
      quarter VARCHAR(10) NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_kpi_year_quarter (specific_objective_id, year, quarter)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

    `CREATE TABLE IF NOT EXISTS action_plan_quarter_activations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      specific_objective_detail_id INT NOT NULL,
      year INT NOT NULL,
      quarter VARCHAR(10) NOT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_ap_year_quarter (specific_objective_detail_id, year, quarter)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  ];

  createTables.forEach(sql => {
    con.query(sql, (err) => {
      if (err) console.error("Error creating quarter activation table:", err.message);
    });
  });
};

initGoalConfigDb();

// Utility helper for SQL query as promise
const queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// 1. Get all Goal Configurations (with quarter activations & past baseline weights)
exports.getGoalConfigurations = async (req, res) => {
  try {
    // A. Fetch Goals with Pillar info
    const goalsSql = `
      SELECT 
        g.goal_id,
        g.name AS goal_name,
        g.description,
        g.year,
        g.quarter,
        g.start_year,
        g.end_year,
        g.is_active,
        COALESCE(g.weight, 0) AS weight,
        g.pillar_id,
        p.name AS pillar_name,
        p.code AS pillar_code
      FROM goals g
      LEFT JOIN plan_pillars p ON p.id = g.pillar_id
      ORDER BY g.goal_id DESC
    `;
    const goals = await queryAsync(goalsSql);

    // B. Fetch all Quarter Activations
    const activationsSql = `SELECT goal_id, year, quarter, is_active FROM goal_quarter_activations`;
    const activations = await queryAsync(activationsSql);

    // Organize activations map: activationsMap[goal_id][year][quarter] = is_active
    const activationsMap = {};
    activations.forEach(row => {
      if (!activationsMap[row.goal_id]) activationsMap[row.goal_id] = {};
      if (!activationsMap[row.goal_id][row.year]) activationsMap[row.goal_id][row.year] = {};
      activationsMap[row.goal_id][row.year][row.quarter] = Boolean(row.is_active);
    });

    // C. Calculate Past Achieved Baseline Weight for each Goal
    // Baseline = sum of completed/pushed action plan progress under this goal
    const baselineSql = `
      SELECT 
        g.goal_id,
        ROUND(AVG(COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0)), 2) AS avg_achievement_pct,
        ROUND(SUM(COALESCE(sod.weight, sod.plan, 0) * (COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0) / 100)), 2) AS total_achieved_weight
      FROM goals g
      JOIN objectives o ON o.goal_id = g.goal_id
      JOIN specific_objectives so ON so.objective_id = o.objective_id
      JOIN specific_objective_details sod ON sod.specific_objective_id = so.specific_objective_id
      GROUP BY g.goal_id
    `;
    const baselines = await queryAsync(baselineSql);

    const baselineMap = {};
    baselines.forEach(b => {
      baselineMap[b.goal_id] = {
        avg_achievement_pct: parseFloat(b.avg_achievement_pct) || 0,
        total_achieved_weight: parseFloat(b.total_achieved_weight) || 0
      };
    });

    // D. Fetch Objectives and their activations
    const objsSql = `SELECT objective_id, goal_id, name, description, weight FROM objectives`;
    const objs = await queryAsync(objsSql);
    const objActsSql = `SELECT objective_id, year, quarter, is_active FROM objective_quarter_activations`;
    const objActs = await queryAsync(objActsSql);
    const objActsMap = {};
    objActs.forEach(r => {
      if (!objActsMap[r.objective_id]) objActsMap[r.objective_id] = {};
      if (!objActsMap[r.objective_id][r.year]) objActsMap[r.objective_id][r.year] = {};
      objActsMap[r.objective_id][r.year][r.quarter] = Boolean(r.is_active);
    });

    // E. Fetch KPIs and their activations
    const kpisSql = `SELECT specific_objective_id, objective_id, COALESCE(name, specific_objective_name) AS name, weight FROM specific_objectives`;
    const kpis = await queryAsync(kpisSql);
    const kpiActsSql = `SELECT specific_objective_id, year, quarter, is_active FROM kpi_quarter_activations`;
    const kpiActs = await queryAsync(kpiActsSql);
    const kpiActsMap = {};
    kpiActs.forEach(r => {
      if (!kpiActsMap[r.specific_objective_id]) kpiActsMap[r.specific_objective_id] = {};
      if (!kpiActsMap[r.specific_objective_id][r.year]) kpiActsMap[r.specific_objective_id][r.year] = {};
      kpiActsMap[r.specific_objective_id][r.year][r.quarter] = Boolean(r.is_active);
    });

    // F. Fetch Action Plans and their activations
    const apSql = `SELECT specific_objective_detail_id, specific_objective_id, COALESCE(specific_objective_detailname, name) AS activity_name, weight FROM specific_objective_details`;
    const actionPlans = await queryAsync(apSql);
    const apActsSql = `SELECT specific_objective_detail_id, year, quarter, is_active FROM action_plan_quarter_activations`;
    const apActs = await queryAsync(apActsSql);
    const apActsMap = {};
    apActs.forEach(r => {
      if (!apActsMap[r.specific_objective_detail_id]) apActsMap[r.specific_objective_detail_id] = {};
      if (!apActsMap[r.specific_objective_detail_id][r.year]) apActsMap[r.specific_objective_detail_id][r.year] = {};
      apActsMap[r.specific_objective_detail_id][r.year][r.quarter] = Boolean(r.is_active);
    });

    // Map Action Plans to KPIs
    const kpisWithAP = kpis.map(k => ({
      ...k,
      quarter_activations: kpiActsMap[k.specific_objective_id] || {},
      action_plans: actionPlans
        .filter(ap => ap.specific_objective_id === k.specific_objective_id)
        .map(ap => ({
          ...ap,
          quarter_activations: apActsMap[ap.specific_objective_detail_id] || {}
        }))
    }));

    // Map KPIs to Objectives
    const objsWithKPIs = objs.map(o => ({
      ...o,
      quarter_activations: objActsMap[o.objective_id] || {},
      kpis: kpisWithAP.filter(k => k.objective_id === o.objective_id)
    }));

    // Combine into Goals
    const formattedGoals = goals.map(g => {
      const gId = g.goal_id;
      const bInfo = baselineMap[gId] || { avg_achievement_pct: 0, total_achieved_weight: 0 };
      
      const startYr = g.start_year || g.year || 2018;
      const endYr = g.end_year || (startYr + 5);

      return {
        ...g,
        start_year: startYr,
        end_year: endYr,
        weight: parseFloat(g.weight) || 0,
        is_active: Boolean(g.is_active),
        past_baseline: {
          avg_achievement_pct: bInfo.avg_achievement_pct,
          achieved_weight_baseline: bInfo.total_achieved_weight
        },
        quarter_activations: activationsMap[gId] || {},
        objectives: objsWithKPIs.filter(o => o.goal_id === gId)
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedGoals
    });
  } catch (error) {
    console.error("Error fetching goal configurations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch goal configurations",
      error: error.message
    });
  }
};

// 2. Update Goal Metadata & Duration (start_year, end_year, weight, pillar_id, is_active)
exports.updateGoalConfig = async (req, res) => {
  const { goalId } = req.params;
  const { start_year, end_year, weight, pillar_id, is_active } = req.body;

  try {
    const sql = `
      UPDATE goals
      SET 
        start_year = ?,
        end_year = ?,
        weight = ?,
        pillar_id = ?,
        is_active = ?
      WHERE goal_id = ?
    `;

    const values = [
      start_year ? parseInt(start_year, 10) : null,
      end_year ? parseInt(end_year, 10) : null,
      weight !== undefined ? parseFloat(weight) : 0,
      pillar_id ? parseInt(pillar_id, 10) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      goalId
    ];

    await queryAsync(sql, values);

    return res.status(200).json({
      success: true,
      message: "Goal configuration updated successfully"
    });
  } catch (error) {
    console.error("Error updating goal config:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update goal configuration",
      error: error.message
    });
  }
};

// 3. Toggle Quarter Activation (Year & Quarter)
exports.toggleQuarterActivation = async (req, res) => {
  const { goalId } = req.params;
  const { year, quarter, is_active } = req.body;

  if (!year || !quarter) {
    return res.status(400).json({
      success: false,
      message: "year and quarter are required"
    });
  }

  try {
    const activeVal = is_active ? 1 : 0;
    const sql = `
      INSERT INTO goal_quarter_activations (goal_id, year, quarter, is_active)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)
    `;

    await queryAsync(sql, [goalId, parseInt(year, 10), String(quarter), activeVal]);

    return res.status(200).json({
      success: true,
      message: `Goal ${goalId} Quarter ${quarter} for year ${year} updated to ${activeVal ? 'Active' : 'Inactive'}`
    });
  } catch (error) {
    console.error("Error toggling quarter activation:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle quarter activation",
      error: error.message
    });
  }
};

// 4. Get Active Goals for Specific Year and Quarter
exports.getActiveGoalsForCurrentPeriod = async (req, res) => {
  const { year, quarter } = req.query;

  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
  const targetQuarter = quarter ? String(quarter) : '1';

  try {
    const sql = `
      SELECT 
        g.goal_id,
        g.name AS goal_name,
        g.description,
        g.start_year,
        g.end_year,
        COALESCE(g.weight, 0) AS weight,
        g.pillar_id,
        p.name AS pillar_name,
        p.code AS pillar_code,
        COALESCE(gqa.is_active, 1) AS period_active
      FROM goals g
      LEFT JOIN plan_pillars p ON p.id = g.pillar_id
      LEFT JOIN goal_quarter_activations gqa 
        ON gqa.goal_id = g.goal_id 
       AND gqa.year = ? 
       AND gqa.quarter = ?
      WHERE g.is_active = 1
        AND (g.start_year IS NULL OR g.start_year <= ?)
        AND (g.end_year IS NULL OR g.end_year >= ?)
        AND (gqa.is_active IS NULL OR gqa.is_active = 1)
      ORDER BY p.sort_order ASC, g.goal_id DESC
    `;

    const goals = await queryAsync(sql, [targetYear, targetQuarter, targetYear, targetYear]);

    return res.status(200).json({
      success: true,
      period: { year: targetYear, quarter: targetQuarter },
      data: goals
    });
  } catch (error) {
    console.error("Error fetching active goals for period:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch active goals for period",
      error: error.message
    });
  }
};

// ─── Cascading Activation & Extension Validation Helpers ────────────────────

// 1. Goal Activation Check
const isGoalActiveForPeriodAsync = async (goalId, year, quarter) => {
  const goals = await queryAsync(
    `SELECT goal_id, start_year, end_year, COALESCE(is_active, 1) AS is_active FROM goals WHERE goal_id = ?`,
    [goalId]
  );
  if (!goals || goals.length === 0) return { active: false, reason: `Goal #${goalId} does not exist.` };
  const g = goals[0];
  if (!g.is_active) return { active: false, reason: `Goal #${goalId} is marked as inactive.` };

  const startYr = g.start_year || g.year;
  const endYr = g.end_year || (startYr ? startYr + 5 : 9999);
  if (year < startYr || year > endYr) {
    return { active: false, reason: `Goal #${goalId} duration (${startYr}–${endYr}) does not cover year ${year}.` };
  }

  const qActs = await queryAsync(
    `SELECT is_active FROM goal_quarter_activations WHERE goal_id = ? AND year = ? AND quarter = ?`,
    [goalId, year, String(quarter)]
  );
  if (qActs && qActs.length > 0 && qActs[0].is_active === 0) {
    return { active: false, reason: `Goal #${goalId} is disabled for Year ${year} Q${quarter} in Goal Configuration.` };
  }

  return { active: true, goal_id: goalId };
};

// 2. Objective Activation Check (Validates Parent Goal)
const isObjectiveActiveForPeriodAsync = async (objectiveId, year, quarter) => {
  const objs = await queryAsync(
    `SELECT objective_id, goal_id FROM objectives WHERE objective_id = ?`,
    [objectiveId]
  );
  if (!objs || objs.length === 0) return { active: false, reason: `Objective #${objectiveId} does not exist.` };
  const obj = objs[0];

  const goalCheck = await isGoalActiveForPeriodAsync(obj.goal_id, year, quarter);
  if (!goalCheck.active) {
    return {
      active: false,
      reason: `Parent Goal #${obj.goal_id} is not configured/active for Year ${year} Q${quarter}. (${goalCheck.reason})`
    };
  }

  const qActs = await queryAsync(
    `SELECT is_active FROM objective_quarter_activations WHERE objective_id = ? AND year = ? AND quarter = ?`,
    [objectiveId, year, String(quarter)]
  );
  if (qActs && qActs.length > 0 && qActs[0].is_active === 0) {
    return { active: false, reason: `Objective #${objectiveId} is disabled for Year ${year} Q${quarter}.` };
  }

  return { active: true, objective_id: objectiveId, goal_id: obj.goal_id };
};

// 3. KPI Activation Check (Validates Parent Objective & Goal)
const isKpiActiveForPeriodAsync = async (specificObjectiveId, year, quarter) => {
  const kpis = await queryAsync(
    `SELECT specific_objective_id, objective_id FROM specific_objectives WHERE specific_objective_id = ?`,
    [specificObjectiveId]
  );
  if (!kpis || kpis.length === 0) return { active: false, reason: `KPI #${specificObjectiveId} does not exist.` };
  const kpi = kpis[0];

  const objCheck = await isObjectiveActiveForPeriodAsync(kpi.objective_id, year, quarter);
  if (!objCheck.active) {
    return {
      active: false,
      reason: `Parent Objective #${kpi.objective_id} is not configured/active for Year ${year} Q${quarter}. (${objCheck.reason})`
    };
  }

  const qActs = await queryAsync(
    `SELECT is_active FROM kpi_quarter_activations WHERE specific_objective_id = ? AND year = ? AND quarter = ?`,
    [specificObjectiveId, year, String(quarter)]
  );
  if (qActs && qActs.length > 0 && qActs[0].is_active === 0) {
    return { active: false, reason: `KPI #${specificObjectiveId} is disabled for Year ${year} Q${quarter}.` };
  }

  return { active: true, specific_objective_id: specificObjectiveId, objective_id: kpi.objective_id, goal_id: objCheck.goal_id };
};

exports.isGoalActiveForPeriodAsync = isGoalActiveForPeriodAsync;
exports.isObjectiveActiveForPeriodAsync = isObjectiveActiveForPeriodAsync;
exports.isKpiActiveForPeriodAsync = isKpiActiveForPeriodAsync;

// 5. Toggle / Extend Objective Quarter Activation
exports.toggleObjectiveActivation = async (req, res) => {
  const { objectiveId } = req.params;
  const { year, quarter, is_active } = req.body;
  const yr = parseInt(year, 10);
  const q = String(quarter);
  const activeVal = is_active ? 1 : 0;

  try {
    if (activeVal === 1) {
      const objs = await queryAsync(`SELECT goal_id FROM objectives WHERE objective_id = ?`, [objectiveId]);
      if (!objs || objs.length === 0) return res.status(404).json({ success: false, message: "Objective not found" });
      const goalCheck = await isGoalActiveForPeriodAsync(objs[0].goal_id, yr, q);
      if (!goalCheck.active) {
        return res.status(400).json({
          success: false,
          message: `Cannot extend/activate Objective for Year ${yr} Q${q}: Parent Goal #${objs[0].goal_id} must first be configured and active for this period.`,
          detail: goalCheck.reason
        });
      }
    }

    await queryAsync(
      `INSERT INTO objective_quarter_activations (objective_id, year, quarter, is_active)
       VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)`,
      [objectiveId, yr, q, activeVal]
    );

    return res.status(200).json({
      success: true,
      message: `Objective #${objectiveId} activation for ${yr} Q${q} updated to ${activeVal ? 'Active' : 'Inactive'}`
    });
  } catch (error) {
    console.error("Error toggling objective activation:", error);
    return res.status(500).json({ success: false, message: "Failed to update objective activation", error: error.message });
  }
};

// 6. Toggle / Extend KPI Quarter Activation
exports.toggleKpiActivation = async (req, res) => {
  const { specificObjectiveId } = req.params;
  const { year, quarter, is_active } = req.body;
  const yr = parseInt(year, 10);
  const q = String(quarter);
  const activeVal = is_active ? 1 : 0;

  try {
    if (activeVal === 1) {
      const kpis = await queryAsync(`SELECT objective_id FROM specific_objectives WHERE specific_objective_id = ?`, [specificObjectiveId]);
      if (!kpis || kpis.length === 0) return res.status(404).json({ success: false, message: "KPI not found" });
      const objCheck = await isObjectiveActiveForPeriodAsync(kpis[0].objective_id, yr, q);
      if (!objCheck.active) {
        return res.status(400).json({
          success: false,
          message: `Cannot extend/activate KPI for Year ${yr} Q${q}: Parent Objective #${kpis[0].objective_id} must first be configured and active for this period.`,
          detail: objCheck.reason
        });
      }
    }

    await queryAsync(
      `INSERT INTO kpi_quarter_activations (specific_objective_id, year, quarter, is_active)
       VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)`,
      [specificObjectiveId, yr, q, activeVal]
    );

    return res.status(200).json({
      success: true,
      message: `KPI #${specificObjectiveId} activation for ${yr} Q${q} updated to ${activeVal ? 'Active' : 'Inactive'}`
    });
  } catch (error) {
    console.error("Error toggling KPI activation:", error);
    return res.status(500).json({ success: false, message: "Failed to update KPI activation", error: error.message });
  }
};

// 7. Toggle / Extend Action Plan Quarter Activation
exports.toggleActionPlanActivation = async (req, res) => {
  const { detailId } = req.params;
  const { year, quarter, is_active } = req.body;
  const yr = parseInt(year, 10);
  const q = String(quarter);
  const activeVal = is_active ? 1 : 0;

  try {
    if (activeVal === 1) {
      const details = await queryAsync(`SELECT specific_objective_id FROM specific_objective_details WHERE specific_objective_detail_id = ?`, [detailId]);
      if (!details || details.length === 0) return res.status(404).json({ success: false, message: "Action Plan not found" });
      const kpiCheck = await isKpiActiveForPeriodAsync(details[0].specific_objective_id, yr, q);
      if (!kpiCheck.active) {
        return res.status(400).json({
          success: false,
          message: `Cannot extend/activate Action Plan for Year ${yr} Q${q}: Parent KPI #${details[0].specific_objective_id} must first be configured and active for this period.`,
          detail: kpiCheck.reason
        });
      }
    }

    await queryAsync(
      `INSERT INTO action_plan_quarter_activations (specific_objective_detail_id, year, quarter, is_active)
       VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)`,
      [detailId, yr, q, activeVal]
    );

    return res.status(200).json({
      success: true,
      message: `Action Plan #${detailId} activation for ${yr} Q${q} updated to ${activeVal ? 'Active' : 'Inactive'}`
    });
  } catch (error) {
    console.error("Error toggling Action Plan activation:", error);
    return res.status(500).json({ success: false, message: "Failed to update Action Plan activation", error: error.message });
  }
};
