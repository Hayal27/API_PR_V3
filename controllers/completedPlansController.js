const con = require("../models/db");

/**
 * Advanced Completed Plans Fetcher
 * Fetches completed plans with comprehensive details from the database
 * Includes: Goals, Objectives, Specific Objectives, Details, Reports, Approvals, and Metrics
 */

// Get all completed plans with advanced filtering and detailed information
const getCompletedPlansAdvanced = async (req, res) => {
  try {
    const {
      year,
      quarter,
      department,
      goal_id,
      objective_id,
      specific_objective_id,
      specific_objective_detail_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
      includeReports = true,
      includeApprovals = true,
      includeMetrics = true,
    } = req.query;

    // Build dynamic WHERE clause
    let filterConditions = [];
    let filterValues = [];

    // Filter for completed plans
    filterConditions.push("p.report_progress = 'completed'");
    filterConditions.push("p.status = 'Approved'");

    // Year filter
    if (year) {
      filterConditions.push("g.year = ?");
      filterValues.push(year);
    }

    // Quarter filter
    if (quarter) {
      filterConditions.push("g.quarter = ?");
      filterValues.push(quarter);
    }

    // Department filter
    if (department) {
      filterConditions.push("d.name = ?");
      filterValues.push(department);
    }

    // Goal filter
    if (goal_id) {
      filterConditions.push("p.goal_id = ?");
      filterValues.push(goal_id);
    }

    // Objective filter
    if (objective_id) {
      filterConditions.push("p.objective_id = ?");
      filterValues.push(objective_id);
    }

    // Specific Objective filter
    if (specific_objective_id) {
      filterConditions.push("p.specific_objective_id = ?");
      filterValues.push(specific_objective_id);
    }

    // Specific Objective Detail filter
    if (specific_objective_detail_id) {
      filterConditions.push("p.specific_objective_detail_id = ?");
      filterValues.push(specific_objective_detail_id);
    }

    // Search filter (searches across multiple fields)
    if (search) {
      filterConditions.push(
        "(g.name LIKE ? OR o.name LIKE ? OR so.specific_objective_name LIKE ? OR sod.specific_objective_detailname LIKE ? OR d.name LIKE ?)"
      );
      const searchTerm = `%${search}%`;
      filterValues.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Validate sort parameters
    const allowedSortFields = [
      'p.created_at',
      'p.updated_at',
      'p.plan_id',
      'g.year',
      'sod.execution_percentage',
      'd.name',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'p.created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = filterConditions.length
      ? `WHERE ${filterConditions.join(" AND ")}`
      : '';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Main query to fetch completed plans with all details
    const getCompletedPlansQuery = `
      SELECT 
        p.plan_id AS Plan_ID,
        p.user_id AS User_ID,
        p.department_id AS Department_ID,
        p.supervisor_id AS Supervisor_ID,
        p.employee_id AS Employee_ID,
        p.status AS Plan_Status,
        p.report_status AS Report_Status,
        p.report_progress AS Report_Progress,
        p.editing_status AS Editing_Status,
        p.reporting AS Reporting_Status,
        p.created_at AS Plan_Created_At,
        p.updated_at AS Plan_Updated_At,
        p.year AS Plan_Year,
        p.department_name AS Department_Name,
        
        -- Goal Information
        g.goal_id AS Goal_ID,
        g.name AS Goal_Name,
        g.description AS Goal_Description,
        g.year AS Goal_Year,
        g.quarter AS Goal_Quarter,
        g.created_at AS Goal_Created_At,
        
        -- Objective Information
        o.objective_id AS Objective_ID,
        o.name AS Objective_Name,
        o.description AS Objective_Description,
        o.created_at AS Objective_Created_At,
        
        -- Specific Objective Information
        so.specific_objective_id AS Specific_Objective_ID,
        so.specific_objective_name AS Specific_Objective_Name,
        so.details AS Specific_Objective_Details,
        so.baseline AS Specific_Objective_Baseline,
        so.plan AS Specific_Objective_Plan,
        so.measurement AS Specific_Objective_Measurement,
        so.execution_percentage AS Specific_Objective_Execution_Percentage,
        so.deadline_quarter AS Specific_Objective_Deadline_Quarter,
        so.deadline AS Specific_Objective_Deadline,
        so.priority AS Specific_Objective_Priority,
        so.progress AS Specific_Objective_Progress,
        so.created_at AS Specific_Objective_Created_At,
        
        -- Specific Objective Detail Information
        sod.specific_objective_detail_id AS Specific_Objective_Detail_ID,
        sod.specific_objective_detailname AS Specific_Objective_Detail_Name,
        sod.details AS Specific_Objective_Detail_Details,
        sod.baseline AS Specific_Objective_Detail_Baseline,
        sod.plan AS Specific_Objective_Detail_Plan,
        sod.measurement AS Specific_Objective_Detail_Measurement,
        sod.execution_percentage AS Specific_Objective_Detail_Execution_Percentage,
        sod.outcome AS Specific_Objective_Detail_Outcome,
        sod.deadline AS Specific_Objective_Detail_Deadline,
        sod.status AS Specific_Objective_Detail_Status,
        sod.priority AS Specific_Objective_Detail_Priority,
        sod.progress AS Specific_Objective_Detail_Progress,
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
        sod.created_by AS Created_By,
        sod.created_at AS Specific_Objective_Detail_Created_At,
        
        -- Department Information
        d.name AS Department_Name,
        
        -- Employee Information
        e.name AS Employee_Name,
        e.fname AS Employee_First_Name,
        e.lname AS Employee_Last_Name,
        e.email AS Employee_Email,
        
        -- Supervisor Information
        sup.name AS Supervisor_Name,
        sup.fname AS Supervisor_First_Name,
        sup.lname AS Supervisor_Last_Name,
        sup.email AS Supervisor_Email,
        
        -- Approval Information
        aw.approvalworkflow_id AS Approval_ID,
        aw.status AS Approval_Status,
        aw.comment AS Approval_Comment,
        aw.approval_date AS Approval_Date,
        aw.approved_at AS Approved_At,
        aw.rating AS Approval_Rating,
        
        -- Report Information
        r.report_id AS Report_ID,
        r.report_content AS Report_Content,
        r.status AS Report_Status_Detail,
        r.created_at AS Report_Created_At,
        r.updated_at AS Report_Updated_At,
        
        -- Count of attachments
        COUNT(DISTINCT ra.attachment_id) AS Attachment_Count
        
      FROM plans p
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN employees e ON p.employee_id = e.employee_id
      LEFT JOIN employees sup ON p.supervisor_id = sup.employee_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN reports r ON p.plan_id = r.plan_id
      LEFT JOIN report_attachments ra ON r.report_id = ra.report_id
      ${whereClause}
      GROUP BY p.plan_id
      ORDER BY ${sortField} ${order}
      LIMIT ? OFFSET ?
    `;

    filterValues.push(parseInt(limit), parseInt(offset));

    // Execute main query
    con.query(getCompletedPlansQuery, filterValues, async (err, results) => {
      if (err) {
        console.error("Error fetching completed plans:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching completed plans from the database.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No completed plans found matching the criteria.",
          error_code: "NO_PLANS_FOUND",
          data: [],
        });
      }

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(DISTINCT p.plan_id) AS total_count
        FROM plans p
        LEFT JOIN departments d ON p.department_id = d.department_id
        LEFT JOIN goals g ON p.goal_id = g.goal_id
        LEFT JOIN objectives o ON p.objective_id = o.objective_id
        LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
        LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
        ${whereClause}
      `;

      con.query(countQuery, filterValues.slice(0, -2), (countErr, countResults) => {
        if (countErr) {
          console.error("Error getting total count:", countErr.message);
        }

        const totalCount = countResults && countResults.length > 0 ? countResults[0].total_count : 0;
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        // Format and enhance results
        const formattedResults = results.map((plan) => ({
          plan: {
            id: plan.Plan_ID,
            userId: plan.User_ID,
            departmentId: plan.Department_ID,
            supervisorId: plan.Supervisor_ID,
            employeeId: plan.Employee_ID,
            status: plan.Plan_Status,
            reportStatus: plan.Report_Status,
            reportProgress: plan.Report_Progress,
            editingStatus: plan.Editing_Status,
            reportingStatus: plan.Reporting_Status,
            createdAt: plan.Plan_Created_At,
            updatedAt: plan.Plan_Updated_At,
            year: plan.Plan_Year,
            departmentName: plan.Department_Name,
          },
          goal: {
            id: plan.Goal_ID,
            name: plan.Goal_Name,
            description: plan.Goal_Description,
            year: plan.Goal_Year,
            quarter: plan.Goal_Quarter,
            createdAt: plan.Goal_Created_At,
          },
          objective: {
            id: plan.Objective_ID,
            name: plan.Objective_Name,
            description: plan.Objective_Description,
            createdAt: plan.Objective_Created_At,
          },
          specificObjective: {
            id: plan.Specific_Objective_ID,
            name: plan.Specific_Objective_Name,
            details: plan.Specific_Objective_Details,
            baseline: plan.Specific_Objective_Baseline,
            plan: plan.Specific_Objective_Plan,
            measurement: plan.Specific_Objective_Measurement,
            executionPercentage: plan.Specific_Objective_Execution_Percentage,
            deadlineQuarter: plan.Specific_Objective_Deadline_Quarter,
            deadline: plan.Specific_Objective_Deadline,
            priority: plan.Specific_Objective_Priority,
            progress: plan.Specific_Objective_Progress,
            createdAt: plan.Specific_Objective_Created_At,
          },
          specificObjectiveDetail: {
            id: plan.Specific_Objective_Detail_ID,
            name: plan.Specific_Objective_Detail_Name,
            details: plan.Specific_Objective_Detail_Details,
            baseline: plan.Specific_Objective_Detail_Baseline,
            plan: plan.Specific_Objective_Detail_Plan,
            measurement: plan.Specific_Objective_Detail_Measurement,
            executionPercentage: plan.Specific_Objective_Detail_Execution_Percentage,
            outcome: plan.Specific_Objective_Detail_Outcome,
            deadline: plan.Specific_Objective_Detail_Deadline,
            status: plan.Specific_Objective_Detail_Status,
            priority: plan.Specific_Objective_Detail_Priority,
            progress: plan.Specific_Objective_Detail_Progress,
            planType: plan.Plan_Type,
            incomeExchange: plan.Income_Exchange,
            costType: plan.Cost_Type,
            employmentType: plan.Employment_Type,
            incomeName: plan.Income_Name,
            costName: plan.Cost_Name,
            ciBaseline: plan.CI_Baseline,
            ciPlan: plan.CI_Plan,
            ciOutcome: plan.CI_Outcome,
            ciExecutionPercentage: plan.CI_Execution_Percentage,
            createdBy: plan.Created_By,
            createdAt: plan.Specific_Objective_Detail_Created_At,
          },
          department: {
            name: plan.Department_Name,
          },
          employee: {
            name: plan.Employee_Name,
            firstName: plan.Employee_First_Name,
            lastName: plan.Employee_Last_Name,
            email: plan.Employee_Email,
          },
          supervisor: {
            name: plan.Supervisor_Name,
            firstName: plan.Supervisor_First_Name,
            lastName: plan.Supervisor_Last_Name,
            email: plan.Supervisor_Email,
          },
          approval: {
            id: plan.Approval_ID,
            status: plan.Approval_Status,
            comment: plan.Approval_Comment,
            approvalDate: plan.Approval_Date,
            approvedAt: plan.Approved_At,
            rating: plan.Approval_Rating,
          },
          report: {
            id: plan.Report_ID,
            content: plan.Report_Content,
            status: plan.Report_Status_Detail,
            createdAt: plan.Report_Created_At,
            updatedAt: plan.Report_Updated_At,
            attachmentCount: plan.Attachment_Count,
          },
        }));

        res.status(200).json({
          success: true,
          message: "Completed plans fetched successfully",
          data: formattedResults,
          pagination: {
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
            totalCount: totalCount,
            totalPages: totalPages,
            hasNextPage: parseInt(page) < totalPages,
            hasPreviousPage: parseInt(page) > 1,
          },
          filters: {
            year: year || null,
            quarter: quarter || null,
            department: department || null,
            goalId: goal_id || null,
            objectiveId: objective_id || null,
            specificObjectiveId: specific_objective_id || null,
            specificObjectiveDetailId: specific_objective_detail_id || null,
            search: search || null,
          },
          sorting: {
            sortBy: sortField,
            sortOrder: order,
          },
        });
      });
    });
  } catch (error) {
    console.error("Error in getCompletedPlansAdvanced:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

// Get completed plans summary statistics
const getCompletedPlansSummary = async (req, res) => {
  try {
    const { year, quarter, department } = req.query;

    let filterConditions = ["p.report_progress = 'completed'", "p.status = 'Approved'"];
    let filterValues = [];

    if (year) {
      filterConditions.push("g.year = ?");
      filterValues.push(year);
    }

    if (quarter) {
      filterConditions.push("g.quarter = ?");
      filterValues.push(quarter);
    }

    if (department) {
      filterConditions.push("d.name = ?");
      filterValues.push(department);
    }

    const whereClause = filterConditions.length
      ? `WHERE ${filterConditions.join(" AND ")}`
      : '';

    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT p.plan_id) AS Total_Completed_Plans,
        COUNT(DISTINCT p.department_id) AS Departments_Involved,
        COUNT(DISTINCT p.goal_id) AS Goals_Covered,
        COUNT(DISTINCT p.objective_id) AS Objectives_Covered,
        AVG(sod.execution_percentage) AS Average_Execution_Percentage,
        MIN(sod.execution_percentage) AS Min_Execution_Percentage,
        MAX(sod.execution_percentage) AS Max_Execution_Percentage,
        COUNT(DISTINCT CASE WHEN sod.progress = 'completed' THEN p.plan_id END) AS Fully_Completed_Plans,
        COUNT(DISTINCT CASE WHEN sod.progress = 'on going' THEN p.plan_id END) AS On_Going_Plans,
        COUNT(DISTINCT CASE WHEN sod.progress = 'started' THEN p.plan_id END) AS Started_Plans,
        COUNT(DISTINCT CASE WHEN aw.status = 'Approved' THEN p.plan_id END) AS Approved_Plans,
        COUNT(DISTINCT CASE WHEN aw.status = 'Declined' THEN p.plan_id END) AS Declined_Plans,
        COUNT(DISTINCT r.report_id) AS Total_Reports_Submitted,
        COUNT(DISTINCT CASE WHEN r.status = 'Approved' THEN r.report_id END) AS Approved_Reports,
        COUNT(DISTINCT CASE WHEN r.status = 'Declined' THEN r.report_id END) AS Declined_Reports
      FROM plans p
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN reports r ON p.plan_id = r.plan_id
      ${whereClause}
    `;

    con.query(summaryQuery, filterValues, (err, results) => {
      if (err) {
        console.error("Error fetching summary:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching summary statistics.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      const summary = results[0] || {};

      res.status(200).json({
        success: true,
        message: "Summary statistics fetched successfully",
        data: {
          totalCompletedPlans: summary.Total_Completed_Plans || 0,
          departmentsInvolved: summary.Departments_Involved || 0,
          goalsCovered: summary.Goals_Covered || 0,
          objectivesCovered: summary.Objectives_Covered || 0,
          executionMetrics: {
            average: parseFloat(summary.Average_Execution_Percentage) || 0,
            minimum: parseFloat(summary.Min_Execution_Percentage) || 0,
            maximum: parseFloat(summary.Max_Execution_Percentage) || 0,
          },
          planProgress: {
            fullyCompleted: summary.Fully_Completed_Plans || 0,
            onGoing: summary.On_Going_Plans || 0,
            started: summary.Started_Plans || 0,
          },
          approvalStatus: {
            approved: summary.Approved_Plans || 0,
            declined: summary.Declined_Plans || 0,
          },
          reportMetrics: {
            totalSubmitted: summary.Total_Reports_Submitted || 0,
            approved: summary.Approved_Reports || 0,
            declined: summary.Declined_Reports || 0,
          },
        },
        filters: {
          year: year || null,
          quarter: quarter || null,
          department: department || null,
        },
      });
    });
  } catch (error) {
    console.error("Error in getCompletedPlansSummary:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

// Get completed plans by department
const getCompletedPlansByDepartment = async (req, res) => {
  try {
    const { year, quarter } = req.query;

    let filterConditions = ["p.report_progress = 'completed'", "p.status = 'Approved'"];
    let filterValues = [];

    if (year) {
      filterConditions.push("g.year = ?");
      filterValues.push(year);
    }

    if (quarter) {
      filterConditions.push("g.quarter = ?");
      filterValues.push(quarter);
    }

    const whereClause = filterConditions.length
      ? `WHERE ${filterConditions.join(" AND ")}`
      : '';

    const departmentQuery = `
      SELECT 
        d.department_id AS Department_ID,
        d.name AS Department_Name,
        COUNT(DISTINCT p.plan_id) AS Total_Plans,
        AVG(sod.execution_percentage) AS Average_Execution_Percentage,
        COUNT(DISTINCT CASE WHEN sod.progress = 'completed' THEN p.plan_id END) AS Completed_Plans,
        COUNT(DISTINCT CASE WHEN aw.status = 'Approved' THEN p.plan_id END) AS Approved_Plans,
        COUNT(DISTINCT r.report_id) AS Total_Reports
      FROM plans p
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN reports r ON p.plan_id = r.plan_id
      ${whereClause}
      GROUP BY d.department_id, d.name
      ORDER BY Total_Plans DESC
    `;

    con.query(departmentQuery, filterValues, (err, results) => {
      if (err) {
        console.error("Error fetching department statistics:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching department statistics.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      res.status(200).json({
        success: true,
        message: "Department statistics fetched successfully",
        data: results.map((dept) => ({
          departmentId: dept.Department_ID,
          departmentName: dept.Department_Name,
          totalPlans: dept.Total_Plans,
          averageExecutionPercentage: parseFloat(dept.Average_Execution_Percentage) || 0,
          completedPlans: dept.Completed_Plans,
          approvedPlans: dept.Approved_Plans,
          totalReports: dept.Total_Reports,
        })),
        filters: {
          year: year || null,
          quarter: quarter || null,
        },
      });
    });
  } catch (error) {
    console.error("Error in getCompletedPlansByDepartment:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

// Get completed plans by workflow status (specifically 'completed')
const getCompletedPlansByWorkflow = async (req, res) => {
  try {
    const {
      year,
      quarter,
      department,
      goal_id,
      objective_id,
      specific_objective_id,
      specific_objective_detail_id,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;

    // Build dynamic WHERE clause
    let filterConditions = [];
    let filterValues = [];

    // Filter for completed plans in approval workflow
    filterConditions.push("aw.status = 'completed'");

    // Year filter
    if (year) {
      filterConditions.push("g.year = ?");
      filterValues.push(year);
    }

    // Quarter filter
    if (quarter) {
      filterConditions.push("g.quarter = ?");
      filterValues.push(quarter);
    }

    // Department filter
    if (department) {
      filterConditions.push("d.name = ?");
      filterValues.push(department);
    }

    // Goal filter
    if (goal_id) {
      filterConditions.push("p.goal_id = ?");
      filterValues.push(goal_id);
    }

    // Objective filter
    if (objective_id) {
      filterConditions.push("p.objective_id = ?");
      filterValues.push(objective_id);
    }

    // Specific Objective filter
    if (specific_objective_id) {
      filterConditions.push("p.specific_objective_id = ?");
      filterValues.push(specific_objective_id);
    }

    // Specific Objective Detail filter
    if (specific_objective_detail_id) {
      filterConditions.push("p.specific_objective_detail_id = ?");
      filterValues.push(specific_objective_detail_id);
    }

    // Search filter
    if (search) {
      filterConditions.push(
        "(g.name LIKE ? OR o.name LIKE ? OR so.specific_objective_name LIKE ? OR sod.specific_objective_detailname LIKE ? OR d.name LIKE ?)"
      );
      const searchTerm = `%${search}%`;
      filterValues.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Validate sort parameters
    const allowedSortFields = [
      'p.created_at',
      'p.updated_at',
      'p.plan_id',
      'g.year',
      'sod.execution_percentage',
      'd.name',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'p.created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = filterConditions.length
      ? `WHERE ${filterConditions.join(" AND ")}`
      : '';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Main query to fetch completed plans with all details
    const getCompletedPlansQuery = `
      SELECT 
        p.plan_id AS Plan_ID,
        p.user_id AS User_ID,
        p.department_id AS Department_ID,
        p.supervisor_id AS Supervisor_ID,
        p.employee_id AS Employee_ID,
        p.status AS Plan_Status,
        p.report_status AS Report_Status,
        p.report_progress AS Report_Progress,
        p.editing_status AS Editing_Status,
        p.reporting AS Reporting_Status,
        p.created_at AS Plan_Created_At,
        p.updated_at AS Plan_Updated_At,
        p.year AS Plan_Year,
        p.department_name AS Department_Name,
        
        -- Goal Information
        g.goal_id AS Goal_ID,
        g.name AS Goal_Name,
        g.description AS Goal_Description,
        g.year AS Goal_Year,
        g.quarter AS Goal_Quarter,
        g.created_at AS Goal_Created_At,
        
        -- Objective Information
        o.objective_id AS Objective_ID,
        o.name AS Objective_Name,
        o.description AS Objective_Description,
        o.created_at AS Objective_Created_At,
        
        -- Specific Objective Information
        so.specific_objective_id AS Specific_Objective_ID,
        so.specific_objective_name AS Specific_Objective_Name,
        so.details AS Specific_Objective_Details,
        so.baseline AS Specific_Objective_Baseline,
        so.plan AS Specific_Objective_Plan,
        so.measurement AS Specific_Objective_Measurement,
        so.execution_percentage AS Specific_Objective_Execution_Percentage,
        so.deadline_quarter AS Specific_Objective_Deadline_Quarter,
        so.deadline AS Specific_Objective_Deadline,
        so.priority AS Specific_Objective_Priority,
        so.progress AS Specific_Objective_Progress,
        so.created_at AS Specific_Objective_Created_At,
        
        -- Specific Objective Detail Information
        sod.specific_objective_detail_id AS Specific_Objective_Detail_ID,
        sod.specific_objective_detailname AS Specific_Objective_Detail_Name,
        sod.details AS Specific_Objective_Detail_Details,
        sod.baseline AS Specific_Objective_Detail_Baseline,
        sod.plan AS Specific_Objective_Detail_Plan,
        sod.measurement AS Specific_Objective_Detail_Measurement,
        sod.execution_percentage AS Specific_Objective_Detail_Execution_Percentage,
        sod.outcome AS Specific_Objective_Detail_Outcome,
        sod.deadline AS Specific_Objective_Detail_Deadline,
        sod.status AS Specific_Objective_Detail_Status,
        sod.priority AS Specific_Objective_Detail_Priority,
        sod.progress AS Specific_Objective_Detail_Progress,
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
        sod.created_by AS Created_By,
        sod.created_at AS Specific_Objective_Detail_Created_At,
        
        -- Department Information
        d.name AS Department_Name,
        
        -- Employee Information
        e.name AS Employee_Name,
        e.fname AS Employee_First_Name,
        e.lname AS Employee_Last_Name,
        e.email AS Employee_Email,
        
        -- Supervisor Information
        sup.name AS Supervisor_Name,
        sup.fname AS Supervisor_First_Name,
        sup.lname AS Supervisor_Last_Name,
        sup.email AS Supervisor_Email,
        
        -- Approval Information
        aw.approvalworkflow_id AS Approval_ID,
        aw.status AS Approval_Status,
        aw.comment AS Approval_Comment,
        aw.approval_date AS Approval_Date,
        aw.approved_at AS Approved_At,
        aw.rating AS Approval_Rating,
        
        -- Report Information
        r.report_id AS Report_ID,
        r.report_content AS Report_Content,
        r.status AS Report_Status_Detail,
        r.created_at AS Report_Created_At,
        r.updated_at AS Report_Updated_At,
        
        -- Count of attachments
        COUNT(DISTINCT ra.attachment_id) AS Attachment_Count
        
      FROM plans p
      LEFT JOIN departments d ON p.department_id = d.department_id
      LEFT JOIN employees e ON p.employee_id = e.employee_id
      LEFT JOIN employees sup ON p.supervisor_id = sup.employee_id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      LEFT JOIN reports r ON p.plan_id = r.plan_id
      LEFT JOIN report_attachments ra ON r.report_id = ra.report_id
      ${whereClause}
      GROUP BY p.plan_id
      ORDER BY ${sortField} ${order}
      LIMIT ? OFFSET ?
    `;

    filterValues.push(parseInt(limit), parseInt(offset));

    // Execute main query
    con.query(getCompletedPlansQuery, filterValues, async (err, results) => {
      if (err) {
        console.error("Error fetching completed plans by workflow:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching completed plans from the database.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No completed plans found matching the criteria.",
          error_code: "NO_PLANS_FOUND",
          data: [],
        });
      }

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(DISTINCT p.plan_id) AS total_count
        FROM plans p
        LEFT JOIN departments d ON p.department_id = d.department_id
        LEFT JOIN goals g ON p.goal_id = g.goal_id
        LEFT JOIN objectives o ON p.objective_id = o.objective_id
        LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
        LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
        LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        ${whereClause}
      `;

      con.query(countQuery, filterValues.slice(0, -2), (countErr, countResults) => {
        if (countErr) {
          console.error("Error getting total count:", countErr.message);
        }

        const totalCount = countResults && countResults.length > 0 ? countResults[0].total_count : 0;
        const totalPages = Math.ceil(totalCount / parseInt(limit));

        // Format and enhance results
        const formattedResults = results.map((plan) => ({
          plan: {
            id: plan.Plan_ID,
            userId: plan.User_ID,
            departmentId: plan.Department_ID,
            supervisorId: plan.Supervisor_ID,
            employeeId: plan.Employee_ID,
            status: plan.Plan_Status,
            reportStatus: plan.Report_Status,
            reportProgress: plan.Report_Progress,
            editingStatus: plan.Editing_Status,
            reportingStatus: plan.Reporting_Status,
            createdAt: plan.Plan_Created_At,
            updatedAt: plan.Plan_Updated_At,
            year: plan.Plan_Year,
            departmentName: plan.Department_Name,
          },
          goal: {
            id: plan.Goal_ID,
            name: plan.Goal_Name,
            description: plan.Goal_Description,
            year: plan.Goal_Year,
            quarter: plan.Goal_Quarter,
            createdAt: plan.Goal_Created_At,
          },
          objective: {
            id: plan.Objective_ID,
            name: plan.Objective_Name,
            description: plan.Objective_Description,
            createdAt: plan.Objective_Created_At,
          },
          specificObjective: {
            id: plan.Specific_Objective_ID,
            name: plan.Specific_Objective_Name,
            details: plan.Specific_Objective_Details,
            baseline: plan.Specific_Objective_Baseline,
            plan: plan.Specific_Objective_Plan,
            measurement: plan.Specific_Objective_Measurement,
            executionPercentage: plan.Specific_Objective_Execution_Percentage,
            deadlineQuarter: plan.Specific_Objective_Deadline_Quarter,
            deadline: plan.Specific_Objective_Deadline,
            priority: plan.Specific_Objective_Priority,
            progress: plan.Specific_Objective_Progress,
            createdAt: plan.Specific_Objective_Created_At,
          },
          specificObjectiveDetail: {
            id: plan.Specific_Objective_Detail_ID,
            name: plan.Specific_Objective_Detail_Name,
            details: plan.Specific_Objective_Detail_Details,
            baseline: plan.Specific_Objective_Detail_Baseline,
            plan: plan.Specific_Objective_Detail_Plan,
            measurement: plan.Specific_Objective_Detail_Measurement,
            executionPercentage: plan.Specific_Objective_Detail_Execution_Percentage,
            outcome: plan.Specific_Objective_Detail_Outcome,
            deadline: plan.Specific_Objective_Detail_Deadline,
            status: plan.Specific_Objective_Detail_Status,
            priority: plan.Specific_Objective_Detail_Priority,
            progress: plan.Specific_Objective_Detail_Progress,
            planType: plan.Plan_Type,
            incomeExchange: plan.Income_Exchange,
            costType: plan.Cost_Type,
            employmentType: plan.Employment_Type,
            incomeName: plan.Income_Name,
            costName: plan.Cost_Name,
            ciBaseline: plan.CI_Baseline,
            ciPlan: plan.CI_Plan,
            ciOutcome: plan.CI_Outcome,
            ciExecutionPercentage: plan.CI_Execution_Percentage,
            createdBy: plan.Created_By,
            createdAt: plan.Specific_Objective_Detail_Created_At,
          },
          department: {
            name: plan.Department_Name,
          },
          employee: {
            name: plan.Employee_Name,
            firstName: plan.Employee_First_Name,
            lastName: plan.Employee_Last_Name,
            email: plan.Employee_Email,
          },
          supervisor: {
            name: plan.Supervisor_Name,
            firstName: plan.Supervisor_First_Name,
            lastName: plan.Supervisor_Last_Name,
            email: plan.Supervisor_Email,
          },
          approval: {
            id: plan.Approval_ID,
            status: plan.Approval_Status,
            comment: plan.Approval_Comment,
            approvalDate: plan.Approval_Date,
            approvedAt: plan.Approved_At,
            rating: plan.Approval_Rating,
          },
          report: {
            id: plan.Report_ID,
            content: plan.Report_Content,
            status: plan.Report_Status_Detail,
            createdAt: plan.Report_Created_At,
            updatedAt: plan.Report_Updated_At,
            attachmentCount: plan.Attachment_Count,
          },
        }));

        res.status(200).json({
          success: true,
          message: "Completed plans fetched successfully",
          data: formattedResults,
          pagination: {
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
            totalCount: totalCount,
            totalPages: totalPages,
            hasNextPage: parseInt(page) < totalPages,
            hasPreviousPage: parseInt(page) > 1,
          },
          filters: {
            year: year || null,
            quarter: quarter || null,
            department: department || null,
            goalId: goal_id || null,
            objectiveId: objective_id || null,
            specificObjectiveId: specific_objective_id || null,
            specificObjectiveDetailId: specific_objective_detail_id || null,
            search: search || null,
          },
          sorting: {
            sortBy: sortField,
            sortOrder: order,
          },
        });
      });
    });
  } catch (error) {
    console.error("Error in getCompletedPlansByWorkflow:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred. ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

module.exports = {
  getCompletedPlansAdvanced,
  getCompletedPlansSummary,
  getCompletedPlansByDepartment,
  getCompletedPlansByWorkflow,
};
