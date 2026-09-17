const con = require("../models/db");
const { logAudit, AUDIT_ACTIONS } = require('../middleware/auditLogger');

// Privileged roles that can edit/delete any Goal, Objective or KPI
const PRIVILEGED_ROLES = ["admin", "super admin", "administrator", "plan", "report", "plan and report", "ceo", "deputy ceo", "executive"];

// Helper: look up role_name for the current user
const getUserRoleName = (user_id, callback) => {
  con.query(
    "SELECT r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?",
    [user_id],
    (err, rows) => {
      if (err) return callback(err, null);
      const roleName = (rows && rows.length > 0 ? rows[0].role_name : "") || "";
      callback(null, roleName.toLowerCase().trim());
    }
  );
};

const addGoals = (req, res) => {
  const { name, description, year, quarter, weight, start_year, end_year } = req.body;
  const user_id = req.user_id; // set by verifyToken middleware

  if (!name || !description || !year || !quarter) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const goalWeight = weight != null && !isNaN(weight) ? parseFloat(weight) : 100;
  const goalYear = parseInt(year, 10);
  const goalStartYear = start_year ? parseInt(start_year, 10) : goalYear;
  const goalEndYear = end_year ? parseInt(end_year, 10) : (goalStartYear + 5);

  con.query(
    "SELECT employee_id FROM users WHERE user_id = ?",
    [user_id],
    (err, result) => {
      if (err) {
        console.error("Database Error during user lookup:", err);
        return res.status(500).json({ message: "Error finding employee_id for the user" });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const employee_id = result[0].employee_id;
      console.log("Employee ID:", employee_id);

      const query = `
        INSERT INTO goals (
          user_id, name, description, year, quarter, weight, created_at, updated_at, employee_id, start_year, end_year, is_active
        ) 
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, 1)
      `;

      const values = [user_id, name, description, goalYear, quarter, goalWeight, employee_id, goalStartYear, goalEndYear];

      con.query(query, values, (err, result) => {
        if (err) {
          console.error("Error adding goal:", err);
          return res.status(500).json({ message: "Error adding goals" });
        }

        const goal_id = result.insertId;
        console.log("Goal added successfully with ID:", goal_id);

        // Auto-activate all 4 quarters for start_year through end_year in goal_quarter_activations
        const activationRows = [];
        for (let y = goalStartYear; y <= goalEndYear; y++) {
          for (let q = 1; q <= 4; q++) {
            activationRows.push([goal_id, y, String(q), 1]);
          }
        }

        if (activationRows.length > 0) {
          const actSql = `
            INSERT INTO goal_quarter_activations (goal_id, year, quarter, is_active)
            VALUES ?
            ON DUPLICATE KEY UPDATE is_active = 1
          `;
          con.query(actSql, [activationRows], (actErr) => {
            if (actErr) console.error("Error initializing quarter activations for goal:", actErr.message);
          });
        }

        logAudit(user_id, AUDIT_ACTIONS.PLAN_CREATE || 'PLAN_CREATE', `Created strategic goal: "${name}" (${goalStartYear}-${goalEndYear})`, {
          goal_id, name, year: goalYear, weight: goalWeight, start_year: goalStartYear, end_year: goalEndYear
        }, req).catch(() => {});

        res.status(201).json({
          message: "goal added successfully",
          goal_id: goal_id,
        });
      });
    }
  );
};





// Add Objective
const addObjectives = (req, res) => {
  const user_id = req.user_id; // set by verifyToken middleware
  const { goal, name, description, weight } = req.body;
  const objWeight = weight != null && !isNaN(weight) ? parseFloat(weight) : 100;

  console.log("addObjectives - Request body:", { goal, name, description, weight: objWeight, user_id });

  if (!goal || !name || !description) {
    return res.status(400).json({ message: "Goal ID, objective name, and description are required" });
  }

  con.query(
    "SELECT employee_id FROM users WHERE user_id = ?",
    [user_id],
    (err, userResult) => {
      if (err) {
        console.error("Database Error during user lookup:", err);
        return res.status(500).json({ message: "Error finding employee_id for the user", error: err.message });
      }

      if (userResult.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const employee_id = userResult[0].employee_id;

      const query = `
        INSERT INTO objectives (user_id, goal_id, name, description, weight, employee_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      con.query(query, [user_id, goal, name, description, objWeight, employee_id], (err, result) => {
        if (err) {
          console.error("Database Error adding objective:", err.message, err.code);
          if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ message: "Invalid goal ID provided" });
          }
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "This objective already exists" });
          }
          return res.status(500).json({ message: "Error adding objective", error: err.message, code: err.code });
        }

        logAudit(user_id, AUDIT_ACTIONS.PLAN_CREATE || 'PLAN_CREATE', `Created objective: "${name}" under Goal ID ${goal}`, {
          objective_id: result.insertId, goal_id: goal, name, weight: objWeight
        }, req).catch(() => {});

        console.log("Objective created successfully with ID:", result.insertId);
        res.status(201).json({ message: "Objective created successfully", objective_id: result.insertId });
      });
    }
  );
};





const toDbJson = (val) => {
  if (!val) return null;
  if (Array.isArray(val)) return val.length ? JSON.stringify(val) : null;
  if (typeof val === "string") {
    if (val.trim().startsWith("[")) return val.trim();
    const arr = val.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length ? JSON.stringify(arr) : null;
  }
  return null;
};

// Add specific objectives
const addSpecificObjectives = (req, res) => {
  const user_id = req.user_id; // set by verifyToken middleware
  {
    // keeping indentation block for minimal diff
    const { objective_id, specific_objective_name, view, org_node_id, org_node_ids, supportive_org_node_ids, weight, plan_type, planType, plan_Type } = req.body;
    const resolvedPlanType = plan_type || planType || plan_Type || 'general';

    console.log("addSpecificObjectives - Request body:", { objective_id, specific_objective_name, view, org_node_id, org_node_ids, supportive_org_node_ids, weight, plan_type: resolvedPlanType, user_id });

    if (!objective_id || !specific_objective_name || !view) {
      return res.status(400).json({
        message: "Objective ID, specific_objective_name, and view are required fields.",
      });
    }

    const kpiWeight = weight != null && !isNaN(weight) ? parseFloat(weight) : 1;
    const primaryJson = toDbJson(org_node_ids);
    const supportiveJson = toDbJson(supportive_org_node_ids);
    let primarySingleId = org_node_id;

    if (!primarySingleId && primaryJson) {
      try {
        const arr = JSON.parse(primaryJson);
        if (arr.length) primarySingleId = arr[0];
      } catch {}
    }

    // ── If an explicit org position or list was chosen, skip auto-detection ──
    if (primarySingleId || primaryJson || supportiveJson) {
      const insertQuery = `
        INSERT INTO specific_objectives (
          user_id, objective_id, specific_objective_name, view,
          deadline_quarter, priority, department_id, name, count,
          org_node_ids, supportive_org_node_ids, weight, plan_type,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      const vals = [
        user_id, objective_id, specific_objective_name, view,
        'Q1', 'አስፈላጊ', primarySingleId || null, specific_objective_name, 1,
        primaryJson, supportiveJson, kpiWeight, resolvedPlanType
      ];
      con.query(insertQuery, vals, (err, result) => {
        if (err) {
          console.error("Database Error adding specific objective (explicit org):", err);
          return res.status(500).json({ message: "Error adding specific objective", error: err.message, code: err.code });
        }
        res.status(201).json({ message: "KPI created successfully.", specific_objective_id: result.insertId });
      });
      return; // stop; do NOT fall through to the employee-lookup chain below
    }

    // Get employee details - try multiple fallback columns
    const getEmployeeDetailsQuery = `
      SELECT
        e.employee_id,
        COALESCE(
          ep.org_node_id,
          e.department_id,
          (SELECT org_node_id FROM employee_positions WHERE employee_id = e.employee_id LIMIT 1)
        ) as department_id,
        e.supervisor_id
      FROM employees e
      JOIN users u ON e.employee_id = u.employee_id
      LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
      WHERE u.user_id = ?
    `;

    con.query(getEmployeeDetailsQuery, [user_id], async (err, employeeResults) => {
      if (err) {
        console.error("Error fetching employee details:", err);
        return res.status(500).json({
          message: "Error fetching employee details from the database.",
          error: err.message
        });
      }

      if (employeeResults.length === 0) {
        return res.status(404).json({ message: "Employee not found for the given user." });
      }

      let { department_id, employee_id, supervisor_id } = employeeResults[0];
      console.log("Department ID (primary lookup):", department_id);

      // Fallback 1: get department from the objective's existing specific_objectives
      if (!department_id) {
        try {
          const [objDept] = await new Promise((resolve, reject) => {
            con.query(
              `SELECT department_id FROM specific_objectives WHERE objective_id = ? AND department_id IS NOT NULL LIMIT 1`,
              [objective_id],
              (e, r) => e ? reject(e) : resolve(r)
            );
          });
          if (objDept) {
            department_id = objDept.department_id;
            console.log("Department ID (from objective fallback):", department_id);
          }
        } catch (e) { console.warn("Objective fallback failed:", e.message); }
      }

      // Fallback 2: get department from supervisor's employee record
      if (!department_id && supervisor_id) {
        try {
          const [supDept] = await new Promise((resolve, reject) => {
            con.query(
              `SELECT COALESCE(ep.org_node_id, e.department_id) as department_id
               FROM employees e
               LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
               WHERE e.employee_id = ? LIMIT 1`,
              [supervisor_id],
              (e, r) => e ? reject(e) : resolve(r)
            );
          });
          if (supDept && supDept.department_id) {
            department_id = supDept.department_id;
            console.log("Department ID (from supervisor fallback):", department_id);
          }
        } catch (e) { console.warn("Supervisor fallback failed:", e.message); }
      }

      // Fallback 3: use the first department that exists in the departments table
      if (!department_id) {
        try {
          const [firstDept] = await new Promise((resolve, reject) => {
            con.query(
              `SELECT department_id FROM departments ORDER BY department_id LIMIT 1`,
              [],
              (e, r) => e ? reject(e) : resolve(r)
            );
          });
          if (firstDept) {
            department_id = firstDept.department_id;
            console.warn(`Department ID still null for user_id=${user_id}. Using default department_id=${department_id}`);
          }
        } catch (e) { console.warn("Default department fallback failed:", e.message); }
      }

      // Hard stop: no department found anywhere
      if (!department_id) {
        console.error(`Cannot add specific objective: no department found for user_id=${user_id}`);
        return res.status(400).json({
          message: "Cannot add specific objective: no department is assigned. Please contact an administrator.",
          code: "MISSING_DEPARTMENT"
        });
      }


      const query = `
        INSERT INTO specific_objectives (
          user_id, objective_id, specific_objective_name, view, 
          deadline_quarter, priority, department_id, name, count, plan_type, weight,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;

      // Provide default values for required fields
      const values = [
        user_id,
        objective_id,
        specific_objective_name,
        view,
        'Q1',  // Default deadline_quarter
        'አስፈላጊ',  // Default priority (Important in Amharic)
        department_id,
        specific_objective_name,  // Use specific_objective_name as name
        1,  // Default count
        resolvedPlanType,
        kpiWeight
      ];

      con.query(query, values, (err, result) => {
        if (err) {
          console.error("Database Error adding specific objective:", err);
          console.error("Error code:", err.code);
          console.error("Error message:", err.message);
          console.error("SQL State:", err.sqlState);

          if (err.code === "ER_NO_REFERENCED_ROW" || err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
              message: "Invalid objective ID provided.",
            });
          }

          return res.status(500).json({
            message: "An error occurred while adding the specific objective. Please try again.",
            error: err.message,
            code: err.code
          });
        }
        logAudit(user_id, AUDIT_ACTIONS.PLAN_CREATE || 'PLAN_CREATE', `Created specific objective (KPI): "${specific_objective_name}"`, {
          specific_objective_id: result.insertId, objective_id, name: specific_objective_name, department_id, plan_type: resolvedPlanType
        }, req).catch(() => {});

        console.log("Specific Objective created successfully with ID:", result.insertId);
        res.status(201).json({
          message: "Specific Objective created successfully.",
          specific_objective_id: result.insertId,
        });
      });
    });
  }
};


// Add Specific specific_objective_detail

// Helper to promisify db.query
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

const addspecificObjectiveDetails = async (req, res) => {
  const user_id = req.user_id; // set by verifyToken middleware

  try {
    console.log("user_id from token:", user_id);

    let { specific_objective } = req.body;
    if (!Array.isArray(specific_objective)) {
      if (req.body.specific_objective_id) {
        specific_objective = [req.body];
      } else {
        return res.status(400).json({ message: "specific_objective array or single specific_objective is required." });
      }
    }
    if (specific_objective.length === 0) {
      return res.status(400).json({ message: "specific_objective array cannot be empty." });
    }

    // Get employee details (using org_node_id as the primary position identifier)
    const getEmployeeDetailsQuery = `
          SELECT e.fname, IFNULL(ep.org_node_id, e.department_id) as department_id 
          FROM employees e 
          JOIN users u ON e.employee_id = u.employee_id 
          LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
          WHERE u.user_id = ?`;

    const employeeResults = await query(getEmployeeDetailsQuery, [user_id]);

    if (employeeResults.length === 0) {
      return res.status(404).json({ message: "Employee not found for the given user." });
    }

    const { fname: employeeName, department_id } = employeeResults[0];

    // Validate required fields
    const validationErrors = specific_objective.map((item) => {
      const requiredFields = [
        'specific_objective_id', 'specific_objective_detailname', 'baseline', 'plan', 'measurement', 'year', 'month', 'day'
      ];
      const missingFields = requiredFields.filter(field => item[field] === undefined || item[field] === null || item[field] === '');
      return missingFields.length ? `Missing required fields: ${missingFields.join(', ')}` : null;
    }).filter(Boolean);

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation errors occurred.", errors: validationErrors });
    }

    const insertIds = [];

    // Process each specific objective sequentially to avoid connection issues
    for (const item of specific_objective) {
      // Look up goal_id via specific_objective -> objective -> goal
      const [soRow] = await query(
        `SELECT o.goal_id 
         FROM specific_objectives so 
         JOIN objectives o ON so.objective_id = o.objective_id 
         WHERE so.specific_objective_id = ?`,
        [item.specific_objective_id]
      );
      const goal_id = soRow ? soRow.goal_id : (item.goal_id || null);

      const actionPlanWeight = item.weight != null && !isNaN(item.weight) ? parseFloat(item.weight) : 0;

      // Validate weight against remaining KPI weight budget
      if (item.specific_objective_id && actionPlanWeight > 0) {
        const [kpiRow] = await query(
          `SELECT weight FROM specific_objectives WHERE specific_objective_id = ?`,
          [item.specific_objective_id]
        );
        if (kpiRow && kpiRow.weight != null) {
          const kpiWeight = parseFloat(kpiRow.weight);
          const [usedRow] = await query(
            `SELECT COALESCE(SUM(weight), 0) AS total_used 
             FROM specific_objective_details 
             WHERE specific_objective_id = ?`,
            [item.specific_objective_id]
          );
          const usedWeight = parseFloat(usedRow.total_used || 0);
          if (usedWeight + actionPlanWeight > kpiWeight + 0.001) {
            return res.status(400).json({
              message: `Weight exceeds KPI budget. Total allocated (${parseFloat((usedWeight + actionPlanWeight).toFixed(4))}) cannot exceed KPI weight (${kpiWeight}). Remaining: ${parseFloat((kpiWeight - usedWeight).toFixed(4))}`,
              kpi_weight: kpiWeight,
              used_weight: usedWeight,
              remaining_weight: kpiWeight - usedWeight,
            });
          }
        }
      }

      // Insert specific objective details
      const insertQuery = `
                          INSERT INTO specific_objective_details (
                              user_id, goal_id, specific_objective_id, specific_objective_detailname, details,
                              baseline, plan, measurement, created_by, year, month, day, deadline, status, priority,
                              plan_type, cost_type, income_exchange, employment_type, incomeName, costName,
                              CIbaseline, CIplan, department_id, name, description, count,
                              project_type, income_plan_type, employee_of, weight
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      // Convert CIbaseline and CIplan to numbers
      let ciBaseline = null;
      let ciPlan = null;

      if (item.CIbaseline !== null && item.CIbaseline !== undefined && item.CIbaseline !== '') {
        ciBaseline = parseFloat(item.CIbaseline);
        if (isNaN(ciBaseline)) throw new Error(`Invalid CIbaseline value: ${item.CIbaseline}`);
      }

      if (item.CIplan !== null && item.CIplan !== undefined && item.CIplan !== '') {
        ciPlan = parseFloat(item.CIplan);
        if (isNaN(ciPlan)) throw new Error(`Invalid CIplan value: ${item.CIplan}`);
      }

      const sqlParameters = [
        user_id, goal_id, item.specific_objective_id, item.specific_objective_detailname, item.details,
        item.baseline, item.plan, item.measurement, employeeName, item.year, item.month, item.day,
        item.deadline || null, item.status || "Pending", item.priority || "አስፈላጊ",
        item.plan_type || null, item.cost_type || null, item.income_exchange || null,
        item.employment_type || null, item.incomeName || null, item.costName || null,
        ciBaseline, ciPlan, department_id,
        item.name || item.specific_objective_detailname || "Default Name",
        item.description || item.details || "Default Description",
        item.count || 1,
        item.project_type || null,
        item.income_plan_type || null,
        item.employee_of || null,
        actionPlanWeight || 0
      ];

      const result = await query(insertQuery, sqlParameters);
      const detailId = result.insertId;
      insertIds.push(detailId);

      // Handle task breakdown if provided
      if (item.tasks && Array.isArray(item.tasks) && item.tasks.length > 0) {
        for (const monthlyTask of item.tasks) {
          const monthlyTaskQuery = `
                        INSERT INTO monthly_tasks (specific_objective_detail_id, name, weight)
                        VALUES (?, ?, ?)
                      `;
          const monthlyResult = await query(monthlyTaskQuery, [detailId, monthlyTask.name, monthlyTask.weight || 0]);
          const monthlyTaskId = monthlyResult.insertId;

          if (monthlyTask.weeklyTasks && Array.isArray(monthlyTask.weeklyTasks) && monthlyTask.weeklyTasks.length > 0) {
            for (const weeklyTask of monthlyTask.weeklyTasks) {
              const weeklyTaskQuery = `
                                  INSERT INTO weekly_tasks (monthly_task_id, name, weight)
                                  VALUES (?, ?, ?)
                                `;
              await query(weeklyTaskQuery, [monthlyTaskId, weeklyTask.name, weeklyTask.weight || 0]);
            }
          }
        }
      }
    }

    logAudit(user_id, AUDIT_ACTIONS.PLAN_CREATE || 'PLAN_CREATE', `Created ${insertIds.length} Action Plan detail record(s)`, {
      detail_ids: insertIds, count: insertIds.length
    }, req).catch(() => {});

    res.status(201).json({ message: "Specific objective details added successfully.", insertIds });

  } catch (error) {
    console.error("Error in addspecificObjectiveDetails:", error);
    res.status(500).json({ message: "Error processing specific objective details.", error: error.message });
  }
};

// Update Goal
const updateGoal = (req, res) => {
  const { goal_id } = req.params;
  const { name, description, year, quarter, weight } = req.body;
  const user_id = req.user_id;
  const goalWeight = weight != null && !isNaN(weight) ? parseFloat(weight) : 100;

  getUserRoleName(user_id, (err, roleName) => {
    if (err) return res.status(500).json({ message: "Error checking user role" });
    const isPrivileged = PRIVILEGED_ROLES.some(r => roleName.includes(r));

    const query = isPrivileged
      ? `UPDATE goals SET name = ?, description = ?, year = ?, quarter = ?, weight = ?, updated_at = CURRENT_TIMESTAMP WHERE goal_id = ?`
      : `UPDATE goals SET name = ?, description = ?, year = ?, quarter = ?, weight = ?, updated_at = CURRENT_TIMESTAMP WHERE goal_id = ? AND user_id = ?`;

    const params = isPrivileged
      ? [name, description, year, quarter, goalWeight, goal_id]
      : [name, description, year, quarter, goalWeight, goal_id, user_id];

    con.query(query, params, (err, result) => {
      if (err) {
        console.error("Error updating goal:", err);
        return res.status(500).json({ message: "Error updating goal" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Goal not found or unauthorized" });
      }
      logAudit(user_id, AUDIT_ACTIONS.PLAN_UPDATE || 'PLAN_UPDATE', `Updated goal ID ${goal_id}: "${name || ''}"`, {
        goal_id, name, year, quarter, weight: goalWeight
      }, req).catch(() => {});

      res.status(200).json({ message: "Goal updated successfully" });
    });
  });
};

// Delete Goal
const deleteGoal = (req, res) => {
  const { goal_id } = req.params;
  const user_id = req.user_id;

  getUserRoleName(user_id, (err, roleName) => {
    if (err) return res.status(500).json({ message: "Error checking user role" });
    const isPrivileged = PRIVILEGED_ROLES.some(r => roleName.includes(r));

    const query = isPrivileged
      ? "DELETE FROM goals WHERE goal_id = ?"
      : "DELETE FROM goals WHERE goal_id = ? AND user_id = ?";
    const params = isPrivileged ? [goal_id] : [goal_id, user_id];

    con.query(query, params, (err, result) => {
      if (err) {
        console.error("Error deleting goal:", err);
        return res.status(500).json({ message: "Error deleting goal" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Goal not found or unauthorized" });
      }
      logAudit(user_id, AUDIT_ACTIONS.PLAN_DELETE || 'PLAN_DELETE', `Deleted strategic goal ID ${goal_id}`, {
        goal_id
      }, req).catch(() => {});

      res.status(200).json({ message: "Goal deleted successfully" });
    });
  });
};

// Update Objective
const updateObjective = (req, res) => {
  const { objective_id } = req.params;
  const { name, description, goal_id, weight } = req.body;
  const user_id = req.user_id;
  const objWeight = weight != null && !isNaN(weight) ? parseFloat(weight) : 100;

  getUserRoleName(user_id, (err, roleName) => {
    if (err) return res.status(500).json({ message: "Error checking user role" });
    const isPrivileged = PRIVILEGED_ROLES.some(r => roleName.includes(r));

    const query = isPrivileged
      ? `UPDATE objectives SET name = ?, description = ?, goal_id = ?, weight = ?, updated_at = CURRENT_TIMESTAMP WHERE objective_id = ?`
      : `UPDATE objectives SET name = ?, description = ?, goal_id = ?, weight = ?, updated_at = CURRENT_TIMESTAMP WHERE objective_id = ? AND user_id = ?`;

    const params = isPrivileged
      ? [name, description, goal_id, objWeight, objective_id]
      : [name, description, goal_id, objWeight, objective_id, user_id];

    con.query(query, params, (err, result) => {
      if (err) {
        console.error("Error updating objective:", err);
        return res.status(500).json({ message: "Error updating objective" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Objective not found or unauthorized" });
      }
      logAudit(user_id, AUDIT_ACTIONS.PLAN_UPDATE || 'PLAN_UPDATE', `Updated objective ID ${objective_id}: "${name || ''}"`, {
        objective_id, name, goal_id, weight: objWeight
      }, req).catch(() => {});

      res.status(200).json({ message: "Objective updated successfully" });
    });
  });
};

// Delete Objective
const deleteObjective = (req, res) => {
  const { objective_id } = req.params;
  const user_id = req.user_id;

  getUserRoleName(user_id, (err, roleName) => {
    if (err) return res.status(500).json({ message: "Error checking user role" });
    const isPrivileged = PRIVILEGED_ROLES.some(r => roleName.includes(r));

    const query = isPrivileged
      ? "DELETE FROM objectives WHERE objective_id = ?"
      : "DELETE FROM objectives WHERE objective_id = ? AND user_id = ?";
    const params = isPrivileged ? [objective_id] : [objective_id, user_id];

    con.query(query, params, (err, result) => {
      if (err) {
        console.error("Error deleting objective:", err);
        return res.status(500).json({ message: "Error deleting objective" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Objective not found or unauthorized" });
      }
      logAudit(user_id, AUDIT_ACTIONS.PLAN_DELETE || 'PLAN_DELETE', `Deleted objective ID ${objective_id}`, {
        objective_id
      }, req).catch(() => {});

      res.status(200).json({ message: "Objective deleted successfully" });
    });
  });
};

// Update Specific Objective (KPI)
const updateSpecificObjective = (req, res) => {
  const { specific_objective_id } = req.params;
  const user_id = req.user_id;
  const { specific_objective_name, view, objective_id, org_node_id, org_node_ids, supportive_org_node_ids, weight, plan_type, planType, plan_Type } = req.body;
  const resolvedPlanType = plan_type || planType || plan_Type || null;

  const primaryJson = toDbJson(org_node_ids);
  const supportiveJson = toDbJson(supportive_org_node_ids);
  let primarySingleId = org_node_id;

  if (!primarySingleId && primaryJson) {
    try {
      const arr = JSON.parse(primaryJson);
      if (arr.length) primarySingleId = arr[0];
    } catch {}
  }

  const hasOrgAssignment = org_node_id !== undefined || org_node_ids !== undefined || supportive_org_node_ids !== undefined;
  const weightVal = weight != null ? parseFloat(weight) : undefined;

  const sql = hasOrgAssignment
    ? `UPDATE specific_objectives
       SET specific_objective_name = COALESCE(?, specific_objective_name),
           view                    = COALESCE(?, view),
           objective_id            = COALESCE(?, objective_id),
           department_id           = ?,
           org_node_ids            = ?,
           supportive_org_node_ids = ?,
           weight                  = COALESCE(?, weight),
           plan_type               = COALESCE(?, plan_type),
           updated_at              = CURRENT_TIMESTAMP
       WHERE specific_objective_id = ?`
    : `UPDATE specific_objectives
       SET specific_objective_name = COALESCE(?, specific_objective_name),
           view                    = COALESCE(?, view),
           objective_id            = COALESCE(?, objective_id),
           weight                  = COALESCE(?, weight),
           plan_type               = COALESCE(?, plan_type),
           updated_at              = CURRENT_TIMESTAMP
       WHERE specific_objective_id = ?`;

  const values = hasOrgAssignment
    ? [specific_objective_name || null, view || null, objective_id || null, primarySingleId || null, primaryJson, supportiveJson, weightVal ?? null, resolvedPlanType, specific_objective_id]
    : [specific_objective_name || null, view || null, objective_id || null, weightVal ?? null, resolvedPlanType, specific_objective_id];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating KPI:", err);
      return res.status(500).json({ message: "Error updating KPI", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "KPI not found" });
    }
    logAudit(user_id, AUDIT_ACTIONS.PLAN_UPDATE || 'PLAN_UPDATE', `Updated KPI ID ${specific_objective_id}: "${specific_objective_name || ''}"`, {
      specific_objective_id, name: specific_objective_name, weight: weightVal
    }, req).catch(() => {});

    res.status(200).json({ message: "KPI updated successfully" });
  });
};

// Delete Specific Objective
const deleteSpecificObjective = (req, res) => {
  const { specific_objective_id } = req.params;
  const user_id = req.user_id;

  con.query("DELETE FROM specific_objectives WHERE specific_objective_id = ?", [specific_objective_id], (err, result) => {
    if (err) {
      console.error("Error deleting specific objective:", err);
      return res.status(500).json({ message: "Error deleting specific objective" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Specific objective not found" });
    }
    logAudit(user_id, AUDIT_ACTIONS.PLAN_DELETE || 'PLAN_DELETE', `Deleted specific objective (KPI) ID ${specific_objective_id}`, {
      specific_objective_id
    }, req).catch(() => {});

    res.status(200).json({ message: "Specific objective deleted successfully" });
  });
};

// ─── Action Plans (specific_objective_details) CRUD ────────────────────────

// GET: list all action plan details for a specific_objective_id (KPI)
const getKPIsBySpecificObjective = (req, res) => {
  const { specific_objective_id } = req.params;

  if (!specific_objective_id) {
    return res.status(400).json({ message: "specific_objective_id is required" });
  }

  const sql = `
    SELECT
      sod.specific_objective_detail_id,
      sod.specific_objective_detailname,
      sod.details,
      sod.baseline,
      sod.plan,
      sod.measurement,
      sod.year,
      sod.month,
      sod.day,
      sod.deadline,
      sod.status,
      sod.priority,
      sod.plan_type,
      sod.cost_type,
      sod.weight,
      sod.created_at,
      sod.updated_at
    FROM specific_objective_details sod
    WHERE sod.specific_objective_id = ?
    ORDER BY sod.created_at DESC
  `;

  con.query(sql, [specific_objective_id], (err, results) => {
    if (err) {
      console.error("Error fetching Action Plans:", err);
      return res.status(500).json({ message: "Error fetching Action Plans", error: err.message });
    }
    res.status(200).json(Array.isArray(results) ? results : []);
  });
};

// GET: KPI weight info (total weight, used weight, remaining weight)
const getKPIWeight = (req, res) => {
  const { specific_objective_id } = req.params;

  if (!specific_objective_id) {
    return res.status(400).json({ message: "specific_objective_id is required" });
  }

  const sql = `
    SELECT
      so.weight AS kpi_weight,
      COALESCE(SUM(sod.weight), 0) AS used_weight
    FROM specific_objectives so
    LEFT JOIN specific_objective_details sod ON so.specific_objective_id = sod.specific_objective_id
    WHERE so.specific_objective_id = ?
    GROUP BY so.specific_objective_id, so.weight
  `;

  con.query(sql, [specific_objective_id], (err, results) => {
    if (err) {
      console.error("Error fetching KPI weight:", err);
      return res.status(500).json({ message: "Error fetching KPI weight", error: err.message });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ message: "KPI not found" });
    }
    const { kpi_weight, used_weight } = results[0];
    res.status(200).json({
      kpi_weight: parseFloat(kpi_weight) || 100,
      used_weight: parseFloat(used_weight) || 0,
      remaining_weight: (parseFloat(kpi_weight) || 100) - (parseFloat(used_weight) || 0),
    });
  });
};

// PUT: update a specific_objective_detail (Action Plan)
const updateKPI = (req, res) => {
  const { detail_id } = req.params;
  const {
    specific_objective_detailname,
    details,
    baseline,
    plan,
    measurement,
    year,
    month,
    day,
    deadline,
    status,
    priority,
    plan_type,
    weight,
  } = req.body;

  if (!detail_id) {
    return res.status(400).json({ message: "detail_id is required" });
  }

  const sql = `
    UPDATE specific_objective_details
    SET
      specific_objective_detailname = COALESCE(?, specific_objective_detailname),
      details                       = COALESCE(?, details),
      baseline                      = COALESCE(?, baseline),
      plan                          = COALESCE(?, plan),
      measurement                   = COALESCE(?, measurement),
      year                          = COALESCE(?, year),
      month                         = COALESCE(?, month),
      day                           = COALESCE(?, day),
      deadline                      = ?,
      status                        = COALESCE(?, status),
      priority                      = COALESCE(?, priority),
      plan_type                     = COALESCE(?, plan_type),
      weight                        = COALESCE(?, weight),
      updated_at                    = CURRENT_TIMESTAMP
    WHERE specific_objective_detail_id = ?
  `;

  const values = [
    specific_objective_detailname ?? null,
    details ?? null,
    baseline != null ? parseFloat(baseline) : null,
    plan != null ? parseFloat(plan) : null,
    measurement ?? null,
    year != null ? parseInt(year) : null,
    month != null ? parseInt(month) : null,
    day != null ? parseInt(day) : null,
    deadline || null,
    status ?? null,
    priority ?? null,
    plan_type ?? null,
    weight != null ? parseFloat(weight) : null,
    detail_id,
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating Action Plan:", err);
      return res.status(500).json({ message: "Error updating Action Plan", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Action Plan not found" });
    }
    logAudit(req.user_id, AUDIT_ACTIONS.PLAN_UPDATE || 'PLAN_UPDATE', `Updated Action Plan detail ID ${detail_id}: "${specific_objective_detailname || ''}"`, {
      detail_id, name: specific_objective_detailname, plan_type, weight
    }, req).catch(() => {});

    res.status(200).json({ message: "Action Plan updated successfully" });
  });
};

// DELETE: remove a specific_objective_detail and its tasks
const deleteKPI = async (req, res) => {
  const { detail_id } = req.params;
  const user_id = req.user_id;

  if (!detail_id) {
    return res.status(400).json({ message: "detail_id is required" });
  }

  try {
    // 1. Delete weekly tasks referencing monthly tasks of this detail
    await new Promise((resolve, reject) =>
      con.query(
        `DELETE wt FROM weekly_tasks wt
         INNER JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
         WHERE mt.specific_objective_detail_id = ?`,
        [detail_id],
        (err) => (err ? reject(err) : resolve())
      )
    );

    // 2. Delete monthly tasks
    await new Promise((resolve, reject) =>
      con.query(
        `DELETE FROM monthly_tasks WHERE specific_objective_detail_id = ?`,
        [detail_id],
        (err) => (err ? reject(err) : resolve())
      )
    );

    // 3. Delete the KPI detail itself
    const result = await new Promise((resolve, reject) =>
      con.query(
        `DELETE FROM specific_objective_details WHERE specific_objective_detail_id = ?`,
        [detail_id],
        (err, res) => (err ? reject(err) : resolve(res))
      )
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "KPI not found" });
    }

    logAudit(user_id, AUDIT_ACTIONS.PLAN_DELETE || 'PLAN_DELETE', `Deleted Action Plan detail ID ${detail_id}`, {
      detail_id
    }, req).catch(() => {});

    res.status(200).json({ message: "KPI deleted successfully" });
  } catch (err) {
    console.error("Error deleting KPI:", err);
    res.status(500).json({ message: "Error deleting KPI", error: err.message });
  }
};

// ─── EQUAL WEIGHT ALLOCATION & BATCH WEIGHT CONTROLLERS ───────────────────────

// Allocate equal weight across all KPIs under an objective
const distributeEqualKpiWeights = async (req, res) => {
  const { objective_id } = req.body;
  if (!objective_id) {
    return res.status(400).json({ message: "objective_id is required" });
  }

  try {
    const [objRows] = await query("SELECT weight FROM objectives WHERE objective_id = ?", [objective_id]);
    const parentWeight = objRows && objRows.weight != null ? parseFloat(objRows.weight) : 100;

    const kpis = await query(
      "SELECT specific_objective_id, weight FROM specific_objectives WHERE objective_id = ? ORDER BY specific_objective_id ASC",
      [objective_id]
    );

    if (!kpis || kpis.length === 0) {
      return res.status(404).json({ message: "No KPIs found under this objective" });
    }

    const count = kpis.length;
    const equalWeight = parseFloat((parentWeight / count).toFixed(4));

    for (let i = 0; i < count; i++) {
      const weightToSet = (i === count - 1)
        ? parseFloat((parentWeight - (equalWeight * (count - 1))).toFixed(4))
        : equalWeight;

      await query(
        "UPDATE specific_objectives SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE specific_objective_id = ?",
        [weightToSet, kpis[i].specific_objective_id]
      );
    }

    res.status(200).json({
      success: true,
      message: `Equally allocated ${parentWeight} weight across ${count} KPIs (${equalWeight} each).`,
      count,
      parentWeight,
      equalWeight
    });
  } catch (err) {
    console.error("Error distributing equal KPI weights:", err);
    res.status(500).json({ message: "Error distributing equal KPI weights", error: err.message });
  }
};

// Allocate equal weight across all Objectives under a goal
const distributeEqualObjectiveWeights = async (req, res) => {
  const { goal_id } = req.body;
  if (!goal_id) {
    return res.status(400).json({ message: "goal_id is required" });
  }

  try {
    const [goalRows] = await query("SELECT weight FROM goals WHERE goal_id = ?", [goal_id]);
    const parentWeight = goalRows && goalRows.weight != null ? parseFloat(goalRows.weight) : 100;

    const objs = await query(
      "SELECT objective_id, weight FROM objectives WHERE goal_id = ? ORDER BY objective_id ASC",
      [goal_id]
    );

    if (!objs || objs.length === 0) {
      return res.status(404).json({ message: "No objectives found under this goal" });
    }

    const count = objs.length;
    const equalWeight = parseFloat((parentWeight / count).toFixed(4));

    for (let i = 0; i < count; i++) {
      const weightToSet = (i === count - 1)
        ? parseFloat((parentWeight - (equalWeight * (count - 1))).toFixed(4))
        : equalWeight;

      await query(
        "UPDATE objectives SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE objective_id = ?",
        [weightToSet, objs[i].objective_id]
      );
    }

    res.status(200).json({
      success: true,
      message: `Equally allocated ${parentWeight} weight across ${count} objectives (${equalWeight} each).`,
      count,
      parentWeight,
      equalWeight
    });
  } catch (err) {
    console.error("Error distributing equal objective weights:", err);
    res.status(500).json({ message: "Error distributing equal objective weights", error: err.message });
  }
};

// Allocate equal weight across all Goals (or within a pillar)
const distributeEqualGoalWeights = async (req, res) => {
  const { pillar_id, total_weight } = req.body;
  const targetTotal = total_weight != null && !isNaN(total_weight) ? parseFloat(total_weight) : 100;

  try {
    const sql = pillar_id
      ? "SELECT goal_id, weight FROM goals WHERE pillar_id = ? AND (is_active = 1 OR is_active IS NULL) ORDER BY goal_id ASC"
      : "SELECT goal_id, weight FROM goals WHERE is_active = 1 OR is_active IS NULL ORDER BY goal_id ASC";
    const params = pillar_id ? [pillar_id] : [];
    const goals = await query(sql, params);

    if (!goals || goals.length === 0) {
      return res.status(404).json({ message: "No goals found to allocate weight" });
    }

    const count = goals.length;
    const equalWeight = parseFloat((targetTotal / count).toFixed(4));

    for (let i = 0; i < count; i++) {
      const weightToSet = (i === count - 1)
        ? parseFloat((targetTotal - (equalWeight * (count - 1))).toFixed(4))
        : equalWeight;

      await query(
        "UPDATE goals SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE goal_id = ?",
        [weightToSet, goals[i].goal_id]
      );
    }

    res.status(200).json({
      success: true,
      message: `Equally allocated ${targetTotal} weight across ${count} goals (${equalWeight} each).`,
      count,
      targetTotal,
      equalWeight
    });
  } catch (err) {
    console.error("Error distributing equal goal weights:", err);
    res.status(500).json({ message: "Error distributing equal goal weights", error: err.message });
  }
};

module.exports = {
  addGoals,
  addObjectives,
  addspecificObjectiveDetails,
  addSpecificObjectives,
  updateGoal,
  deleteGoal,
  updateObjective,
  deleteObjective,
  updateSpecificObjective,
  deleteSpecificObjective,
  getKPIsBySpecificObjective,
  getKPIWeight,
  updateKPI,
  deleteKPI,
  distributeEqualKpiWeights,
  distributeEqualObjectiveWeights,
  distributeEqualGoalWeights,
};




















