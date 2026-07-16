const con = require("../models/db");

// Add Objective
const jwt = require("jsonwebtoken");

const addGoals = (req, res) => {
  const { name, description, year, quarter } = req.body;

  if (!name || !description || !year || !quarter) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    console.log("user_id from token:", user_id);

    con.query(
      "SELECT employee_id FROM users WHERE user_id = ?",
      [user_id],
      (err, result) => {
        if (err) {
          console.error("Database Error during user lookup:", err);
          return res
            .status(500)
            .json({ message: "Error finding employee_id for the user" });
        }

        if (result.length === 0) {
          return res.status(400).json({ message: "User not found" });
        }

        const employee_id = result[0].employee_id;
        console.log("Employee ID:", employee_id);

        const query = `
          INSERT INTO goals (
            user_id, name, description, year, quarter, created_at, updated_at, employee_id
          ) 
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
        `;

        const values = [user_id, name, description, year, quarter, employee_id];

        con.query(query, values, (err, result) => {
          if (err) {
            console.error("Error adding goal:", err);
            return res.status(500).json({ message: "Error adding goals" });
          }

          const goal_id = result.insertId;
          console.log("Goal adde d successfully:", goal_id);

          res.status(201).json({
            message: "goal added successfully",
            goal_id: goal_id,
          });
        });
      }
    );
  });
};





