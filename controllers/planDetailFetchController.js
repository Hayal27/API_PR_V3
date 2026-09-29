const con = require("../models/db");

// ─── getGoals ────────────────────────────────────────────────────────────────
// Fetch all goals (optionally filtered by year / quarter).
// Note: verifyToken middleware already authenticated the request and set req.user_id.
const getGoals = (req, res) => {
  const { year, quarter, branch_id } = req.query;

  let query = `
      SELECT goal_id, name, description, year, quarter, weight, created_at, updated_at,
             start_year, end_year, COALESCE(is_active, 1) AS is_active, pillar_id, branch_id
      FROM goals
      WHERE 1=1
  `;
  const queryParams = [];

  // Strict Branch Isolation: Users only see goals for their assigned branch(es) unless Super Admin
  const userBranchId = Number(req.branch_id) || 1;
  const isSuper = Boolean(req.is_super_admin);
  const allowedBranches = req.allowed_branches && Array.isArray(req.allowed_branches) ? req.allowed_branches : [userBranchId];

  if (isSuper) {
    if (branch_id && branch_id !== 'all') {
      query += " AND branch_id = ?";
      queryParams.push(branch_id);
    }
  } else {
    query += " AND branch_id IN (?)";
    queryParams.push(allowedBranches);
  }

  if (year) {
    query += " AND year = ?";
    queryParams.push(year);
  }

  if (quarter) {
    query += " AND quarter = ?";
    queryParams.push(quarter);
  }

  con.query(query, queryParams, (err, goals) => {
    if (err) {
      console.error("Database Error (getGoals):", err.message);
      return res.status(500).json({ message: "Error fetching goals" });
    }

    if (!goals || goals.length === 0) {
      return res.status(200).json([]);
    }

    const goalIds = goals.map(g => g.goal_id);
    con.query(
      `SELECT goal_id, year, quarter, is_active FROM goal_quarter_activations WHERE goal_id IN (?)`,
      [goalIds],
      (actErr, activations) => {
        const activationsMap = {};
        if (!actErr && Array.isArray(activations)) {
          activations.forEach(row => {
            if (!activationsMap[row.goal_id]) activationsMap[row.goal_id] = {};
            if (!activationsMap[row.goal_id][row.year]) activationsMap[row.goal_id][row.year] = {};
            activationsMap[row.goal_id][row.year][row.quarter] = Boolean(row.is_active);
          });
        }

        const enrichedGoals = goals.map(g => ({
          ...g,
          start_year: g.start_year || g.year,
          end_year: g.end_year || ((g.start_year || g.year) + 5),
          is_active: Boolean(g.is_active),
          quarter_activations: activationsMap[g.goal_id] || {}
        }));

        res.status(200).json(enrichedGoals);
      }
    );
  });
};

// ─── getObjectivesByGoals ─────────────────────────────────────────────────────
const getObjectivesByGoals = (req, res) => {
  const { goal_id, year, quarter, branch_id } = req.query;

  let query = `
    SELECT
      objective_id,
      goal_id,
      name,
      description,
      weight,
      branch_id
    FROM objectives
    WHERE 1=1
  `;
  const queryParams = [];

  // Strict Branch Isolation: Users only see objectives for their assigned branch(es) unless Super Admin
  const userBranchId = Number(req.branch_id) || 1;
  const isSuper = Boolean(req.is_super_admin);
  const allowedBranches = req.allowed_branches && Array.isArray(req.allowed_branches) ? req.allowed_branches : [userBranchId];

  if (isSuper) {
    if (branch_id && branch_id !== 'all') {
      query += " AND branch_id = ?";
      queryParams.push(branch_id);
    }
  } else {
    query += " AND branch_id IN (?)";
    queryParams.push(allowedBranches);
  }

  if (goal_id) {
    query += " AND goal_id = ?";
    queryParams.push(goal_id);
  }

  query += " ORDER BY objective_id ASC";

  con.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Database Error (getObjectivesByGoals):", err.message);
      return res.status(500).json({ message: "Error fetching objectives from the database" });
    }

    const objectives = results || [];
    if (objectives.length === 0) return res.status(200).json([]);

    const objIds = objectives.map(o => o.objective_id);

    // Fetch quarter activations for these objectives
    con.query(
      `SELECT objective_id, year, quarter, is_active FROM objective_quarter_activations WHERE objective_id IN (?)`,
      [objIds],
      (actErr, activations) => {
        const actMap = {};
        if (!actErr && Array.isArray(activations)) {
          activations.forEach(row => {
            if (!actMap[row.objective_id]) actMap[row.objective_id] = {};
            if (!actMap[row.objective_id][row.year]) actMap[row.objective_id][row.year] = {};
            actMap[row.objective_id][row.year][row.quarter] = Boolean(row.is_active);
          });
        }

        const targetYear = year ? parseInt(year, 10) : null;
        const targetQuarter = quarter ? String(quarter) : null;

        const enriched = objectives.map(o => {
          const qActs = actMap[o.objective_id] || {};
          let periodActive = true;
          if (targetYear && targetQuarter) {
            periodActive = qActs[targetYear]?.[targetQuarter] !== false;
          }
          return {
            ...o,
            quarter_activations: qActs,
            period_active: periodActive
          };
        });

        res.status(200).json(enriched);
      }
    );
  });
};

