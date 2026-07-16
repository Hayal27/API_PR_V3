const con = require("../models/db");

// Get all reports from user_id
const getAllReports = async (req, res) => {
    try {
      const user_id = req.user_id; // Access the user_id added by verifyToken
  
      // Extract filter parameters from query string
      const { year, quarter, department, objective } = req.query;
  
      let filterConditions = [];
      let filterValues = [user_id];
  
      if (year) {
        filterConditions.push("r.year = ?");
        filterValues.push(year);
      }
  
      if (quarter) {
        filterConditions.push("r.quarter = ?");
        filterValues.push(quarter);
      }
  
      if (department) {
        // Use recursive CTE for department filtering (cascading)
        filterConditions.push(`r.department_id IN (
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
  
      if (objective) {
        filterConditions.push("r.objective = ?");
        filterValues.push(objective);
      }
  
      const whereClause = filterConditions.length
        ? `WHERE r.user_id = ? AND ${filterConditions.join(" AND ")}`
        : `WHERE r.user_id = ?`;
  
      const getReportsQuery = `
        SELECT 
          r.report_id AS ID,          -- Include the Plan ID
          r.objective AS Objective, 
          r.goal AS Goal, 
          r.row_no AS 'Row No', 
          r.details AS Details, 
          r.measurement AS Measurement, 
          r.baseline AS Baseline, 
          r.plan AS Plan, 
          r.description AS Description, 
          r.status AS Status, 
          d.name AS Department,        -- Updated to use d.name for Department
          r.created_by AS Created_by, 
          r.year AS Year, 
          r.quarter AS Quarter,
          r.progress AS Progress 
        FROM reports r
        LEFT JOIN departments d ON r.department_id = d.department_id 
        ${whereClause}
      `;
  
      con.query(getReportsQuery, filterValues, (err, results) => {
        if (err) {
          console.error("Error fetching reports:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching reports from the database.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }
  
        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No reports found for the user.",
            error_code: "NO_REPORTS_FOUND",
          });
        }
  
        res.status(200).json({
          success: true,
          reports: results, // The results now include the Plan ID
        });
      });
    } catch (error) {
      console.error("Error in getAllReports:", error.message);
      res.status(500).json({
        success: false,
        message: `Unknown error occurred. ${error.message}`,
        error_code: "UNKNOWN_ERROR",
      });
    }
  };
  



// Delete report
const deleteReport = async (req, res) => {

  try {
    const user_id = req.user_id;
    const { reportId } = req.params;

    const deleteQuery = `
      DELETE FROM reports
      WHERE report_id = ? AND user_id = ?
    `;

    con.query(deleteQuery, [reportId, user_id], (err, result) => {
      if (err) {
        console.error("Error deleting reports:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error deleting the reports.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "reports not found or you don't have permission to delete it.",
          error_code: "REPORTS",
        });
      }

      res.status(200).json({
        success: true,
        message: "reports deleted successfully.",
      });
    });
  } catch (error) {
    console.error("Error in deletereports:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  try {
    const user_id = req.user_id; // Access the user_id added by verifyToken
    const { reportId } = req.params; // 

    const query = `
      SELECT 
        r.report_id AS ID,
        r.plan_id AS ID,
        r.objective AS Objective, 
        r.goal AS Goal, 
        r.details AS Details, 
        r.measurement AS Measurement, 
        r.baseline AS Baseline, 
        r.plan AS Plan, 
        r.description AS Description, 
        r.status AS Status, 
        d.name AS Department, 
        r.created_by AS Created_by, 
        r.year AS Year, 
        r.quarter AS Quarter, 
        r.progress AS Progress 
      FROM reports r
      LEFT JOIN departments d ON r.department_id = d.department_id 
      WHERE r.user_id = ? AND r.report_id = ?
    `;

    con.query(query, [user_id, reportId], (err, results) => {
      if (err) {
        console.error("Error fetching report details:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching report details from the database.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "report not found.",
          error_code: "REPORT_NOT_FOUND",
        });
      }

      res.status(200).json({
        success: true,
        report: results[0], // Return the first result since report_id is unique
      });
    });
  } catch (error) {
    console.error("Error in getReportById:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

// Update report
const updateReport = async (req, res) => {
  try {
    const user_id = req.user_id; // Access the user_id added by verifyToken middleware
    const { reportId } = req.params; // Get the report ID from the request parameters
    const updates = req.body; // Get the updates from the request body

    // Validate input data types and formats
    if (updates.year && isNaN(updates.year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format. Please provide a valid number.",
        error_code: "INVALID_YEAR_FORMAT",
        details: { provided_year: updates.year },
      });
    }

    if (updates.progress && !["planned", "የ እቅዱ ሂደት", "completed"].includes(updates.progress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid progress value. Allowed values are 'planned', 'progress', or 'completed'.",
        error_code: "INVALID_PROGRESS_VALUE",
        details: { provided_progress: updates.progress },
      });
    }

    // Allow updates only to specific fields
    const allowedUpdates = [
      "objective",
      "goal",
      "details",
      "measurement",
      "baseline",
      "plan",
      "description",
      "year",
      "quarter",
      "የ እቅዱ ሂደት",
    ];

    const updateFields = Object.keys(updates).filter((field) =>
      allowedUpdates.includes(field)
    );

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update. Ensure you're updating only allowed fields.",
        error_code: "NO_VALID_FIELDS",
        details: { provided_fields: Object.keys(updates) },
      });
    }

    // Check if the report exists and belongs to the current user
    const checkReportQuery = `
      SELECT * FROM reports 
      WHERE report_id = ? AND user_id = ?
    `;
    con.query(checkReportQuery, [reportId, user_id], (err, results) => {
      if (err) {
        console.error("Error checking report existence:", err.stack);
        return res.status(500).json({
          success: false,
          message: "Error while checking report existence in the database.",
          error_code: "DB_ERROR_CHECK",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "report not found or you don't have permission to update this report.",
          error_code: "Report_NOT_FOUND_OR_UNAUTHORIZED",
        });
      }

      // Prepare the update query
      const updateQuery = `
        UPDATE reports 
        SET ${updateFields.map((field) => `${field} = ?`).join(", ")}
        WHERE report_id = ? AND user_id = ?
      `;
      const updateValues = [...updateFields.map((field) => updates[field]), reportId, user_id];

      // Execute the update query
      con.query(updateQuery, updateValues, (err, result) => {
        if (err) {
          console.error("Error updating report:", err.stack);
          return res.status(500).json({
            success: false,
            message: "Database error while updating the report.",
            error_code: "DB_ERROR_UPDATE",
            error: err.message,
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "No updates were applied. The reports may not exist or no changes were made.",
            error_code: "NO_UPDATES_APPLIED",
            details: { affected_rows: result.affectedRows },
          });
        }

        // Success response
        res.status(200).json({
          success: true,
          message: "reports updated successfully.",
        });
      });
    });
  } catch (error) {
    console.error("Error in updateReport function:", error.stack);
    res.status(500).json({
      success: false,
      message: `An unexpected error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
      error: error.stack,
    });
  }
};