// Add Objective
const addObjectives = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    const { goal, name, description } = req.body;

    console.log("addObjectives - Request body:", { goal, name, description, user_id });

    if (!goal || !name || !description) {
      return res.status(400).json({ message: "Goal ID, objective name, and description are required" });
    }

    // First, get the employee_id for this user
    con.query(
      "SELECT employee_id FROM users WHERE user_id = ?",
      [user_id],
      (err, userResult) => {
        if (err) {
          console.error("Database Error during user lookup:", err);
          return res.status(500).json({
            message: "Error finding employee_id for the user",
            error: err.message
          });
        }

        if (userResult.length === 0) {
          return res.status(400).json({ message: "User not found" });
        }

        const employee_id = userResult[0].employee_id;
        console.log("Employee ID:", employee_id);

        const query = `
          INSERT INTO objectives (user_id, goal_id, name, description, employee_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        con.query(query, [user_id, goal, name, description, employee_id], (err, result) => {
          if (err) {
            console.error("Database Error adding objective:", err);
            console.error("Error code:", err.code);
            console.error("Error message:", err.message);
            console.error("SQL State:", err.sqlState);

            if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
              return res.status(400).json({ message: "Invalid goal ID provided" });
            }
            if (err.code === 'ER_DUP_ENTRY') {
              return res.status(400).json({ message: "This objective already exists" });
            }
            return res.status(500).json({
              message: "Error adding objective",
              error: err.message,
              code: err.code
            });
          }

          console.log("Objective created successfully with ID:", result.insertId);
          res.status(201).json({
            message: "Objective created successfully",
            objective_id: result.insertId
          });
        });
      }
    );
  });
};





// Add specific objectives
const addSpecificObjectives = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    const { objective_id, specific_objective_name, view } = req.body;

    console.log("addSpecificObjectives - Request body:", { objective_id, specific_objective_name, view, user_id });

    if (!objective_id || !specific_objective_name || !view) {
      return res.status(400).json({
        message: "Objective ID, specific_objective_name, and view are required fields.",
      });
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
          deadline_quarter, priority, department_id, name, count, 
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
        1  // Default count
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

        console.log("Specific Objective created successfully with ID:", result.insertId);
        res.status(201).json({
          message: "Specific Objective created successfully.",
          specific_objective_id: result.insertId,
        });
      });
    });
  });
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
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    const user_id = decoded.user_id;
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
        'specific_objective_id', 'specific_objective_detailname', 'details', 'baseline', 'plan', 'measurement', 'year', 'month', 'day'
      ];
      const missingFields = requiredFields.filter(field => !item[field]);
      return missingFields.length ? `Missing required fields: ${missingFields.join(', ')}` : null;
    }).filter(error => error !== null);

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: "Validation failed.", errors: validationErrors });
    }

    const insertIds = [];

    // Process each specific objective sequentially to avoid connection issues
    for (const item of specific_objective) {
      // Query to get goal_id
      const getGoalIdQuery = `
                      SELECT o.goal_id FROM specific_objectives so 
                      JOIN objectives o ON so.objective_id = o.objective_id 
                      WHERE so.specific_objective_id = ?`;

      const goalResults = await query(getGoalIdQuery, [item.specific_objective_id]);

      if (goalResults.length === 0) {
        throw new Error(`No goal found for specific objective: ${item.specific_objective_id}`);
      }
      const goal_id = goalResults[0].goal_id;

      // Insert specific objective details
      const insertQuery = `
                          INSERT INTO specific_objective_details (
                              user_id, goal_id, specific_objective_id, specific_objective_detailname, details,
                              baseline, plan, measurement, created_by, year, month, day, deadline, status, priority,
                              plan_type, cost_type, income_exchange, employment_type, incomeName, costName,
                              CIbaseline, CIplan, department_id, name, description, count,
                              project_type, income_plan_type, employee_of
                          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
        item.employee_of || null
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

    res.status(201).json({ message: "Specific objective details added successfully.", insertIds });

  } catch (error) {
    console.error("Error in addspecificObjectiveDetails:", error);
    res.status(500).json({ message: "Error processing specific objective details.", error: error.message });
  }
};







// Update Goal
const updateGoal = (req, res) => {
  const { goal_id } = req.params;
  const { name, description, year, quarter } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

    const query = `
      UPDATE goals 
      SET name = ?, description = ?, year = ?, quarter = ?, updated_at = CURRENT_TIMESTAMP
      WHERE goal_id = ? AND user_id = ?
    `;

    con.query(query, [name, description, year, quarter, goal_id, user_id], (err, result) => {
      if (err) {
        console.error("Error updating goal:", err);
        return res.status(500).json({ message: "Error updating goal" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Goal not found or unauthorized" });
      }

      res.status(200).json({ message: "Goal updated successfully" });
    });
  });
};

// Delete Goal
const deleteGoal = (req, res) => {
  const { goal_id } = req.params;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

    const query = "DELETE FROM goals WHERE goal_id = ? AND user_id = ?";

    con.query(query, [goal_id, user_id], (err, result) => {
      if (err) {
        console.error("Error deleting goal:", err);
        return res.status(500).json({ message: "Error deleting goal" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Goal not found or unauthorized" });
      }

      res.status(200).json({ message: "Goal deleted successfully" });
    });
  });
};

// Update Objective
const updateObjective = (req, res) => {
  const { objective_id } = req.params;
  const { name, description, goal_id } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

    const query = `
      UPDATE objectives 
      SET name = ?, description = ?, goal_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE objective_id = ? AND user_id = ?
    `;

    con.query(query, [name, description, goal_id, objective_id, user_id], (err, result) => {
      if (err) {
        console.error("Error updating objective:", err);
        return res.status(500).json({ message: "Error updating objective" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Objective not found or unauthorized" });
      }

      res.status(200).json({ message: "Objective updated successfully" });
    });
  });
};

// Delete Objective
const deleteObjective = (req, res) => {
  const { objective_id } = req.params;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

    const query = "DELETE FROM objectives WHERE objective_id = ? AND user_id = ?";

    con.query(query, [objective_id, user_id], (err, result) => {
      if (err) {
        console.error("Error deleting objective:", err);
        return res.status(500).json({ message: "Error deleting objective" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Objective not found or unauthorized" });
      }

      res.status(200).json({ message: "Objective deleted successfully" });
    });
  });
};

// Update Specific Objective
const updateSpecificObjective = (req, res) => {
  const { specific_objective_id } = req.params;
  const { specific_objective_name, view, objective_id } = req.body;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

    const query = `
      UPDATE specific_objectives 
      SET specific_objective_name = ?, view = ?, objective_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE specific_objective_id = ? AND user_id = ?
    `;

    con.query(query, [specific_objective_name, view, objective_id, specific_objective_id, user_id], (err, result) => {
      if (err) {
        console.error("Error updating specific objective:", err);
        return res.status(500).json({ message: "Error updating specific objective" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Specific objective not found or unauthorized" });
      }

      res.status(200).json({ message: "Specific objective updated successfully" });
    });
  });
};

// Delete Specific Objective
const deleteSpecificObjective = (req, res) => {
  const { specific_objective_id } = req.params;
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

    const query = "DELETE FROM specific_objectives WHERE specific_objective_id = ? AND user_id = ?";

    con.query(query, [specific_objective_id, user_id], (err, result) => {
      if (err) {
        console.error("Error deleting specific objective:", err);
        return res.status(500).json({ message: "Error deleting specific objective" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Specific objective not found or unauthorized" });
      }

      res.status(200).json({ message: "Specific objective deleted successfully" });
    });
  });
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
  deleteSpecificObjective
};




