// Helper to parse array from JSON or comma-separated value
const parseIdArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "number") return [String(val)];
  if (typeof val === "string") {
    val = val.trim();
    if (!val) return [];
    if (val.startsWith("[")) {
      try { return JSON.parse(val).map(String); } catch {}
    }
    return val.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
};

// ─── getspesificObjectivesByGoals ─────────────────────────────────────────────
const getspesificObjectivesByGoals = (req, res) => {
  const { objective_id, all } = req.query;
  const user_id = req.user_id;

  // 1. Fetch user info, role, employee_id, and assigned department/org positions
  const userQuery = `
    SELECT
      u.user_id,
      u.employee_id,
      r.role_name,
      e.department_id
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.role_id
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    WHERE u.user_id = ?
  `;

  con.query(userQuery, [user_id], (err, userRows) => {
    if (err) {
      console.error("Database Error fetching user details:", err.message);
      return res.status(500).json({ message: "Error authenticating user profile" });
    }

    const userInfo = userRows && userRows.length > 0 ? userRows[0] : null;
    const roleName = (userInfo?.role_name || "").toLowerCase();
    const isAdmin = ["admin", "ceo", "super admin", "administrator", "executive", "top executive"].includes(roleName);
    const employeeId = userInfo?.employee_id;

    // 2. Collect all org node IDs for this user
    const userOrgNodeIds = new Set();
    if (userInfo?.department_id) {
      userOrgNodeIds.add(String(userInfo.department_id));
    }

    const fetchPositionsAndObjectives = () => {
      // 3. Fetch specific objectives (filtered by objective_id if provided, else all)
      const { year, quarter, branch_id } = req.query;
      let sql = `
        SELECT
          so.specific_objective_id,
          so.objective_id,
          so.specific_objective_name,
          so.view,
          so.weight,
          so.plan_type,
          so.branch_id,
          so.department_id                        AS org_node_id,
          so.org_node_ids,
          so.supportive_org_node_ids,
          os.name                                 AS department_name,
          os.type                                 AS org_type,
          so.created_at,
          so.updated_at
        FROM specific_objectives so
        LEFT JOIN organization_structure os ON so.department_id = os.id
        WHERE 1=1
      `;
      const queryParams = [];

      // Strict Branch Isolation: Users only see specific objectives for their assigned branch(es) unless Super Admin
      const userBranchId = Number(req.branch_id) || 1;
      const isSuper = Boolean(req.is_super_admin);
      const allowedBranches = req.allowed_branches && Array.isArray(req.allowed_branches) ? req.allowed_branches : [userBranchId];

      if (isSuper) {
        if (branch_id && branch_id !== 'all') {
          sql += " AND so.branch_id = ?";
          queryParams.push(branch_id);
        }
      } else {
        sql += " AND so.branch_id IN (?)";
        queryParams.push(allowedBranches);
      }

      if (objective_id) {
        sql += " AND so.objective_id = ?";
        queryParams.push(objective_id);
      }

      sql += " ORDER BY so.specific_objective_id ASC";

      con.query(sql, queryParams, (err, results) => {
        if (err) {
          console.error("Database Error (getspesificObjectivesByGoals):", err.message);
          return res.status(500).json({ message: "Error fetching specific objectives from the database" });
        }

        const rawList = results || [];

        // Helper to build final response: attach kpi_quarter_activations
        const attachKpiActivationsAndReturn = (filteredList) => {
          if (!filteredList.length) return res.status(200).json([]);
          const kpiIds = filteredList.map(k => k.specific_objective_id);
          con.query(
            `SELECT specific_objective_id, year, quarter, is_active FROM kpi_quarter_activations WHERE specific_objective_id IN (?)`,
            [kpiIds],
            (kpiActErr, kpiActs) => {
              const kpiActMap = {};
              if (!kpiActErr && Array.isArray(kpiActs)) {
                kpiActs.forEach(row => {
                  if (!kpiActMap[row.specific_objective_id]) kpiActMap[row.specific_objective_id] = {};
                  if (!kpiActMap[row.specific_objective_id][row.year]) kpiActMap[row.specific_objective_id][row.year] = {};
                  kpiActMap[row.specific_objective_id][row.year][row.quarter] = Boolean(row.is_active);
                });
              }
              const targetYear = year ? parseInt(year, 10) : null;
              const targetQuarter = quarter ? String(quarter) : null;
              const enriched = filteredList.map(k => {
                const qActs = kpiActMap[k.specific_objective_id] || {};
                let periodActive = true;
                if (targetYear && targetQuarter) {
                  periodActive = qActs[targetYear]?.[targetQuarter] !== false;
                }
                return { ...k, quarter_activations: qActs, period_active: periodActive };
              });
              return res.status(200).json(enriched);
            }
          );
        };

        // If admin/CEO or explicit all=true, return all specific objectives unfiltered
        if (all === "true" || isAdmin) {
          return attachKpiActivationsAndReturn(rawList);
        }

        // If user has no assigned org position, show unassigned objectives
        if (userOrgNodeIds.size === 0) {
          const unassignedOnly = rawList.filter(item => {
            const pIds = parseIdArray(item.org_node_ids || item.org_node_id);
            const sIds = parseIdArray(item.supportive_org_node_ids);
            return pIds.length === 0 && sIds.length === 0 && !item.org_node_id;
          });
          return attachKpiActivationsAndReturn(unassignedOnly);
        }

        // Filter: user sees specific objectives matching their primary/supportive org position, OR unassigned objectives
        const filtered = rawList.filter(item => {
          const pIds = parseIdArray(item.org_node_ids || item.org_node_id);
          const sIds = parseIdArray(item.supportive_org_node_ids);

          const isUnassigned = pIds.length === 0 && sIds.length === 0 && !item.org_node_id;
          if (isUnassigned) return true;

          const isPrimaryMatch = pIds.some(id => userOrgNodeIds.has(String(id))) || (item.org_node_id && userOrgNodeIds.has(String(item.org_node_id)));
          const isSupportiveMatch = sIds.some(id => userOrgNodeIds.has(String(id)));

          return isPrimaryMatch || isSupportiveMatch;
        });

        return attachKpiActivationsAndReturn(filtered);
      });
    };

    if (employeeId) {
      con.query("SELECT org_node_id FROM employee_positions WHERE employee_id = ?", [employeeId], (posErr, posRows) => {
        if (!posErr && posRows) {
          posRows.forEach(row => {
            if (row.org_node_id) userOrgNodeIds.add(String(row.org_node_id));
          });
        }
        fetchPositionsAndObjectives();
      });
    } else {
      fetchPositionsAndObjectives();
    }
  });
};