// Get all approved plans with completed progress
const getAllOrgReports = async (req, res) => {
  try {
    const {
      year,
      quarter,
      department,
      objective,
      goal_id,
      specific_goal_id,
      page = 1,
      limit = 10,
    } = req.query;

    let filterConditions = [];
    let filterValues = [];

    if (year) {
      filterConditions.push("o.year = ?");
      filterValues.push(year);
    }

    if (quarter) {
      filterConditions.push("o.quarter = ?");
      filterValues.push(quarter);
    }

    if (department) {
      filterConditions.push("d.name = ?");
      filterValues.push(department);
    }

    if (objective) {
      filterConditions.push("o.name = ?");
      filterValues.push(objective);
    }

    if (goal_id) {
      filterConditions.push("g.name = ?");
      filterValues.push(goal_id);
    }

    if (specific_goal_id) {
      filterConditions.push("sg.name = ?");
      filterValues.push(specific_goal_id);
    }

    // Filter for approved status and completed progress
    filterConditions.push("p.status = 'approved'");
    filterConditions.push("sg.progress = 'completed'");

    const whereClause = filterConditions.length
      ? `WHERE ${filterConditions.join(" AND ")}`
      : "";

    const offset = (page - 1) * limit;

    const getPlansQuery = `
      SELECT 
        p.plan_id AS Plan_ID,
        sg.details AS Details,
        sg.measurement AS Measurement,
        sg.baseline AS Baseline,
        p.plan AS Plan,
        o.description AS Description,
        p.status AS Status,
        p.comment AS Comment,
        p.created_at AS Created_At,
        p.updated_at AS Updated_At,
        o.year AS Year,
        o.quarter AS Quarter,
        p.created_by AS Created_By,
        d.name AS Department,
        o.name AS Objective,
        g.name AS Goal,
        sg.name AS Specific_Goal
      FROM plans p
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN goals g ON p.goal_id = g.id
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN specific_goals sg ON p.specific_goal_id = sg.id
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    filterValues.push(parseInt(limit, 10), parseInt(offset, 10));

    con.query(getPlansQuery, filterValues, (err, results) => {
      if (err) {
        console.error("Error fetching organization plans:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching organization plans from the database.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No approved plans with completed progress found.",
          error_code: "NO_PLANS_FOUND",
        });
      }

      res.status(200).json({
        success: true,
        plans: results,
      });
    });
  } catch (error) {
    console.error("Error in getAllOrgPlans:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

// Get all plans with completed and ongoing progress

const getmyreportReports = async (req, res) => {
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
      page = 1,
      limit = 10,
    } = req.query;

    let filterConditions = ["p.user_id = ?", "p.reporting = 'active'"]; // Add condition for active reporting
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

    const whereClause = filterConditions.length ? `WHERE ${filterConditions.join(" AND ")}` : '';

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
        sod.specific_objective_detailname AS Specific_Objective_Detail_Name, 
        sod.baseline AS Baseline,
        sod.plan AS Plan,
        sod.measurement AS Measurement,
        sod.execution_percentage AS Execution_Percentage,
        sod.year AS Year,
        sod.month AS Month,
        sod.day AS Day,
        sod.deadline AS Deadline,
        sod.status AS Status,
        sod.description AS Description,
        sod.outcome AS Outcome,
        sod.progress AS Progress,
        sod.created_by AS Created_By,
        sod.plan_type AS Plan_Type,
        sod.income_exchange AS Income_Exchange,
        sod.cost_type AS Cost_Type,
        sod.employment_type AS Employment_Type,
        sod.incomeName AS Income_Name,
        sod.costName AS Cost_Name,
        sod.CIbaseline AS CI_Baseline,
        sod.CIplan AS CI_Plan,
        sod.CIoutcome AS CI_Outcome,
        sod.CIexecution_percentage AS CI_Execution_Percentage,
        p.status AS Status,
        p.created_at AS Created_At,
        p.updated_at AS Updated_At,
        d.name AS Department,
        aw.comment AS Comment
      FROM plans p
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    filterValues.push(parseInt(limit), parseInt(offset));

    con.query(getPlansQuery, filterValues, (err, results) => {
      if (err) {
        console.error("Error fetching plans:", err);
        return res.status(500).json({ message: "Error fetching plans", error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "No plans found" });
      }

      res.status(200).json({ success: true, plans: results });
    });
  } catch (error) {
    console.error("Error in getmyreportReports:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};




const getApprovedOrgreports = async (req, res) => {
  try {
    const getReortsQuery = `
      SELECT 
        r.report_id AS Report_ID,
        r.user_id AS User_ID,
        r.department_id AS Department_ID,
        r.objective AS Objective,
        r.goal AS Goal,
        r.row_no AS Row_No,
        r.details AS Details,
        r.measurement AS Measurement,
        r.baseline AS Baseline,
        r.plan AS Plan,
        r.outcome AS Outcome,
        r.execution_percentage AS Execution_Percentage,
        r.description AS Description,
        r.status AS Status,
        r.comment AS Comment,
        r.created_at AS Created_At,
        r.updated_at AS Updated_At,
        r.year AS Year,
        r.quarter AS Quarter,
        r.created_by AS Created_By,
        r.progress AS Progress,
        d.name AS Department
      FROM reports r
      LEFT JOIN departments d ON r.department_id = d.department_id;
    `;

    con.query(getReortsQuery, (err, results) => {
      if (err) {
        console.error("Error fetching all reports:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching plans from the database.",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No reports found.",
        });
      }

      res.status(200).json({
        success: true,
        plans: results, // Return all plans as an array
      });
    });
  } catch (error) {
    console.error("Error in getApprovedOrgReports:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
    });
  }
};



// get report detail
// get report detail
const getReportDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      console.error("getReportDetail: Missing id in request parameters.");
      return res.status(400).json({
        success: false,
        message: "Plan ID is required."
      });
    }

    // SQL Query to fetch detailed plan information.
    const getPlanQuery = `
      SELECT
          p.plan_id AS Plan_ID,
          p.user_id AS User_ID,
          p.department_id AS Department_ID,
          sod.plan AS Plan,
          sod.details AS Details,
          sod.measurement AS Measurement,
          sod.baseline AS Baseline,
          sod.deadline AS Deadline,
          sod.priority AS Priority,
          sod.progress AS Progress,
          sod.specific_objective_detailname AS Specific_Detail,
          sod.plan_type AS Plan_Type,
          sod.income_exchange AS Income_Exchange,
          sod.cost_type AS Cost_Type,
          sod.employment_type AS Employment_Type,
          sod.incomeName AS Income_Name,
          sod.costName AS Cost_Name,

          sod.CIbaseline AS CI_Baseline,
          sod.CIplan AS CI_Plan,
          sod.CIoutcome AS CIoutcome,
          sod.CIexecution_percentage AS CI_Execution,
          sod.execution_percentage AS Execution_Percentage,
          o.description AS Description,
          aw.comment AS Comment,
          p.created_at AS Created_At,
          p.updated_at AS Updated_At,
          g.year AS Year,
          g.quarter AS Quarter,
          sod.created_by AS Created_By,
          p.status AS Status,
          d.name AS Department,
          o.name AS Objective_Name,
          g.name AS Goal_Name,
          so.specific_objective_name AS Specific_Objective_Name,
          CASE
            WHEN sod.plan_type = 'cost' THEN sod.costName
            WHEN sod.plan_type = 'income' THEN sod.incomeName
            ELSE NULL
          END AS type_name
      FROM plans p
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE p.plan_id = ?;
    `;

    con.query(getPlanQuery, [id], (err, results) => {
      if (err) {
        console.error("Error fetching plan details:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching plan details from the database.",
          error: err.message,
        });
      }

      if (results.length === 0) {
        console.error(`No plan found with id: ${id}`);
        return res.status(404).json({
          success: false,
          message: "Plan not found.",
        });
      }

      const plan = results[0];

      // Format the plan data to guarantee that each field returns a fallback value if absent.
      const formattedPlan = {
        Plan_ID: plan.Plan_ID ?? "",
        User_ID: plan.User_ID ?? "",
        Department_ID: plan.Department_ID ?? "",
        Plan: plan.Plan ?? "",
        Details: plan.Details ?? "",
        Measurement: plan.Measurement ?? "",
        Baseline: plan.Baseline ?? "",
        Deadline: plan.Deadline ?? "",
        Priority: plan.Priority ?? "",
        Progress: plan.Progress ?? "",
        specObjectiveDetail: plan.specObjectiveDetail ?? "",
        plan_type: plan.plan_type ?? "",
        income_exchange: plan.income_exchange ?? "",
        cost_type: plan.cost_type ?? "",
        employment_type: plan.employment_type ?? "",
        incomeName: plan.incomeName ?? "",
        costName: plan.costName ?? "",
        CIBaseline: plan.CIBaseline ?? "",
        CIplan: plan.CIplan ?? "",
        CIoutcome: plan.CIoutcome ?? "",
        CIexecution_percentage: plan.CIexecution_percentage ?? "",
        execution_percentage: plan.execution_percentage ?? "",
        Description: plan.Description ?? "",
        Comment: plan.Comment ?? "",
        Created_At: plan.Created_At ?? "",
        Updated_At: plan.Updated_At ?? "",
        Year: plan.Year ?? "",
        Quarter: plan.Quarter ?? "",
        Created_By: plan.Created_By ?? "",
        Status: plan.Status ?? "",
        Department: plan.Department ?? "",
        Objective_Name: plan.Objective_Name ?? "",
        Goal_Name: plan.Goal_Name ?? "",
        Specific_Objective_Name: plan.Specific_Objective_Name ?? "",
        Specific_Objective_NameDetail: plan.Specific_Objective_NameDetail ?? "",
        type_name: plan.type_name ?? ""
      };

      console.log("Plan details retrieved successfully:", formattedPlan);

      res.status(200).json({
        success: true,
        plan: formattedPlan,
      });
    });
  } catch (error) {
    console.error("Error in getReportDetail:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
    });
  }
};




const getAnalyticsData = async (req, res) => {
  try {
    // Define allowed filter types within the function.
    const allowedFilterTypes = ["goal_id", "plan_id", "department_id"];

    // Log incoming query parameters for debugging.
    console.log('Incoming query parameters:', req.query);
    const { filterType, filterValue, year, quarter } = req.query;

    // Validate input parameters.
    if (!filterType || !filterValue) {
      return res.status(400).json({
        success: false,
        message: 'Filter type and filter value are required.',
      });
    }

    // Validate against the allowedFilterTypes list.
    if (!allowedFilterTypes.includes(filterType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filter type provided.',
      });
    }

    // Construct the SQL query with necessary joins through the plans table.
    let baseQuery = `
      SELECT
        p.plan_id AS Plan_ID,
        p.user_id AS User_ID,
        p.department_id AS Department_ID,
        sod.plan AS Plan,
        sod.details AS Details,
        sod.measurement AS Measurement,
        sod.baseline AS Baseline,
        sod.deadline AS Deadline,
        sod.priority AS Priority,
        sod.progress AS Progress,
        sod.specific_objective_detailname AS Specific_Detail,
        sod.plan_type AS Plan_Type,
        sod.income_exchange AS Income_Exchange,
        sod.cost_type AS Cost_Type,
        sod.employment_type AS Employment_Type,
        sod.incomeName AS Income_Name,
        sod.costName AS Cost_Name,
        sod.CIbaseline AS CI_Baseline,
        sod.CIplan AS CI_Plan,
        sod.CIoutcome AS CI_Outcome,
        sod.CIexecution_percentage AS CI_Execution,
        sod.execution_percentage AS Execution_Percentage,
        o.description AS Description,
        aw.comment AS Comment,
        p.created_at AS Created_At,
        p.updated_at AS Updated_At,
        g.year AS Year,
        g.quarter AS Quarter,
        sod.created_by AS Created_By,
        p.status AS Status,
        d.name AS Department,
        o.name AS Objective_Name,
        g.name AS Goal_Name,
        so.specific_objective_name AS Specific_Objective_Name,
        CASE
          WHEN sod.plan_type = 'cost' THEN sod.costName
          WHEN sod.plan_type = 'income' THEN sod.incomeName
          ELSE NULL
        END AS type_name
      FROM plans p
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE 1=1
    `;
    let queryParams = [];

    if (filterType === 'department_id') {
      baseQuery += ` AND p.department_id IN (
        SELECT id FROM (
          WITH RECURSIVE children AS (
            SELECT id FROM organization_structure WHERE id = ?
            UNION ALL
            SELECT os.id FROM organization_structure os
            INNER JOIN children c ON os.parent_id = c.id
          )
          SELECT id FROM children
        ) temp
      )`;
      queryParams.push(filterValue);
    } else {
      baseQuery += ` AND p.${filterType} = ?`;
      queryParams.push(filterValue);
    }


    // Add optional filters for year and quarter.
    if (year) {
      baseQuery += ' AND g.year = ?';
      queryParams.push(year);
    }
    if (quarter) {
      baseQuery += ' AND g.quarter = ?';
      queryParams.push(quarter);
    }

    console.log('Executing SQL Query:', baseQuery);
    console.log('Query Parameters:', queryParams);

    // Execute the query using the connection con.
    con.query(baseQuery, queryParams, (error, results) => {
      if (error) {
        console.error('Database query error:', error.message);
        return res.status(500).json({
          success: false,
          message: 'Database query failed.',
        });
      }

      // Process and return the results.
      return res.status(200).json({
        success: true,
        data: results,
      });
    });
  } catch (error) {
    console.error('Error in getAnalyticsData:', error.message);
    return res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
    });
  }
};

module.exports = {getAnalyticsData, getmyreportReports,getApprovedOrgreports,getReportDetail, getAllOrgReports,getAllReports,deleteReport, updateReport,getReportById };



