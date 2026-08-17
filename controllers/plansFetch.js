const con = require("../models/db");

// Get all plans from user_id
// Helper function for foreign key validation
const validateForeignKeys = (goal_id, objective_id, specific_objective_id, specific_objective_detail_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM goals WHERE goal_id = ?) AS goal_exists,
        (SELECT COUNT(*) FROM objectives WHERE objective_id = ?) AS objective_exists,
        (SELECT COUNT(*) FROM specific_objectives WHERE specific_objective_id = ?) AS specific_objective_exists,
        (SELECT COUNT(*) FROM specific_objective_details WHERE specific_objective_detail_id = ?) AS specific_objective_detail_exists
    `;
    con.query(query, [goal_id, objective_id, specific_objective_id, specific_objective_detail_id], (err, results) => {
      if (err) {
        reject("Error validating foreign keys");
      }
      resolve(results[0]);
    });
  });
};

// addPlan function with improvements
const addPlan = (req, res) => {
  const { goal_id, objective_id, specific_objective_id, specific_objective_detail_id } = req.body;
  if (!goal_id || !objective_id || !specific_objective_id || !specific_objective_detail_id) {
    return res.status(400).json({ message: "Missing required fields: goal_id, objective_id, specific_objective_id, or specific_objective_detail_id" });
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

    try {
      const { goal_exists, objective_exists, specific_objective_exists, specific_objective_detail_exists } = await validateForeignKeys(goal_id, objective_id, specific_objective_id, specific_objective_detail_id);

      if (!goal_exists || !objective_exists || !specific_objective_exists || !specific_objective_detail_exists) {
        return res.status(400).json({
          message: "Invalid foreign key references. Ensure all referenced data exists.",
          details: {
            goal_id: !!goal_exists,
            objective_id: !!objective_exists,
            specific_objective_id: !!specific_objective_exists,
            specific_objective_detail_id: !!specific_objective_detail_exists,
          },
        });
      }

      const userResult = await new Promise((resolve, reject) => {
        con.query("SELECT employee_id FROM users WHERE user_id = ?", [user_id], (err, userResult) => {
          if (err) reject("Error retrieving employee ID");
          if (userResult.length === 0) reject("User not found");
          resolve(userResult);
        });
      });

      const employee_id = userResult[0].employee_id;

      const employeeResult = await new Promise((resolve, reject) => {
        con.query("SELECT supervisor_id, department_id FROM employees WHERE employee_id = ?", [employee_id], (err, employeeResult) => {
          if (err) reject("Error retrieving employee details");
          if (employeeResult.length === 0) reject("Employee details not found");
          resolve(employeeResult);
        });
      });

      const { supervisor_id, department_id } = employeeResult[0];

      // Transaction for plan and approval workflow insertion
      await new Promise((resolve, reject) => {
        con.beginTransaction((err) => {
          if (err) reject("Error starting transaction");

          const insertPlanQuery = `
            INSERT INTO plans (
              user_id, department_id, supervisor_id, employee_id, goal_id, objective_id, specific_objective_id, specific_objective_detail_id, 
              status, created_at, updated_at
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `;
          con.query(insertPlanQuery, [user_id, department_id, supervisor_id, employee_id, goal_id, objective_id, specific_objective_id, specific_objective_detail_id], (err, result) => {
            if (err) return con.rollback(() => reject("Error adding plan"));

            const plan_id = result.insertId;

            const approvalQuery = `
              INSERT INTO approvalworkflow (plan_id, approver_id, status, approval_date, approved_at, comment_writer) 
              VALUES (?, ?, 'Pending', NOW(), NULL, '')
            `;
            con.query(approvalQuery, [plan_id, supervisor_id], (err, result) => {
              if (err) return con.rollback(() => reject("Error adding approval workflow"));

              con.commit((err) => {
                if (err) return con.rollback(() => reject("Error committing transaction"));
                resolve();
              });
            });
          });
        });
      });

      res.status(201).json({ message: "Plan and associated entries created successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `Error: ${error}` });
    }
  });
};

// getAllPlans function with dynamic query updates

// getAllPlans function with dynamic query updates

const getAllPlans = async (req, res) => {
  try {
    console.log("📋 getAllPlans called - Request received");
    const current_user_id = req.user_id;
    const target_userId = req.query.userId || current_user_id;
    
    console.log("👤 Current User ID:", current_user_id);
    console.log("🎯 Target User ID:", target_userId);

    const {
      year,
      quarter,
      department,
      objective_id,
      goal_id,
      specific_objective_id,
      specific_objective_detail_id,
      plan_type,
      page = 1,
      limit = 10,
    } = req.query;

    console.log("🔍 Query parameters:", req.query);

    let filterConditions = [`(
      p.user_id = ? 
      OR sod.user_id = ? 
      OR sod.created_by = ? 
      OR sod.specific_objective_detail_id IN (
        SELECT specific_objective_detail_id FROM plan_breakdown_supervisors WHERE supervisor_user_id = ?
      )
      OR sod.specific_objective_detail_id IN (
        SELECT mt.specific_objective_detail_id 
        FROM monthly_tasks mt 
        JOIN monthly_task_assignees mta ON mt.monthly_task_id = mta.monthly_task_id 
        WHERE mta.user_id = ?
      )
      OR sod.specific_objective_detail_id IN (
        SELECT mt.specific_objective_detail_id 
        FROM weekly_tasks wt 
        JOIN weekly_task_assignees wta ON wt.weekly_task_id = wta.weekly_task_id 
        JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id 
        WHERE wta.user_id = ?
      )
    )`];
    let filterValues = [target_userId, target_userId, target_userId, target_userId, target_userId, target_userId];

    // Dynamically add filters based on query parameters
    if (year) {
      filterConditions.push("g.year = ?");
      filterValues.push(year);
    }

    if (quarter) {
      filterConditions.push("g.quarter = ?");
      filterValues.push(quarter);
    }

    if (department) {
      // Use recursive CTE for department filtering (cascading)
      filterConditions.push(`p.department_id IN (
        SELECT id FROM (
          WITH RECURSIVE children AS (
            SELECT id FROM organization_structure WHERE id = ?
            UNION ALL
            SELECT os.id FROM organization_structure os
            INNER JOIN children c ON os.parent_id = c.id
          )
          SELECT id FROM children
        ) temp
      )`);
      filterValues.push(department);
    }

    if (objective_id) {
      filterConditions.push("p.objective_id = ?");
      filterValues.push(objective_id);
    }

    if (goal_id) {
      filterConditions.push("p.goal_id = ?");
      filterValues.push(goal_id);
    }

    if (specific_objective_id) {
      filterConditions.push("p.specific_objective_id = ?");
      filterValues.push(specific_objective_id);
    }

    if (specific_objective_detail_id) {
      filterConditions.push("p.specific_objective_detail_id = ?");
      filterValues.push(specific_objective_detail_id);
    }

    if (plan_type) {
      filterConditions.push("sod.plan_type = ?");
      filterValues.push(plan_type);
    }

    // For user's own plans, show both active and deactivate (pending approval) plans
    // This allows users to see their submitted plans regardless of approval status
    filterConditions.push("(p.reporting = ? OR p.reporting = ?)");
    filterValues.push("active", "deactivate");

    const whereClause = filterConditions.length ? `WHERE ${filterConditions.join(" AND ")}` : "";

    const offset = (page - 1) * limit;

    // First, get the total count of plans
    const countQuery = `
      SELECT COUNT(DISTINCT p.plan_id) AS total
      FROM plans p
      LEFT JOIN organization_structure os ON p.department_id = os.id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      ${whereClause}
    `;

    con.query(countQuery, filterValues, (countErr, countResults) => {
      if (countErr) {
        console.error("❌ Database error counting plans:", countErr);
        return res.status(500).json({ success: false, message: "Error counting plans", error: countErr.message });
      }

      const totalPlansCount = countResults[0]?.total || 0;

      const getPlansQuery = `
          SELECT 
            p.plan_id AS Plan_ID,
            p.user_id AS User_ID,
            g.goal_id AS SpecificObjectiveDetail_ID,
            g.name AS Goal,
            g.year AS Year,
            g.quarter AS Quarter,
            o.objective_id AS Objective_ID,
            o.name AS Objective,
            so.specific_objective_id AS Specific_Objective_ID,
            so.specific_objective_name AS SpecificObjective,
            sod.specific_objective_detail_id AS Specific_Objective_Detail_ID,
            sod.details AS Specific_Objective_Detail,
            sod.name AS Detail_Name,
            sod.description AS Detail_Description,
            sod.baseline AS Baseline,
            sod.plan AS Plan_Weight,
            sod.plan_type AS Plan_Type,
            sod.measurement AS Measurement,
            COALESCE(sod.CIexecution_percentage, sod.execution_percentage) AS Execution_Percentage,
            sod.deadline AS Deadline,
            sod.priority AS Priority,
            sod.status AS Detail_Status,
            sod.created_at AS Detail_Created_At,
            COALESCE(aw.status, p.status) AS Status,
            p.created_at AS Created_At,
            p.updated_at AS Updated_At,
            COALESCE(os.name_amharic, os.name) AS Department,
            COALESCE(os.name_amharic, os.name) AS department_name,
            COALESCE(os.name_amharic, os.name) AS org_node_name,
            os.type AS org_node_type,
            aw.comment AS Comment
          FROM plans p
          JOIN users u ON p.user_id = u.user_id
          LEFT JOIN employees e ON u.employee_id = e.employee_id
          LEFT JOIN employee_positions ep2 ON e.employee_id = ep2.employee_id AND ep2.is_primary = 1
          LEFT JOIN organization_structure os ON COALESCE(p.department_id, ep2.org_node_id, e.department_id) = os.id
          LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
          LEFT JOIN goals g ON p.goal_id = g.goal_id
          LEFT JOIN objectives o ON p.objective_id = o.objective_id
          LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
          LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
          ${whereClause}
          GROUP BY p.plan_id
          ORDER BY p.created_at DESC
          LIMIT ? OFFSET ?
        `;

      filterValues.push(parseInt(limit), parseInt(offset));

      console.log("🔍 Final SQL Query:", getPlansQuery);
      console.log("📊 Filter Values:", filterValues);

      con.query(getPlansQuery, filterValues, (err, results) => {
        if (err) {
          console.error("❌ Database error fetching plans:", err);
          return res.status(500).json({ success: false, message: "Error fetching plans", error: err.message });
        }

        console.log("✅ Query executed successfully");
        console.log("📈 Results count:", results.length);

        res.status(200).json({
          success: true,
          plans: results || [],
          total: totalPlansCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalPlansCount / limit),
          limit: parseInt(limit)
        });
      });
    });
  } catch (error) {
    console.error("Error in getAllPlans:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
const getAllOrgP_lans = async (req, res) => {
  try {
    console.log("📋 getAllOrgP_lans called - Fetching organization plans with hierarchy");

    const user_id = req.user_id;

    // 1. Get current user's employee ID
    const getEmployeeIdPromise = () => {
      return new Promise((resolve, reject) => {
        con.query("SELECT employee_id FROM users WHERE user_id = ?", [user_id], (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0 ? results[0].employee_id : null);
        });
      });
    };

    const employee_id = await getEmployeeIdPromise();
    let allowedEmployeeIds = [];

    // 2. Get all subordinates (hierarchy) if user is an employee
    if (employee_id) {
      const getHierarchyPromise = () => {
        return new Promise((resolve, reject) => {
          con.query("SELECT employee_id, supervisor_id FROM employees", (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          });
        });
      };

      const allEmployees = await getHierarchyPromise();

      // Build set of allowed IDs (self + subordinates)
      const subordinates = new Set([employee_id]);
      const queue = [employee_id];

      while (queue.length > 0) {
        const currentId = queue.shift();
        const directReports = allEmployees.filter(e => e.supervisor_id === currentId);

        directReports.forEach(report => {
          if (!subordinates.has(report.employee_id)) {
            subordinates.add(report.employee_id);
            queue.push(report.employee_id);
          }
        });
      }
      allowedEmployeeIds = Array.from(subordinates);
    }

    const {
      year,
      quarter,
      department,
      objective_id,
      goal_id,
      specific_objective_id,
      specific_objective_detail_id,
      plan_type,
      page = 1,
      limit = 10,
    } = req.query;

    console.log("🔍 Query parameters:", req.query);

    // Initialize filter conditions and values arrays
    const filterConditions = [];
    const filterValues = [];

    // Apply hierarchy filter
    if (allowedEmployeeIds.length > 0) {
      filterConditions.push(`p.employee_id IN (${allowedEmployeeIds.join(',')})`);
    } else {
      // Fallback: if no employee record, only show own plans
      filterConditions.push("p.user_id = ?");
      filterValues.push(user_id);
    }

    // Dynamically add filters based on query parameters
    if (year) {
      filterConditions.push("g.year = ?");
      filterValues.push(year);
    }

    if (quarter) {
      filterConditions.push("g.quarter = ?");
      filterValues.push(quarter);
    }

    if (department) {
      // Use recursive CTE for department filtering (cascading)
      filterConditions.push(`p.department_id IN (
        SELECT id FROM (
          WITH RECURSIVE children AS (
            SELECT id FROM organization_structure WHERE id = ?
            UNION ALL
            SELECT os.id FROM organization_structure os
            INNER JOIN children c ON os.parent_id = c.id
          )
          SELECT id FROM children
        ) temp
      )`);
      filterValues.push(department);
    }

    if (objective_id) {
      filterConditions.push("p.objective_id = ?");
      filterValues.push(objective_id);
    }

    if (goal_id) {
      filterConditions.push("p.goal_id = ?");
      filterValues.push(goal_id);
    }

    if (specific_objective_id) {
      filterConditions.push("p.specific_objective_id = ?");
      filterValues.push(specific_objective_id);
    }

    if (specific_objective_detail_id) {
      filterConditions.push("p.specific_objective_detail_id = ?");
      filterValues.push(specific_objective_detail_id);
    }

    if (plan_type) {
      filterConditions.push("sod.plan_type = ?");
      filterValues.push(plan_type);
    }

    // Fetch ALL plans regardless of user - no user ID filtering
    // Include both active and deactivate plans for comprehensive view
    filterConditions.push("(p.reporting = ? OR p.reporting = ?)");
    filterValues.push("active", "deactivate");

    const whereClause = filterConditions.length ? `WHERE ${filterConditions.join(" AND ")}` : "";

    const offset = (page - 1) * limit;

    const getPlansQuery = `
        SELECT 
          p.plan_id AS Plan_ID,
          p.user_id AS User_ID,
          g.goal_id AS SpecificObjectiveDetail_ID,
          g.name AS Goal,
          g.year AS Year,
          g.quarter AS Quarter,
          o.objective_id AS Objective_ID,
          o.name AS Objective,
          so.specific_objective_id AS Specific_Objective_ID,
          so.specific_objective_name AS SpecificObjective,
          sod.specific_objective_detail_id AS Specific_Objective_Detail_ID,
          sod.details AS Specific_Objective_Detail,
          COALESCE(sod.CIexecution_percentage, sod.execution_percentage) AS Execution_Percentage,
          sod.deadline AS Deadline,
          COALESCE(aw.status, p.status) AS Status,
          p.created_at AS Created_At,
          p.updated_at AS Updated_At,
          COALESCE(os.name_amharic, os.name) AS Department,
          COALESCE(os.name_amharic, os.name) AS department_name,
          COALESCE(os.name_amharic, os.name) AS org_node_name,
          os.type AS org_node_type,
          aw.comment AS Comment,
          p.user_id AS Created_By
        FROM plans p
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN employee_positions ep2 ON e.employee_id = ep2.employee_id AND ep2.is_primary = 1
        LEFT JOIN organization_structure os ON COALESCE(p.department_id, ep2.org_node_id, e.department_id) = os.id
        LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        LEFT JOIN goals g ON p.goal_id = g.goal_id
        LEFT JOIN objectives o ON p.objective_id = o.objective_id
        LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
        LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
        ${whereClause}
        GROUP BY p.plan_id
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;

    filterValues.push(parseInt(limit), parseInt(offset));

    console.log("🔍 Final SQL Query:", getPlansQuery);
    console.log("📊 Filter Values:", filterValues);

    con.query(getPlansQuery, filterValues, (err, results) => {
      if (err) {
        console.error("❌ Database error fetching organization plans:", err);
        return res.status(500).json({ success: false, message: "Error fetching organization plans", error: err.message });
      }

      console.log("✅ Query executed successfully");
      console.log("📈 Results count:", results.length);

      // Return all organization plans without user filtering
      res.status(200).json({
        success: true,
        plans: results || [],
        total: results.length,
        page: parseInt(page),
        limit: parseInt(limit),
        message: "All organization plans fetched successfully"
      });
    });
  } catch (error) {
    console.error("Error in getAllOrgP_lans:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



const getAllPlansDeclined = async (req, res) => {
  try {
    const user_id = req.user_id; // Access the user_id added by verifyToken
    const {
      year,
      quarter,
      department,
      objective_id,
      goal_id,
      specific_objective_id,
      specific_objective_detail_id,
      plan_type,
      page = 1,
      limit = 10,
    } = req.query;

    // Filter conditions to include only plans with a declined status
    let filterConditions = ["aw.status = 'declined'", "p.user_id = ?"];
    let filterValues = [user_id];

    // Dynamically add filters based on query parameters
    if (year) {
      filterConditions.push("g.year = ?");
      filterValues.push(year);
    }

    if (quarter) {
      filterConditions.push("g.quarter = ?");
      filterValues.push(quarter);
    }

    if (department) {
      // Use recursive CTE for department filtering (cascading)
      filterConditions.push(`p.department_id IN (
        SELECT id FROM (
          WITH RECURSIVE children AS (
            SELECT id FROM organization_structure WHERE id = ?
            UNION ALL
            SELECT os.id FROM organization_structure os
            INNER JOIN children c ON os.parent_id = c.id
          )
          SELECT id FROM children
        ) temp
      )`);
      filterValues.push(department);
    }

    if (objective_id) {
      filterConditions.push("p.objective_id = ?");
      filterValues.push(objective_id);
    }

    if (goal_id) {
      filterConditions.push("p.goal_id = ?");
      filterValues.push(goal_id);
    }

    if (specific_objective_id) {
      filterConditions.push("p.specific_objective_id = ?");
      filterValues.push(specific_objective_id);
    }

    if (specific_objective_detail_id) {
      filterConditions.push("p.specific_objective_detail_id = ?");
      filterValues.push(specific_objective_detail_id);
    }

    if (plan_type) {
      filterConditions.push("sod.plan_type = ?");
      filterValues.push(plan_type);
    }

    // Build the WHERE clause dynamically
    const whereClause = filterConditions.length ? `WHERE ${filterConditions.join(" AND ")}` : "";

    // Pagination
    const offset = (page - 1) * limit;

    // SQL Query to fetch declined plans
    const getPlansQuery = `
      SELECT 
        p.plan_id AS Plan_ID,
        p.user_id AS User_ID,
        g.goal_id AS SpecificObjectiveDetail_ID,
        g.name AS Goal,
        g.year AS Year,
        g.quarter AS Quarter,
        o.objective_id AS Objective_ID,
        o.name AS Objective,
        so.specific_objective_id AS Specific_Objective_ID,
        so.specific_objective_name AS SpecificObjective,
        sod.specific_objective_detail_id AS Specific_Objective_Detail_ID,
        sod.details AS Specific_Objective_Detail,
        COALESCE(sod.CIexecution_percentage, sod.execution_percentage) AS Execution_Percentage,
        aw.status AS Status,
        p.created_at AS Created_At,
        p.updated_at AS Updated_At,
        COALESCE(os.name_amharic, os.name) AS Department,
        COALESCE(os.name_amharic, os.name) AS department_name,
        COALESCE(os.name_amharic, os.name) AS org_node_name,
        aw.comment AS Comment
      FROM plans p
      LEFT JOIN organization_structure os ON p.department_id = os.id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    // Add pagination values to the filter array
    filterValues.push(parseInt(limit), parseInt(offset));

    // Execute the query
    con.query(getPlansQuery, filterValues, (err, results) => {
      if (err) {
        console.error("Error fetching declined plans:", err);
        return res.status(500).json({ success: false, message: "Error fetching declined plans", error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "No declined plans found for the specified user" });
      }

      // Return results
      res.status(200).json({ success: true, plans: results });
    });
  } catch (error) {
    console.error("Error in getAllPlansDeclined:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};





// Get all approved plans
const getAllOrgPlans = async (req, res) => {
  try {
    const {
      year,
      quarter,
      department,
      objective_id,
      goal_id,
      specific_objective_id,
      specific_objective_detail_id,
      plan_type,
      page = 1,
      limit = 10,
    } = req.query;

    // Array to store dynamic filter conditions and values
    let filterConditions = ["p.status = 'approved'"]; // Ensures only approved plans are fetched
    let filterValues = [];

    // Dynamically add filters based on query parameters
    if (year) {
      filterConditions.push("g.year = ?");
      filterValues.push(year);
    }

    if (quarter) {
      filterConditions.push("g.quarter = ?");
      filterValues.push(quarter);
    }

    if (department) {
      // Use recursive CTE for department filtering (cascading)
      filterConditions.push(`p.department_id IN (
        SELECT id FROM (
          WITH RECURSIVE children AS (
            SELECT id FROM organization_structure WHERE id = ?
            UNION ALL
            SELECT os.id FROM organization_structure os
            INNER JOIN children c ON os.parent_id = c.id
          )
          SELECT id FROM children
        ) temp
      )`);
      filterValues.push(department);
    }

    if (objective_id) {
      filterConditions.push("p.objective_id = ?");
      filterValues.push(objective_id);
    }

    if (goal_id) {
      filterConditions.push("p.goal_id = ?");
      filterValues.push(goal_id);
    }

    if (specific_objective_id) {
      filterConditions.push("p.specific_objective_id = ?");
      filterValues.push(specific_objective_id);
    }

    if (specific_objective_detail_id) {
      filterConditions.push("p.specific_objective_detail_id = ?");
      filterValues.push(specific_objective_detail_id);
    }

    if (plan_type) {
      filterConditions.push("sod.plan_type = ?");
      filterValues.push(plan_type);
    }

    // Build the WHERE clause dynamically
    const whereClause = filterConditions.length ? `WHERE ${filterConditions.join(" AND ")}` : "";

    // Calculate pagination values
    const offset = (page - 1) * limit;

    // SQL query to fetch approved plans with dynamic filters
    const getPlansQuery = `
      SELECT 
        p.plan_id AS Plan_ID,
        p.user_id AS User_ID,
        g.goal_id AS SpecificObjectiveDetail_ID,
        g.name AS Goal,
        g.year AS Year,
        g.quarter AS Quarter,
        o.objective_id AS Objective_ID,
        o.name AS Objective,
        so.specific_objective_id AS Specific_Objective_ID,
        so.specific_objective_name AS SpecificObjective,
        sod.specific_objective_detail_id AS Specific_Objective_Detail_ID,
        sod.details AS Specific_Objective_Detail,
        COALESCE(sod.CIexecution_percentage, sod.execution_percentage) AS Execution_Percentage,
        p.status AS Status,
        p.created_at AS Created_At,
        p.updated_at AS Updated_At,
        COALESCE(os.name_amharic, os.name) AS Department,
        COALESCE(os.name_amharic, os.name) AS department_name,
        COALESCE(os.name_amharic, os.name) AS org_node_name,
        aw.comment AS Comment
      FROM plans p
      LEFT JOIN organization_structure os ON p.department_id = os.id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    // Add pagination values to the filter array
    filterValues.push(parseInt(limit), parseInt(offset));

    // Execute the query
    con.query(getPlansQuery, filterValues, (err, results) => {
      if (err) {
        console.error("Error fetching plans:", err);
        return res.status(500).json({ success: false, message: "Error fetching plans", error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "No approved plans found" });
      }

      // Return results
      res.status(200).json({ success: true, plans: results });
    });
  } catch (error) {
    console.error("Error in getAllOrgPlans:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};









// Get all approved organization plans
const getApprovedOrgPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const getPlansQuery = `
      SELECT 
        p.plan_id AS Plan_ID,
        p.user_id AS User_ID,
        p.department_id AS Department_ID,
        p.objective AS Objective,
        p.goal AS SpecificObjectiveDetail,
        p.details AS Details,
        p.measurement AS Measurement,
        p.baseline AS Baseline,
        p.plan AS Plan,
        p.outcome AS Outcome,
        p.execution_percentage AS Execution_Percentage,
        p.description AS Description,
        p.status AS Status,
        p.comment AS Comment,
        p.created_at AS Created_At,
        p.updated_at AS Updated_At,
        p.year AS Year,
        p.quarter AS Quarter,
        p.created_by AS Created_By,
        p.Progress AS Progress,
        COALESCE(os.name_amharic, os.name) AS Department
      FROM plans p
      LEFT JOIN organization_structure os ON p.department_id = os.id
      WHERE p.status = 'approved'
      LIMIT ? OFFSET ?
    `;

    con.query(getPlansQuery, [parseInt(limit, 10), parseInt(offset, 10)], (err, results) => {
      if (err) {
        console.error("Error fetching approved plans:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching approved plans from the database.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No approved plans found.",
        });
      }

      res.status(200).json({
        success: true,
        plans: results,
      });
    });
  } catch (error) {
    console.error("Error in getApprovedOrgPlans:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
    });
  }
};




// Get plan detail (with Specifc Objective Detail, Objective, and SpecificObjectiveDetail details)

const getPlanDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const getPlanQuery = `
      SELECT 
        p.plan_id,
        p.user_id,
        sod.specific_objective_detail_id,
        sod.specific_objective_detailname,
        sod.details,
        sod.baseline,
        sod.plan,
        sod.measurement,
        sod.execution_percentage,
        sod.created_at,
        sod.updated_at,
        sod.year,
        sod.month,
        sod.day,
        sod.deadline,
        COALESCE(aw.status, p.status, sod.status) AS status,
        sod.priority,
        p.department_id,
        COALESCE(os.name_amharic, os.name) AS department_name,
        sod.count,
        sod.outcome,
        sod.progress,
        sod.created_by,
        sod.specific_objective_id,
        sod.plan_type,
        sod.income_exchange,
        sod.cost_type,
        sod.employment_type,
        sod.incomeName,
        sod.costName,
        sod.CIbaseline,
        sod.CIplan,
        sod.CIoutcome,
        sod.CIexecution_percentage,
        sod.editing_status,
        sod.reporting,
        p.goal_id,
        p.objective_id,
        o.name AS objective_name,
        g.name AS goal_name,
        so.specific_objective_name,
        aw.comment AS approval_comment,
        aw.approved_at AS approval_date
      FROM plans p
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN organization_structure os ON p.department_id = os.id
      JOIN objectives o ON p.objective_id = o.objective_id
      JOIN goals g ON p.goal_id = g.goal_id
      JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE p.plan_id = ?;
    `;

    // Execute query with provided id
    con.query(getPlanQuery, [id], (err, results) => {
      if (err) {
        console.error("Error fetching plan details:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching plan details from the database.",
          error: err.message,
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan not found.",
        });
      }

      // Retrieve plan details and filter out keys with null values
      // BUT preserve 0 values for numeric fields
      const plan = results[0];
      const filteredPlan = {};
      Object.keys(plan).forEach(key => {
        if (plan[key] !== null && plan[key] !== undefined) {
          filteredPlan[key] = plan[key];
        }
      });

      // Convert CI fields to floats if they are present (including 0 values)
      if (filteredPlan.CIbaseline !== undefined && filteredPlan.CIbaseline !== null) {
        filteredPlan.CIbaseline = parseFloat(filteredPlan.CIbaseline);
      }
      if (filteredPlan.CIplan !== undefined && filteredPlan.CIplan !== null) {
        filteredPlan.CIplan = parseFloat(filteredPlan.CIplan);
      }
      if (filteredPlan.CIoutcome !== undefined && filteredPlan.CIoutcome !== null) {
        filteredPlan.CIoutcome = parseFloat(filteredPlan.CIoutcome);
      }
      if (filteredPlan.CIexecution_percentage !== undefined && filteredPlan.CIexecution_percentage !== null) {
        filteredPlan.CIexecution_percentage = parseFloat(filteredPlan.CIexecution_percentage);
      }

      // Fetch both attachments and reports for this plan
      const getAttachmentsQuery = `
        SELECT 
          rf.id,
          rf.file_name,
          rf.file_path,
          rf.uploaded_at,
          'reportfile' as source,
          NULL as report_content,
          NULL as report_id
        FROM reportfile rf
        WHERE rf.specific_objective_id = ?
        
        UNION ALL
        
        SELECT 
          ra.attachment_id as id,
          ra.file_name,
          ra.file_path,
          ra.created_at as uploaded_at,
          'report_attachments' as source,
          r.report_content,
          r.report_id
        FROM report_attachments ra
        JOIN reports r ON ra.report_id = r.report_id
        WHERE r.plan_id = ?
        
        ORDER BY uploaded_at DESC
      `;

      // Also fetch reports without attachments
      const getReportsQuery = `
        SELECT 
          r.report_id,
          r.report_content,
          r.created_at,
          r.status as report_status
        FROM reports r
        WHERE r.plan_id = ?
        ORDER BY r.created_at DESC
      `;

      console.log(`🔍 Looking for attachments with specific_objective_id = ${filteredPlan.specific_objective_detail_id} and plan_id = ${id}`);

      // First fetch attachments
      con.query(getAttachmentsQuery, [filteredPlan.specific_objective_detail_id, id], (err, attachmentResults) => {
        if (err) {
          console.error("❌ Error fetching attachments:", err.message);
          filteredPlan.attachments = [];
        } else {
          filteredPlan.attachments = attachmentResults || [];
          console.log(`✅ Fetched ${filteredPlan.attachments.length} attachment(s) for plan ${id}`);
        }

        // Then fetch reports
        con.query(getReportsQuery, [id], (err, reportResults) => {
          if (err) {
            console.error("❌ Error fetching reports:", err.message);
            filteredPlan.reports = [];
          } else {
            filteredPlan.reports = reportResults || [];
            console.log(`✅ Fetched ${filteredPlan.reports.length} report(s) for plan ${id}`);

            if (filteredPlan.reports.length > 0) {
              console.log("📝 Reports:", filteredPlan.reports.map(r => ({
                id: r.report_id,
                content: r.report_content?.substring(0, 50) + '...',
                created: r.created_at,
                status: r.report_status
              })));
            }
          }

          res.status(200).json({
            success: true,
            plan: filteredPlan,
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in getPlanDetail:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
    });
  }
};






// Delete plan
const deletePlan = async (req, res) => {
  try {
    const user_id = req.user_id; // Get the user_id from the request, added by verifyToken middleware
    const { planId } = req.params; // Get the planId from the URL parameters

    // First check the status of the plan
    const checkStatusQuery = `
      SELECT status FROM plans WHERE plan_id = ? AND user_id = ?
    `;

    con.query(checkStatusQuery, [planId, user_id], (err, results) => {
      if (err) {
        console.error("Error checking plan status:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error checking plan details.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan not found or you don't have permission to delete it.",
          error_code: "PLAN_NOT_FOUND",
        });
      }

      const planStatus = results[0].status?.toLowerCase();

      // Only allow deletion if status is pending or declined
      if (planStatus !== 'pending' && planStatus !== 'declined') {
        return res.status(403).json({
          success: false,
          message: `Cannot delete plan because its status is '${planStatus}'. Only 'Pending' and 'Declined' plans can be deleted.`,
          error_code: "DELETION_FORBIDDEN",
        });
      }

      // SQL query to delete the plan only if it belongs to the current user
      const deleteQuery = `
        DELETE FROM plans
        WHERE plan_id = ? AND user_id = ?
      `;

      // Execute the delete query
      con.query(deleteQuery, [planId, user_id], (err, result) => {
        if (err) {
          console.error("Error deleting plan:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error deleting the plan.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }

        // If no rows are affected, it means the plan was not found or doesn't belong to the user
        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Plan not found or you don't have permission to delete it.",
            error_code: "PLAN_NOT_FOUND",
          });
        }

        // Successfully deleted the plan
        res.status(200).json({
          success: true,
          message: "Plan deleted successfully.",
        });
      }); // end inner con.query (deleteQuery)
    }); // end outer con.query (checkStatusQuery)
  } catch (error) {
    // Catch any unexpected errors
    console.error("Error in deletePlan:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};



// Get plan by ID with detailed information from Specifc Objective Details, Objectives, and SpecificObjectiveDetails tables
const getPlanById = async (req, res) => {
  try {
    const user_id = req.user_id; // Access the user_id added by verifyToken
    const { planId } = req.params; // Get the planId from route parameters

    const query = `
      SELECT 
        p.plan_id AS Plan_ID,
        p.user_id AS User_ID,
        p.department_id AS Department_ID,
        
        so.details AS Details,
        so.measurement AS Measurement,
        so.baseline AS Baseline,
        p.plan AS Plan,
        o.description AS Description,
        p.status AS Status,
        p.comment AS Comment,
        p.created_at AS Created_At,
        p.updated_at AS Updated_At,
        o.year AS Year,
        o.quarter AS Quarter,
        p.created_by AS Created_By,
        so.Plan AS Plan,
        COALESCE(os.name_amharic, os.name) AS Department,
        o.name AS Objective,
        g.name AS SpecificObjectiveDetail,
        so.name AS Specific_SpecificObjectiveDetail
      FROM plans p
      LEFT JOIN organization_structure os ON p.department_id = os.id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id 
      LEFT JOIN goals g ON p.goal_id = g.id
      LEFT JOIN specific_objective_details so ON p.specific_objective_detail_id = so.id
      WHERE p.user_id = ? AND p.plan_id = ?;
    `;

    con.query(query, [user_id, planId], (err, results) => {
      if (err) {
        console.error("Error fetching plan details:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching plan details from the database.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan not found.",
          error_code: "PLAN_NOT_FOUND",
        });
      }

      res.status(200).json({
        success: true,
        plan: results[0], // Return the first result since plan_id is unique
      });
    });
  } catch (error) {
    console.error("Error in getPlanById:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};




// Update plan
const updatePlan = async (req, res) => {
  try {
    console.log('🔥 UPDATE PLAN REQUEST RECEIVED');
    console.log('📦 Request params:', { planId: req.params.planId });
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User ID:', req.user_id);

    const user_id = req.user_id;
    const { planId } = req.params;
    const updates = req.body;

    // Validate year
    if (updates.year && isNaN(updates.year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format. Please provide a valid number.",
        error_code: "INVALID_YEAR_FORMAT",
      });
    }

    // Allowed fields
    const allowedUpdates = [
      "details",
      "measurement",
      "baseline",
      "plan",
      "description",
      "deadline",
      "quarter",
      "የ እቅዱ ሂደት",
      "specific_objective_detailname",
      "plan_type",
      "cost_type",
      "costName",
      "incomeName",
      "income_exchange",
      "CIplan",
      "CIbaseline",
      "employment_type",
      "year",
      "outcome",
      "execution_percentage",
      "CIoutcome",
      "CIexecution_percentage"
    ];

    // Filter valid fields
    const updateFields = Object.keys(updates).filter(field =>
      allowedUpdates.includes(field)
    );
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update.",
        error_code: "NO_VALID_FIELDS",
      });
    }

    // Force "plan" to "on progress" (never pending)
    if (updates.plan) {
      // Ensure plan is a string before calling toLowerCase
      const planValue = typeof updates.plan === 'string' ? updates.plan : String(updates.plan);
      if (planValue.toLowerCase() === "pending") {
        return res.status(400).json({
          success: false,
          message: "Plan cannot be set to pending.",
          error_code: "INVALID_PLAN_STATUS",
        });
      }
      updates.plan = "on progress";
    }

    // Step 1: Fetch plan with status and deadline
    const fetchPlanQuery = `
      SELECT p.specific_objective_detail_id, COALESCE(aw.status, p.status) as status, sod.deadline
      FROM plans p
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE p.plan_id = ? AND p.user_id = ?
    `;

    con.query(fetchPlanQuery, [planId, user_id], (err, planResults) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error while fetching the plan.", error_code: "DB_ERROR_PLAN_FETCH", error: err.message });
      }
      if (planResults.length === 0) {
        return res.status(404).json({ success: false, message: "Plan not found or unauthorized.", error_code: "PLAN_NOT_FOUND_OR_UNAUTHORIZED" });
      }
      
      const plan = planResults[0];
      const status = plan.status?.toLowerCase();
      const deadline = plan.deadline ? new Date(plan.deadline) : null;
      const now = new Date();

      // Enforce status restrictions: Pending and Declined plans cannot be updated
      if (['pending', 'declined'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Cannot update a plan that is ${status}.`,
          error_code: "FORBIDDEN_STATUS"
        });
      }

      // Enforce deadline restrictions: No updates after deadline passed
      if (deadline && now > deadline) {
        return res.status(403).json({
          success: false,
          message: "The deadline for this plan has passed. Updates are no longer allowed.",
          error_code: "DEADLINE_PASSED"
        });
      }

      const specific_objective_detail_id = plan.specific_objective_detail_id;

      // Step 2: Check specific objective detail and get current values
      const checkDetailQuery =
        `SELECT * FROM specific_objective_details WHERE specific_objective_detail_id = ? AND user_id = ?`;
      con.query(checkDetailQuery, [specific_objective_detail_id, user_id], (err, detailResults) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error checking specific objective detail.", error_code: "DB_ERROR_CHECK", error: err.message });
        }
        if (detailResults.length === 0) {
          return res.status(404).json({ success: false, message: "Specific objective detail not found or unauthorized.", error_code: "DETAIL_NOT_FOUND_OR_UNAUTHORIZED" });
        }

        const currentDetail = detailResults[0];

        // Check if execution percentage reaches 100% for automatic completion
        let shouldAutoComplete = false;
        if (updates.CIexecution_percentage && parseFloat(updates.CIexecution_percentage) >= 100) {
          shouldAutoComplete = true;
        }
        if (updates.execution_percentage && parseFloat(updates.execution_percentage) >= 100) {
          shouldAutoComplete = true;
        }

        // Step 3: Build dynamic update query
        const updateQuery =
          `UPDATE specific_objective_details SET ${updateFields.map(field => field + ' = ?').join(", ")} WHERE specific_objective_detail_id = ? AND user_id = ?`;
        const updateValues = [...updateFields.map(field => updates[field]), specific_objective_detail_id, user_id];

        con.query(updateQuery, updateValues, (err, result) => {
          if (err) {
            return res.status(500).json({ success: false, message: "Database error while updating.", error_code: "DB_ERROR_UPDATE", error: err.message });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "No updates applied.", error_code: "NO_UPDATES_APPLIED" });
          }

          // Step 4: Update approval workflow status based on completion
          let approvalStatus = 'in progress';
          if (shouldAutoComplete) {
            approvalStatus = 'completed';
          }

          const updateApprovalWorkflowQuery =
            `UPDATE approvalworkflow SET status = ? WHERE plan_id = ?`;
          con.query(updateApprovalWorkflowQuery, [approvalStatus, planId], (err) => {
            if (err) {
              return res.status(500).json({ success: false, message: "Database error while updating approval workflow.", error_code: "DB_ERROR_APPROVAL_UPDATE", error: err.message });
            }

            // Step 5: Fetch updated record
            const fetchUpdatedQuery =
              `SELECT * FROM specific_objective_details WHERE specific_objective_detail_id = ? AND user_id = ?`;
            con.query(fetchUpdatedQuery, [specific_objective_detail_id, user_id], (err, updatedResults) => {
              if (err) {
                return res.status(500).json({ success: false, message: "Error fetching updated detail.", error_code: "DB_ERROR_FETCH_UPDATED", error: err.message });
              }
              if (updatedResults.length === 0) {
                return res.status(404).json({ success: false, message: "Updated detail not found.", error_code: "UPDATED_DETAIL_NOT_FOUND" });
              }

              const responseMessage = shouldAutoComplete
                ? "Plan updated and automatically marked as completed due to 100% execution."
                : "Specific objective detail and approval workflow updated successfully.";

              return res.status(200).json({
                success: true,
                message: responseMessage,
                data: updatedResults[0],
                autoCompleted: shouldAutoComplete
              });
            });
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Unexpected error: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};








const updatePland = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { planId } = req.params;
    const updates = req.body;

    // Validate year
    if (updates.year && isNaN(updates.year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format. Please provide a valid number.",
        error_code: "INVALID_YEAR_FORMAT",
      });
    }

    // Allowed fields
    const allowedUpdates = [
      "details",
      "measurement",
      "baseline",
      "plan",
      "description",
      "deadline",
      "quarter",
      "የ እቅዱ ሂደት",
      "specific_objective_detailname",
      "plan_type",
      "cost_type",
      "costName",
      "incomeName",
      "income_exchange",
      "CIplan",
      "CIbaseline",
      "employment_type",
      "year",
      "outcome",
      "execution_percentage",
      "CIoutcome",
      "CIexecution_percentage"
    ];

    // Filter valid fields
    const updateFields = Object.keys(updates).filter(field =>
      allowedUpdates.includes(field)
    );
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update.",
        error_code: "NO_VALID_FIELDS",
      });
    }

    // Force "plan" to "on progress" (never pending)
    if (updates.plan) {
      // Ensure plan is a string before calling toLowerCase
      const planValue = typeof updates.plan === 'string' ? updates.plan : String(updates.plan);
      if (planValue.toLowerCase() === "pending") {
        return res.status(400).json({
          success: false,
          message: "Plan cannot be set to pending.",
          error_code: "INVALID_PLAN_STATUS",
        });
      }
      updates.plan = "on progress";
    }

    // Step 1: Fetch plan with status and deadline
    const fetchPlanQuery = `
      SELECT p.specific_objective_detail_id, COALESCE(aw.status, p.status) as status, sod.deadline
      FROM plans p
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE p.plan_id = ? AND p.user_id = ?
    `;

    con.query(fetchPlanQuery, [planId, user_id], (err, planResults) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Database error while fetching the plan.", error_code: "DB_ERROR_PLAN_FETCH", error: err.message });
      }
      if (planResults.length === 0) {
        return res.status(404).json({ success: false, message: "Plan not found or unauthorized.", error_code: "PLAN_NOT_FOUND_OR_UNAUTHORIZED" });
      }
      
      const plan = planResults[0];
      const status = plan.status?.toLowerCase();
      const deadline = plan.deadline ? new Date(plan.deadline) : null;
      const now = new Date();

      // Enforce status restrictions: Pending and Declined plans cannot be updated
      if (['pending', 'declined'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Cannot update a plan that is ${status}.`,
          error_code: "FORBIDDEN_STATUS"
        });
      }

      // Enforce deadline restrictions: No updates after deadline passed
      if (deadline && now > deadline) {
        return res.status(403).json({
          success: false,
          message: "The deadline for this plan has passed. Updates are no longer allowed.",
          error_code: "DEADLINE_PASSED"
        });
      }

      const specific_objective_detail_id = plan.specific_objective_detail_id;

      // Step 2: Check specific objective detail and get current values
      const checkDetailQuery =
        `SELECT * FROM specific_objective_details WHERE specific_objective_detail_id = ? AND user_id = ?`;
      con.query(checkDetailQuery, [specific_objective_detail_id, user_id], (err, detailResults) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Error checking specific objective detail.", error_code: "DB_ERROR_CHECK", error: err.message });
        }
        if (detailResults.length === 0) {
          return res.status(404).json({ success: false, message: "Specific objective detail not found or unauthorized.", error_code: "DETAIL_NOT_FOUND_OR_UNAUTHORIZED" });
        }

        const currentDetail = detailResults[0];

        // Check if execution percentage reaches 100% for automatic completion
        let shouldAutoComplete = false;
        if (updates.execution_percentage && parseFloat(updates.execution_percentage) >= 100) {
          shouldAutoComplete = true;
        }

        // Step 3: Build dynamic update query
        const updateQuery =
          `UPDATE specific_objective_details SET ${updateFields.map(field => field + ' = ?').join(", ")} WHERE specific_objective_detail_id = ? AND user_id = ?`;
        const updateValues = [...updateFields.map(field => updates[field]), specific_objective_detail_id, user_id];

        con.query(updateQuery, updateValues, (err, result) => {
          if (err) {
            return res.status(500).json({ success: false, message: "Database error while updating.", error_code: "DB_ERROR_UPDATE", error: err.message });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "No updates applied.", error_code: "NO_UPDATES_APPLIED" });
          }

          // Step 4: Update approval workflow status based on completion
          let approvalStatus = 'in progress';
          if (shouldAutoComplete) {
            approvalStatus = 'completed';
          }

          const updateApprovalWorkflowQuery =
            `UPDATE approvalworkflow SET status = ? WHERE plan_id = ?`;
          con.query(updateApprovalWorkflowQuery, [approvalStatus, planId], (err) => {
            if (err) {
              return res.status(500).json({ success: false, message: "Database error while updating approval workflow.", error_code: "DB_ERROR_APPROVAL_UPDATE", error: err.message });
            }

            // Step 5: Fetch updated record
            const fetchUpdatedQuery =
              `SELECT * FROM specific_objective_details WHERE specific_objective_detail_id = ? AND user_id = ?`;
            con.query(fetchUpdatedQuery, [specific_objective_detail_id, user_id], (err, updatedResults) => {
              if (err) {
                return res.status(500).json({ success: false, message: "Error fetching updated detail.", error_code: "DB_ERROR_FETCH_UPDATED", error: err.message });
              }
              if (updatedResults.length === 0) {
                return res.status(404).json({ success: false, message: "Updated detail not found.", error_code: "UPDATED_DETAIL_NOT_FOUND" });
              }

              const responseMessage = shouldAutoComplete
                ? "Plan updated and automatically marked as completed due to 100% execution."
                : "Specific objective detail and approval workflow updated successfully.";

              return res.status(200).json({
                success: true,
                message: responseMessage,
                data: updatedResults[0],
                autoCompleted: shouldAutoComplete
              });
            });
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Unexpected error: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};
// Manual completion function
const markPlanAsCompleted = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { planId } = req.params;

    // Step 1: Verify plan ownership and current status
    const fetchPlanQuery = `
      SELECT p.plan_id, p.specific_objective_detail_id, aw.status 
      FROM plans p
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      WHERE p.plan_id = ? AND p.user_id = ?
    `;

    con.query(fetchPlanQuery, [planId, user_id], (err, planResults) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error while fetching the plan.",
          error_code: "DB_ERROR_PLAN_FETCH",
          error: err.message
        });
      }

      if (planResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan not found or unauthorized.",
          error_code: "PLAN_NOT_FOUND_OR_UNAUTHORIZED"
        });
      }

      const currentStatus = planResults[0].status;

      // Check if plan is already completed
      if (currentStatus === 'completed') {
        return res.status(400).json({
          success: false,
          message: "Plan is already marked as completed.",
          error_code: "PLAN_ALREADY_COMPLETED"
        });
      }

      // Check if plan is in a valid state for completion (not pending or declined)
      if (['pending', 'declined'].includes(currentStatus?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Cannot complete a plan that is pending approval or declined.",
          error_code: "INVALID_PLAN_STATUS_FOR_COMPLETION"
        });
      }

      // Check if deadline has passed
      const deadline = planResults[0].deadline ? new Date(planResults[0].deadline) : null;
      if (deadline && new Date() > deadline) {
        return res.status(400).json({
          success: false,
          message: "Cannot manually complete a plan after its deadline has passed. It will be handled by the automatic completion system.",
          error_code: "DEADLINE_PASSED_FOR_COMPLETION"
        });
      }

      // Step 2: Update approval workflow to completed
      const updateApprovalWorkflowQuery = `
        UPDATE approvalworkflow 
        SET status = 'completed', approved_at = CURRENT_TIMESTAMP
        WHERE plan_id = ?
      `;

      con.query(updateApprovalWorkflowQuery, [planId], (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Database error while updating approval workflow.",
            error_code: "DB_ERROR_APPROVAL_UPDATE",
            error: err.message
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "No approval workflow found for this plan.",
            error_code: "APPROVAL_WORKFLOW_NOT_FOUND"
          });
        }

        // Step 3: Update plan status in plans table if needed
        const updatePlanStatusQuery = `
          UPDATE plans 
          SET status = 'completed', updated_at = CURRENT_TIMESTAMP
          WHERE plan_id = ? AND user_id = ?
        `;

        con.query(updatePlanStatusQuery, [planId, user_id], (err) => {
          if (err) {
            return res.status(500).json({
              success: true,
              message: "Good",
              error_code: "Marked",
              error: err.message
            });
          }

          return res.status(200).json({
            success: true,
            message: "Plan has been manually marked as completed successfully.",
            planId: planId,
            completedAt: new Date().toISOString()
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Unexpected error: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};



const addReport = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { planId } = req.params;
    const updates = req.body;

    const allowedUpdates = [
      "outcome",
      "execution_percentage",
      "CIoutcome",
      "CIexecution_percentage"
    ];

    const updateFields = Object.keys(updates).filter(field => allowedUpdates.includes(field));

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update.",
        error_code: "NO_VALID_FIELDS"
      });
    }

    const fetchSpecificObjectiveDetailIDQuery = `
      SELECT p.specific_objective_detail_id, COALESCE(aw.status, p.status) as status, sod.deadline
      FROM plans p
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE p.plan_id = ? AND p.user_id = ?
    `;

    con.query(fetchSpecificObjectiveDetailIDQuery, [planId, user_id], (err, planResults) => {
      if (err || planResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan not found or unauthorized access.",
          error_code: "PLAN_NOT_FOUND_OR_UNAUTHORIZED"
        });
      }

      const plan = planResults[0];
      const status = plan.status?.toLowerCase();
      const deadline = plan.deadline ? new Date(plan.deadline) : null;
      const now = new Date();

      // Enforce status restrictions: Pending and Declined plans cannot be updated
      if (['pending', 'declined'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: `Cannot update progress for a plan that is ${status}.`,
          error_code: "FORBIDDEN_STATUS"
        });
      }

      // Enforce deadline restrictions: No updates after deadline passed
      if (deadline && now > deadline) {
        return res.status(403).json({
          success: false,
          message: "The deadline for this plan has passed. Progress updates are no longer allowed.",
          error_code: "DEADLINE_PASSED"
        });
      }

      const specific_objective_detail_id = plan.specific_objective_detail_id;

      const checkSpecificObjectiveDetailQuery = `
        SELECT * FROM specific_objective_details 
        WHERE specific_objective_detail_id = ? AND user_id = ?
      `;

      con.query(checkSpecificObjectiveDetailQuery, [specific_objective_detail_id, user_id], (err, specificObjectiveDetailResults) => {
        if (err || specificObjectiveDetailResults.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Specific objective detail not found or unauthorized.",
            error_code: "SPECIFIC_OBJECTIVE_DETAIL_NOT_FOUND_OR_UNAUTHORIZED"
          });
        }

        const updateQuery = `
          UPDATE specific_objective_details 
          SET ${updateFields.map(field => `${field} = ?`).join(", ")}
          WHERE specific_objective_detail_id = ? AND user_id = ?
        `;

        const updateValues = [
          ...updateFields.map(field => updates[field]),
          specific_objective_detail_id,
          user_id
        ];

        con.query(updateQuery, updateValues, (err, result) => {
          if (err || result.affectedRows === 0) {
            return res.status(500).json({
              success: false,
              message: "Failed to update specific objective detail.",
              error_code: "DB_ERROR_UPDATE"
            });
          }

          // Insert files if any
          if (req.files && req.files.length > 0) {
            const fileInsertQuery = `
              INSERT INTO reportfile (specific_objective_id, file_name, file_path)
              VALUES ?
            `;
            const fileData = req.files.map(file => [
              specific_objective_detail_id,
              file.originalname,
              file.path
            ]);

            con.query(fileInsertQuery, [fileData], (err, fileInsertResult) => {
              if (err) {
                console.error("File upload DB insert error:", err.stack);
                // You can decide whether to fail the whole request or just warn
              } else {
                console.log(`${fileInsertResult.affectedRows} file(s) uploaded`);
              }
            });
          }

          // Update reporting and report_progress status
          const updatePlanQuery = `
            UPDATE plans
            SET reporting = 'active', report_progress = 'on_progress'
            WHERE plan_id = ? AND user_id = ?
          `;
          con.query(updatePlanQuery, [planId, user_id], (err) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: "Failed to update plan reporting status.",
                error_code: "DB_ERROR_PLAN_UPDATE"
              });
            }

            // Get supervisor ID
            const getSupervisorQuery = `
              SELECT e.supervisor_id FROM employees e
              JOIN users u ON e.employee_id = u.employee_id
              WHERE u.user_id = ?
            `;
            con.query(getSupervisorQuery, [user_id], (err, supervisorResults) => {
              if (err || supervisorResults.length === 0) {
                return res.status(404).json({
                  success: false,
                  message: "Supervisor not found.",
                  error_code: "SUPERVISOR_NOT_FOUND"
                });
              }

              const supervisor_id = supervisorResults[0].supervisor_id;
              const updateSupervisorQuery = `
                UPDATE plans
                SET supervisor_id = ?
                WHERE plan_id = ? AND user_id = ?
              `;
              con.query(updateSupervisorQuery, [supervisor_id, planId, user_id], (err) => {
                if (err) {
                  return res.status(500).json({
                    success: false,
                    message: "Failed to update supervisor ID.",
                    error_code: "DB_ERROR_SUPERVISOR_UPDATE"
                  });
                }

                // Update approval workflow to pending
                const updateApprovalWorkflowQuery = `
                  UPDATE approvalworkflow
                  SET status = 'pending'
                  WHERE plan_id = ?
                `;
                con.query(updateApprovalWorkflowQuery, [planId], (err) => {
                  if (err) {
                    return res.status(500).json({
                      success: false,
                      message: "Failed to update approval workflow.",
                      error_code: "DB_ERROR_APPROVAL_UPDATE"
                    });
                  }

                  // Fetch final updated result
                  const fetchUpdatedDetailQuery = `
                    SELECT * FROM specific_objective_details 
                    WHERE specific_objective_detail_id = ? AND user_id = ?
                  `;
                  con.query(fetchUpdatedDetailQuery, [specific_objective_detail_id, user_id], (err, updatedDetailResults) => {
                    if (err || updatedDetailResults.length === 0) {
                      return res.status(500).json({
                        success: false,
                        message: "Failed to fetch updated report.",
                        error_code: "FETCH_UPDATED_FAILED"
                      });
                    }

                    return res.status(200).json({
                      success: true,
                      message: "Report updated and files uploaded successfully.",
                      data: updatedDetailResults[0]
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Unexpected error:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Unexpected server error.",
      error: error.message
    });
  }
};

// Resubmit declined plan - works like adding a new plan
const resubmitDeclinedPlan = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { planId } = req.params;
    const { goal_id, objective_id, specific_objective_id, specific_objective_details_id } = req.body;

    // Validate required fields
    if (!goal_id || !objective_id || !specific_objective_id || !specific_objective_details_id) {
      const missingFields = [];
      if (!goal_id) missingFields.push("goal_id");
      if (!objective_id) missingFields.push("objective_id");
      if (!specific_objective_id) missingFields.push("specific_objective_id");
      if (!specific_objective_details_id) missingFields.push("specific_objective_details_id");
      return res.status(400).json({
        success: false,
        message: "The following fields are missing or invalid.",
        missingFields,
      });
    }

    const specificObjectiveDetailsId = Array.isArray(specific_objective_details_id)
      ? specific_objective_details_id[0]
      : specific_objective_details_id;

    // First, verify the plan exists and belongs to the user and is declined
    const checkPlanQuery = `
      SELECT p.*, aw.status as approval_status 
      FROM plans p 
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id 
      WHERE p.plan_id = ? AND p.user_id = ?
    `;

    con.query(checkPlanQuery, [planId, user_id], (err, planResults) => {
      if (err) {
        console.error("Error checking plan:", err);
        return res.status(500).json({
          success: false,
          message: "Error checking plan",
          error: err.message
        });
      }

      if (planResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Plan not found or unauthorized"
        });
      }

      const existingPlan = planResults[0];

      // Check if plan is actually declined
      if (existingPlan.approval_status !== 'declined') {
        return res.status(400).json({
          success: false,
          message: "Only declined plans can be resubmitted"
        });
      }

      // Validate foreign keys
      const validateForeignKeys = `
        SELECT 
          (SELECT COUNT(*) FROM goals WHERE goal_id = ?) AS goal_exists,
          (SELECT COUNT(*) FROM objectives WHERE objective_id = ?) AS objective_exists,
          (SELECT COUNT(*) FROM specific_objectives WHERE specific_objective_id = ?) AS specific_objective_exists,
          (SELECT COUNT(*) FROM specific_objective_details WHERE specific_objective_detail_id = ?) AS specific_objective_detail_exists
      `;

      con.query(
        validateForeignKeys,
        [goal_id, objective_id, specific_objective_id, specificObjectiveDetailsId],
        (err, results) => {
          if (err) {
            console.error("Error validating foreign keys:", err);
            return res.status(500).json({
              success: false,
              message: "Error validating foreign keys",
              error: err.message
            });
          }

          const {
            goal_exists,
            objective_exists,
            specific_objective_exists,
            specific_objective_detail_exists,
          } = results[0];

          if (!goal_exists || !objective_exists || !specific_objective_exists || !specific_objective_detail_exists) {
            return res.status(400).json({
              success: false,
              message: "Invalid foreign key references. Ensure all referenced data exists.",
              details: {
                goal_id: !!goal_exists,
                objective_id: !!objective_exists,
                specific_objective_id: !!specific_objective_exists,
                specific_objective_details_id: !!specific_objective_detail_exists,
              },
            });
          }

          // Get user's employee details
          con.query("SELECT employee_id FROM users WHERE user_id = ?", [user_id], (err, userResult) => {
            if (err) {
              console.error("Error retrieving employee ID:", err);
              return res.status(500).json({
                success: false,
                message: "Error retrieving employee ID",
                error: err.message
              });
            }
            if (userResult.length === 0) {
              return res.status(404).json({
                success: false,
                message: "User not found"
              });
            }

            const employee_id = userResult[0].employee_id;

            // Get supervisor and department info
            con.query(
              "SELECT supervisor_id, department_id FROM employees WHERE employee_id = ?",
              [employee_id],
              (err, employeeResult) => {
                if (err) {
                  console.error("Error retrieving employee details:", err);
                  return res.status(500).json({
                    success: false,
                    message: "Error retrieving employee details",
                    error: err.message
                  });
                }
                if (employeeResult.length === 0) {
                  return res.status(404).json({
                    success: false,
                    message: "Employee details not found"
                  });
                }

                const { supervisor_id, department_id } = employeeResult[0];

                // Get department name (position name)
                con.query("SELECT COALESCE(name_amharic, name) as name FROM organization_structure WHERE id = ?", [department_id], (err, deptResult) => {
                  if (err) {
                    console.error("Error retrieving department name:", err);
                    return res.status(500).json({
                      success: false,
                      message: "Error retrieving department name",
                      error: err.message
                    });
                  }

                  const department_name = deptResult.length > 0 ? deptResult[0].name : 'Unknown Department';

                  // Start transaction to update the existing plan
                  con.beginTransaction((err) => {
                    if (err) {
                      console.error("Error starting transaction:", err);
                      return res.status(500).json({
                        success: false,
                        message: "Error starting transaction",
                        error: err.message
                      });
                    }

                    // Update the existing plan with new data
                    const updatePlanQuery = `
                      UPDATE plans SET 
                        goal_id = ?, 
                        objective_id = ?, 
                        specific_objective_id = ?, 
                        specific_objective_detail_id = ?,
                        status = 'Pending',
                        reporting = 'deactivate',
                        year = ?,
                        department_name = ?,
                        updated_at = CURRENT_TIMESTAMP
                      WHERE plan_id = ? AND user_id = ?
                    `;

                    const updateValues = [
                      goal_id,
                      objective_id,
                      specific_objective_id,
                      specificObjectiveDetailsId,
                      new Date().getFullYear(),
                      department_name,
                      planId,
                      user_id
                    ];

                    con.query(updatePlanQuery, updateValues, (err, result) => {
                      if (err) {
                        return con.rollback(() => {
                          console.error("Error updating plan:", err);
                          res.status(500).json({
                            success: false,
                            message: "Error updating plan",
                            error: err.message
                          });
                        });
                      }

                      // Update the approval workflow to reset to pending
                      const updateApprovalQuery = `
                        UPDATE approvalworkflow SET 
                          status = 'Pending', 
                          approval_date = NOW(), 
                          approved_at = NULL, 
                          comment = '',
                          comment_writer = ''
                        WHERE plan_id = ?
                      `;

                      con.query(updateApprovalQuery, [planId], (err) => {
                        if (err) {
                          return con.rollback(() => {
                            console.error("Error updating approval workflow:", err);
                            res.status(500).json({
                              success: false,
                              message: "Error updating approval workflow",
                              error: err.message
                            });
                          });
                        }

                        // Commit the transaction
                        con.commit((err) => {
                          if (err) {
                            return con.rollback(() => {
                              console.error("Error committing transaction:", err);
                              res.status(500).json({
                                success: false,
                                message: "Error committing transaction",
                                error: err.message
                              });
                            });
                          }

                          res.status(200).json({
                            success: true,
                            message: "Declined plan resubmitted successfully",
                            plan_id: planId,
                          });
                        });
                      });
                    });
                  });
                });
              }
            );
          });
        }
      );
    });
  } catch (error) {
    console.error("Error in resubmitDeclinedPlan:", error);
    res.status(500).json({
      success: false,
      message: `Unexpected error: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

module.exports = { getAllOrgP_lans, getAllPlansDeclined, getApprovedOrgPlans, getPlanDetail, getAllOrgPlans, getAllPlans, deletePlan, updatePland, updatePlan, getPlanById, addReport, markPlanAsCompleted, resubmitDeclinedPlan };