// ─── getGoal ──────────────────────────────────────────────────────────────────
const getGoal = (req, res) => {
  const user_id = req.user_id;
  const { goal_id } = req.query;

  if (!goal_id) {
    return res.status(400).json({ message: "Goal ID is required" });
  }

  const query = `
    SELECT id, name, description, created_at, updated_at
    FROM goals
    WHERE id = ? AND user_id = ?
  `;

  con.query(query, [goal_id, user_id], (err, results) => {
    if (err) {
      console.error("Database Error (getGoal):", err.message);
      return res.status(500).json({ message: "Error fetching goal" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Goal not found." });
    }

    res.status(200).json(results[0]);
  });
};

const getObjectiveById = (req, res) => {
  const { objective_id } = req.params;

  const query = `
    SELECT objective_id, goal_id, name, description, weight, created_at, updated_at
    FROM objectives
    WHERE objective_id = ?
  `;

  con.query(query, [objective_id], (err, results) => {
    if (err) {
      console.error("Database Error (getObjectiveById):", err.message);
      return res.status(500).json({ message: "Error fetching objective" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Objective not found" });
    }

    res.status(200).json(results[0]);
  });
};

// ─── getGoalById ──────────────────────────────────────────────────────────────
const getGoalById = (req, res) => {
  const user_id = req.user_id;
  const { goal_id } = req.params;

  const query = `
    SELECT id, name, description, created_at, updated_at
    FROM goals
    WHERE id = ? AND user_id = ?
  `;

  con.query(query, [goal_id, user_id], (err, results) => {
    if (err) {
      console.error("Database Error (getGoalById):", err.message);
      return res.status(500).json({ message: "Error fetching goal" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.status(200).json({
      message: "Goal fetched successfully",
      goal: results[0],
    });
  });
};

// ─── getAllObjectives ─────────────────────────────────────────────────────────
const getAllObjectives = (req, res) => {
  const userBranchId = Number(req.branch_id) || 1;
  const isSuper = Boolean(req.is_super_admin);
  const allowedBranches = req.allowed_branches && Array.isArray(req.allowed_branches) ? req.allowed_branches : [userBranchId];

  let query = `
    SELECT
      objective_id,
      goal_id,
      name,
      description,
      year,
      quarter,
      branch_id,
      created_at,
      updated_at
    FROM objectives
  `;
  const params = [];
  if (!isSuper) {
    query += " WHERE branch_id IN (?)";
    params.push(allowedBranches);
  }
  query += " ORDER BY updated_at DESC, created_at DESC";

  con.query(query, params, (err, results) => {
    if (err) {
      console.error("Database Error (getAllObjectives):", err.message);
      return res.status(500).json({ message: "Error fetching objectives from the database" });
    }

    console.log("All Objectives retrieved:", results.length);
    res.status(200).json(results);
  });
};

// ─── getAllSpecificObjectives ──────────────────────────────────────────────────
const getAllSpecificObjectives = (req, res) => {
  const userBranchId = Number(req.branch_id) || 1;
  const isSuper = Boolean(req.is_super_admin);
  const allowedBranches = req.allowed_branches && Array.isArray(req.allowed_branches) ? req.allowed_branches : [userBranchId];

  let query = `
    SELECT
      specific_objective_id,
      objective_id,
      specific_objective_name,
      view,
      branch_id,
      created_at,
      updated_at
    FROM specific_objectives
  `;
  const params = [];
  if (!isSuper) {
    query += " WHERE branch_id IN (?)";
    params.push(allowedBranches);
  }
  query += " ORDER BY updated_at DESC, created_at DESC";

  con.query(query, params, (err, results) => {
    if (err) {
      console.error("Database Error (getAllSpecificObjectives):", err.message);
      return res.status(500).json({ message: "Error fetching specific objectives from the database" });
    }

    console.log("All Specific Objectives retrieved:", results.length);
    res.status(200).json(results);
  });
};

// ─── getSpecificObjectiveDetailsByKpi ─────────────────────────────────────────
// Returns specific_objective_details (action plans) for a given specific_objective_id
// with action_plan_quarter_activations and period_active attached.
const getSpecificObjectiveDetailsByKpi = (req, res) => {
  const { specific_objective_id, year, quarter } = req.query;

  if (!specific_objective_id) {
    return res.status(400).json({ message: "specific_objective_id is required" });
  }

  const sql = `
    SELECT
      specific_objective_detail_id,
      specific_objective_id,
      COALESCE(specific_objective_detailname, name) AS name,
      details, baseline, plan, measurement, deadline, status, priority,
      weight, plan_type, created_at, updated_at
    FROM specific_objective_details
    WHERE specific_objective_id = ?
    ORDER BY specific_objective_detail_id ASC
  `;

  con.query(sql, [specific_objective_id], (err, rows) => {
    if (err) {
      console.error("Database Error (getSpecificObjectiveDetailsByKpi):", err.message);
      return res.status(500).json({ message: "Error fetching action plan details" });
    }

    const details = rows || [];
    if (!details.length) return res.status(200).json([]);

    const detailIds = details.map(d => d.specific_objective_detail_id);
    con.query(
      `SELECT specific_objective_detail_id, year, quarter, is_active FROM action_plan_quarter_activations WHERE specific_objective_detail_id IN (?)`,
      [detailIds],
      (apActErr, apActs) => {
        const apActMap = {};
        if (!apActErr && Array.isArray(apActs)) {
          apActs.forEach(row => {
            if (!apActMap[row.specific_objective_detail_id]) apActMap[row.specific_objective_detail_id] = {};
            if (!apActMap[row.specific_objective_detail_id][row.year]) apActMap[row.specific_objective_detail_id][row.year] = {};
            apActMap[row.specific_objective_detail_id][row.year][row.quarter] = Boolean(row.is_active);
          });
        }

        const targetYear = year ? parseInt(year, 10) : null;
        const targetQuarter = quarter ? String(quarter) : null;

        const enriched = details.map(d => {
          const qActs = apActMap[d.specific_objective_detail_id] || {};
          let periodActive = true;
          if (targetYear && targetQuarter) {
            periodActive = qActs[targetYear]?.[targetQuarter] !== false;
          }
          return { ...d, quarter_activations: qActs, period_active: periodActive };
        });

        return res.status(200).json(enriched);
      }
    );
  });
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  getGoalById,
  getObjectiveById,
  getGoals,
  getObjectivesByGoals,
  getspesificObjectivesByGoals,
  getSpecificObjectiveDetailsByKpi,
  getAllObjectives,
  getAllSpecificObjectives,
  getGoal,
  // getPlansBySpecificGoal is referenced in planRoutes.js but was never defined;
  // exporting undefined here avoids a destructuring error on that side.
  getPlansBySpecificGoal: undefined,
};
