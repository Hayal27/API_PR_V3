const jwt = require("jsonwebtoken");
const con = require("../models/db");
const approvalWorkflowModel = require("../models/approvalWorkflowModel");
const { addApprovalHistory, updateCurrentStepStatus } = require("./approvalHistoryController");
const NotificationService = require("../services/notificationService");
const util = require('util');

// Helper function to verify JWT token and extract user_id
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, 'hayaltamrat@27', (err, decoded) => {
      if (err) {
        return reject(new Error('Invalid or expired token'));
      }
      resolve(decoded.user_id); // Returns the user_id from the decoded token
    });
  });
};

// Function to validate input for updating the approval status
const validateApprovalInput = (status, comment) => {
  const validStatuses = ['Approved', 'Declined'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status. Only "Approved" or "Declined" are allowed.');
  }

  if (!comment || comment.trim().length === 0) {
    throw new Error('Comment is required and cannot be empty.');
  }
};






// Helper to promisify db.query
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// Helper to recursively get all subordinate employee IDs
const getAllSubordinates = async (supervisorId) => {
  try {
    const sql = "SELECT employee_id, supervisor_id FROM employees";
    const employees = await query(sql);

    const subordinates = new Set();
    const queue = [supervisorId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      // Find direct reports
      const directReports = employees.filter(e => e.supervisor_id === currentId && e.employee_id !== currentId);

      for (const report of directReports) {
        if (!subordinates.has(report.employee_id)) {
          subordinates.add(report.employee_id);
          queue.push(report.employee_id);
        }
      }
    }

    return Array.from(subordinates);
  } catch (err) {
    console.error("Error fetching subordinates:", err);
    return [];
  }
};

const getSubmittedPlans = async (req, res) => {
  // Extract token from Authorization header
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    console.error("Error: No token provided in the request headers.");
    return res.status(403).json({
      success: false,
      message: "No token provided. Authorization token is required to access the plans.",
      error_code: "TOKEN_MISSING",
    });
  }

  try {
    const user_id = await verifyToken(token); // Get user_id from token
    console.log(`Decoded user_id from token: ${user_id}`);

    // Query to fetch employee_id for the given user_id from the users table
    const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
    const employeeResults = await query(getEmployeeQuery, [user_id]);

    if (employeeResults.length === 0) {
      console.error(`No employee found for user_id: ${user_id}`);
      return res.status(404).json({
        success: false,
        message: "Employee not found. Unable to fetch employee details based on the provided user_id.",
        error_code: "EMPLOYEE_NOT_FOUND",
      });
    }

    const supervisor_id = employeeResults[0].employee_id;
    console.log(`Supervisor ID fetched: ${supervisor_id}`);

    // Get all subordinates (direct and indirect)
    const subordinateIds = await getAllSubordinates(supervisor_id);
    console.log(`Found ${subordinateIds.length} subordinates for supervisor ${supervisor_id}`);

    // Get user_ids for these subordinates to filter plans by creator
    let subordinateUserIds = [];
    if (subordinateIds.length > 0) {
      const userQuery = "SELECT user_id FROM users WHERE employee_id IN (?)";
      const users = await query(userQuery, [subordinateIds]);
      subordinateUserIds = users.map(u => u.user_id);
    }

    // Build the WHERE clause
    // We want plans where:
    // 1. The current user is the approver (aw.approver_id = supervisor_id)
    // OR
    // 2. The plan owner is a subordinate (p.user_id IN subordinateUserIds)

    let whereClause = `
      WHERE p.reporting = 'deactivate'
        AND aw.status = 'Pending'
        AND (aw.approver_id = ?
    `;

    const queryParams = [supervisor_id];

    if (subordinateUserIds.length > 0) {
      whereClause += ` OR p.user_id IN (?)`;
      queryParams.push(subordinateUserIds);
    }

    whereClause += `)`;

    // SQL query to fetch detailed plans
    const sql = `
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
          sod.status,
          sod.priority,
          p.department_id,
          COALESCE(os.name_amharic, os.name) AS org_node_name,
          COALESCE(os.name_amharic, os.name) AS department_name,
          os.type AS org_node_type,
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
          sod.editing_status,
          sod.reporting,
          p.goal_id,
          o.name AS objective_name,
          g.name AS goal_name,
          so.specific_objective_name,
          e.fname,
          e.lname,
          e.name AS employee_name,
          CASE WHEN aw.approver_id = ? THEN 1 ELSE 0 END as is_approver
        FROM plans p
        JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN employee_positions ep2 ON e.employee_id = ep2.employee_id AND ep2.is_primary = 1
        LEFT JOIN organization_structure os ON COALESCE(p.department_id, ep2.org_node_id, e.department_id) = os.id
        JOIN objectives o ON p.objective_id = o.objective_id
        JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
        JOIN goals g ON p.goal_id = g.goal_id
        JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
        ${whereClause}
      `;

    // Add supervisor_id again for the is_approver check
    queryParams.push(supervisor_id);

    // Reorder params: supervisor_id (for WHERE), subordinateUserIds (for WHERE), supervisor_id (for SELECT)
    // Wait, the params order must match the ? placeholders.
    // SELECT ... CASE WHEN aw.approver_id = ? ... WHERE ... aw.approver_id = ? ...
    // So: [supervisor_id (SELECT), supervisor_id (WHERE), subordinateUserIds (WHERE)]

    const finalParams = [supervisor_id, supervisor_id];
    if (subordinateUserIds.length > 0) {
      finalParams.push(subordinateUserIds);
    }

    const results = await query(sql, finalParams);

    console.log(`Query returned ${results ? results.length : 0} plans for supervisor ${supervisor_id}`);

    if (!results || results.length === 0) {
      // It's okay to return empty list instead of 404 if just no plans found
      return res.json({ success: true, plans: [] });
    }

    // Filter out any columns with null values from each row
    const filteredResults = results.map(row =>
      Object.fromEntries(Object.entries(row).filter(([key, value]) => value !== null))
    );

    res.json({ success: true, plans: filteredResults });

  } catch (error) {
    console.error("Error in getSubmittedPlans:", error);
    res.status(500).json({
      success: false,
      message: `Error fetching submitted plans: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};




const getSubmittedreports = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "No token provided. Authorization token is required to access the plans.",
      error_code: "TOKEN_MISSING",
    });
  }

  try {
    const user_id = await verifyToken(token);

    const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
    con.query(getEmployeeQuery, [user_id], (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching employee_id from users table.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee not found. Unable to fetch employee details based on the provided user_id.",
          error_code: "EMPLOYEE_NOT_FOUND",
        });
      }

      const supervisor_id = results[0].employee_id;

      const query = `
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
          sod.status,
          sod.priority,
          p.department_id,
          COALESCE(os.name_amharic, os.name) AS org_node_name,
          COALESCE(os.name_amharic, os.name) AS department_name,
          os.type AS org_node_type,
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
          sod.editing_status,
          sod.reporting,
          p.goal_id,
          o.name AS objective_name,
          g.name AS goal_name,
          so.specific_objective_name,
          e.fname,
          e.lname,
          e.name AS employee_name,
          rf.file_name,
          rf.file_path
        FROM plans p
        JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN employee_positions ep2 ON e.employee_id = ep2.employee_id AND ep2.is_primary = 1
        LEFT JOIN organization_structure os ON COALESCE(p.department_id, ep2.org_node_id, e.department_id) = os.id
        JOIN objectives o ON p.objective_id = o.objective_id
        JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
        JOIN goals g ON p.goal_id = g.goal_id
        JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
        LEFT JOIN reportfile rf ON sod.specific_objective_detail_id = rf.specific_objective_id
        WHERE p.supervisor_id = ? 
          AND aw.approver_id = ? 
          AND aw.status = 'Pending'
          AND aw.report_status = 'pending'
      `;

      con.query(query, [supervisor_id, supervisor_id], (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error fetching plans from database.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }

        if (!results || results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No plans found awaiting approval for this supervisor.",
            error_code: "NO_PLANS_FOUND",
          });
        }

        const groupedPlans = {};
        results.forEach(row => {
          const planId = row.plan_id;
          const fullFilePath = row.file_path ? `${req.protocol}://${req.get("host")}${row.file_path}` : null;

          if (!groupedPlans[planId]) {
            const { file_name, file_path, ...planData } = row;
            groupedPlans[planId] = {
              ...planData,
              files: []
            };
            if (file_name && fullFilePath) {
              groupedPlans[planId].files.push({
                file_name,
                file_path: fullFilePath
              });
            }
          } else {
            if (row.file_name && fullFilePath) {
              groupedPlans[planId].files.push({
                file_name: row.file_name,
                file_path: fullFilePath
              });
            }
          }
        });

        const finalResults = Object.values(groupedPlans);
        res.json({ success: true, plans: finalResults });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Unknown error occurred while fetching submitted plans. Error: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};






// Update the status of a plan (Approve or Decline)
const updatePlanStatus = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Authorization token is required to update the plan status.",
        error_code: "TOKEN_MISSING",
      });
    }

    // Verify token and get user_id
    const user_id = await verifyToken(token);

    // Fetch supervisor_id (employee_id from users table)
    const getEmployeeQuery = `SELECT employee_id FROM users WHERE user_id = ?`;
    con.query(getEmployeeQuery, [user_id], async (err, results) => {
      if (err) {
        console.error("Error fetching supervisor_id from users table:", err.message);
        return res.status(500).json({
          success: false,
          message: "Database error while fetching supervisor ID.",
          error_code: "DB_ERROR",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Supervisor not found.",
          error_code: "SUPERVISOR_NOT_FOUND",
        });
      }

      const supervisor_id = results[0].employee_id;
      const { plan_id, status, comment } = req.body;




      // Check if the plan exists and is pending approval
      const planCheckQuery = `
        SELECT p.plan_id, aw.status, p.employee_id, p.supervisor_id
        FROM plans p
        JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        WHERE p.plan_id = ? AND aw.approver_id = ? AND aw.status = 'Pending'
      `;

      con.query(planCheckQuery, [plan_id, supervisor_id], (err, results) => {
        if (err) {
          console.error("Error checking plan existence:", err.message);
          return res.status(500).json({
            success: false,
            message: "Database error while checking plan status.",
            error_code: "DB_ERROR",
          });
        }

        if (results.length === 0) {
          console.error("Plan not found or not pending approval:", { plan_id, supervisor_id });
          return res.status(404).json({
            success: false,
            message: "Plan not found or not pending approval.",
            error_code: "PLAN_NOT_FOUND",
          });
        }

        const planDetails = results[0];

        // Update the approval status in approvalworkflow
        const updateApprovalQuery = `
          UPDATE approvalworkflow
          SET status = ?, comment = ?, approval_date = NOW()
          WHERE plan_id = ? AND approver_id = ?
        `;

        con.query(updateApprovalQuery, [status, comment, plan_id, supervisor_id], async (err) => {
          if (err) {
            console.error("Error updating approval status:", err.message);
            return res.status(500).json({
              success: false,
              message: "Database error while updating approval status.",
              error_code: "DB_ERROR",
            });
          }

          // Trigger Telegram/In-app notification
          try {
            const queryPromise = util.promisify(con.query).bind(con);
            const planRows = await queryPromise(`
              SELECT p.plan_id, g.name as goal_name, p.user_id
              FROM plans p
              JOIN goals g ON p.goal_id = g.goal_id
              WHERE p.plan_id = ?
            `, [plan_id]);

            const approverRows = await queryPromise(`
              SELECT CONCAT(fname, ' ', lname) as full_name FROM employees WHERE employee_id = ?
            `, [supervisor_id]);
            
            if (planRows.length > 0) {
              const planData = planRows[0];
              const changedBy = approverRows.length ? approverRows[0].full_name : 'Supervisor';
              NotificationService.createStatusChangeNotification(planData, 'Pending', status, changedBy).catch(err => 
                console.error('Notification error (non-fatal):', err)
              );
            }
          } catch (notifErr) {
            console.error('Failed to trigger status change notification:', notifErr);
          }

          // Get approver details for history tracking
          const getApproverDetailsQuery = `
            SELECT e.name, r.role_name, u.user_id, u.fname, u.lname
            FROM employees e
            JOIN users u ON e.employee_id = u.employee_id
            JOIN roles r ON u.role_id = r.role_id
            WHERE e.employee_id = ?
          `;

          con.query(getApproverDetailsQuery, [supervisor_id], async (err, approverResults) => {
            if (err) {
              console.error("Error fetching approver details:", err.message);
              // Continue without history tracking if this fails
            }

            let approverName = "Unknown";
            let approverRole = "Unknown";
            let currentUserId = user_id;
            let currentUserName = "Unknown";

            if (approverResults && approverResults.length > 0) {
              const approver = approverResults[0];
              approverName = approver.name || `${approver.fname} ${approver.lname}`;
              approverRole = approver.role_name;
              currentUserId = approver.user_id;
              currentUserName = approverName;
            }

            // Get plan creator details
            const getPlanCreatorQuery = `
              SELECT u.user_id, u.fname, u.lname, e.name as employee_name
              FROM plans p
              JOIN users u ON p.user_id = u.user_id
              LEFT JOIN employees e ON u.employee_id = e.employee_id
              WHERE p.plan_id = ?
            `;

            con.query(getPlanCreatorQuery, [plan_id], async (err, creatorResults) => {
              let createdByUserId = currentUserId;
              let createdByName = currentUserName;

              if (!err && creatorResults && creatorResults.length > 0) {
                const creator = creatorResults[0];
                createdByUserId = creator.user_id;
                createdByName = creator.employee_name || `${creator.fname} ${creator.lname}`;
              }

              // Get current step number
              const getStepNumberQuery = `
                SELECT COALESCE(MAX(step_number), 0) + 1 as next_step
                FROM approval_workflow_history
                WHERE plan_id = ?
              `;

              con.query(getStepNumberQuery, [plan_id], async (err, stepResults) => {
                let stepNumber = 1;
                if (!err && stepResults && stepResults.length > 0) {
                  stepNumber = stepResults[0].next_step;
                }

                // Update current step status to false for all previous steps
                try {
                  await updateCurrentStepStatus(plan_id);
                } catch (historyErr) {
                  console.error("Error updating current step status:", historyErr);
                }

                // Add approval history entry
                try {
                  await addApprovalHistory(
                    plan_id,
                    supervisor_id,
                    approverName,
                    approverRole,
                    status,
                    comment || "No comment provided",
                    stepNumber,
                    1, // is_current_step
                    createdByUserId,
                    createdByName
                  );
                } catch (historyErr) {
                  console.error("Error adding approval history:", historyErr);
                  // Continue without failing the approval process
                }

                if (status === "Approved") {
                  // Fetch next supervisor for approval
                  const getNextSupervisorQuery = `
                    SELECT supervisor_id FROM employees WHERE employee_id = ?
                  `;
                  con.query(getNextSupervisorQuery, [planDetails.supervisor_id], (err, supervisorResults) => {
                    if (err) {
                      console.error("Error fetching next supervisor:", err.message);
                      return res.status(500).json({
                        success: false,
                        message: "Database error while fetching next supervisor.",
                        error_code: "DB_ERROR",
                      });
                    }

                    if (supervisorResults.length > 0) {
                      const nextSupervisorId = supervisorResults[0].supervisor_id;

                      // Add next supervisor to approvalworkflow
                      const insertApprovalWorkflowQuery = `
                        INSERT INTO approvalworkflow (plan_id, approver_id, status)
                        VALUES (?, ?, 'Pending')
                      `;

                      con.query(insertApprovalWorkflowQuery, [plan_id, nextSupervisorId], (err) => {
                        if (err) {
                          console.error("Error creating next approval workflow:", err.message);
                          return res.status(500).json({
                            success: false,
                            message: "Database error while creating next approval workflow.",
                            error_code: "DB_ERROR",
                          });
                        }

                        // Update plan with next supervisor
                        const updatePlanQuery = `
                          UPDATE plans
                          SET employee_id = ?, supervisor_id = ?
                          WHERE plan_id = ?
                        `;
                        con.query(updatePlanQuery, [nextSupervisorId, nextSupervisorId, plan_id], (err) => {
                          if (err) {
                            console.error("Error updating plan with next supervisor:", err.message);
                            return res.status(500).json({
                              success: false,
                              message: "Database error while updating plan with next supervisor.",
                              error_code: "DB_ERROR",
                            });
                          }

                          return res.status(200).json({
                            success: true,
                            message: "approved",
                          });
                        });
                      });
                    } else {
                      // Finalize the plan
                      const finalizePlanQuery = `
                        UPDATE plans
                        SET status = 'Approved'
                        WHERE plan_id = ?
                      `;
                      con.query(finalizePlanQuery, [plan_id], (err) => {
                        if (err) {
                          console.error("Error finalizing plan approval:", err.message);
                          return res.status(500).json({
                            success: false,
                            message: "Database error while finalizing plan approval.",
                            error_code: "DB_ERROR",
                          });
                        }

                        return res.status(200).json({
                          success: true,
                          message: "Plan fully approved. No further supervisors required.",
                        });
                      });
                    }
                  });
                } else if (status === "Declined") {
                  // Decline the plan and restore original supervisor
                  const restorePlanQuery = `
                    UPDATE plans
                    SET employee_id = ?, supervisor_id = ?
                    WHERE plan_id = ?
                  `;
                  con.query(restorePlanQuery, [planDetails.employee_id, planDetails.supervisor_id, plan_id], (err, result) => {
                    if (err) {
                      console.error("Error restoring plan details:", err.message);
                      return res.status(500).json({
                        success: false,
                        message: "Database error while restoring plan details.",
                        error_code: "DB_ERROR",
                      });
                    }

                    if (result.affectedRows === 0) {
                      console.error("No rows were updated, plan might not exist.");
                      return res.status(404).json({
                        success: false,
                        message: "Plan not found or could not be declined.",
                        error_code: "PLAN_NOT_FOUND",
                      });
                    }

                    // Successfully declined and reverted the supervisor
                    return res.status(200).json({
                      success: true,
                      message: "Plan declined and reverted to original supervisor.",
                    });
                  });
                }
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in updatePlanStatus:", error.message);
    res.status(500).json({
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};



const updateReportStatus = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Authorization token is required to update the plan status.",
        error_code: "TOKEN_MISSING",
      });
    }

    // Verify token and get user_id
    const user_id = await verifyToken(token);

    // Fetch supervisor_id (employee_id from users table)
    const getEmployeeQuery = `SELECT employee_id FROM users WHERE user_id = ?`;
    con.query(getEmployeeQuery, [user_id], async (err, results) => {
      if (err) {
        console.error("Error fetching supervisor_id from users table:", err.message);
        return res.status(500).json({
          success: false,
          message: "Database error while fetching supervisor ID.",
          error_code: "DB_ERROR",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Supervisor not found.",
          error_code: "SUPERVISOR_NOT_FOUND",
        });
      }

      const supervisor_id = results[0].employee_id;
      const { plan_id, status, comment } = req.body;

      // Input validation
      try {
        validateApprovalInput(status, comment);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message,
          error_code: "VALIDATION_ERROR",
        });
      }

      // Check if the plan exists and is pending approval
      const planCheckQuery = `
        SELECT p.plan_id, aw.status, p.employee_id, p.supervisor_id
        FROM plans p
        JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        WHERE p.plan_id = ? AND aw.approver_id = ? AND aw.status = 'Pending'
      `;

      con.query(planCheckQuery, [plan_id, supervisor_id], (err, results) => {
        if (err) {
          console.error("Error checking plan existence:", err.message);
          return res.status(500).json({
            success: false,
            message: "Database error while checking plan status.",
            error_code: "DB_ERROR",
          });
        }

        if (results.length === 0) {
          console.error("Plan not found or not pending approval:", {
            plan_id,
            supervisor_id,
          });
          return res.status(404).json({
            success: false,
            message: "Plan not found or not pending approval.",
            error_code: "PLAN_NOT_FOUND",
          });
        }

        const planDetails = results[0];

        // Update the approval status in approvalworkflow
        const updateApprovalQuery = `
          UPDATE approvalworkflow
          SET status = ?, comment = ?, approval_date = NOW()
          WHERE plan_id = ? AND approver_id = ?
        `;

        con.query(updateApprovalQuery, [status, comment, plan_id, supervisor_id], (err) => {
          if (err) {
            console.error("Error updating approval status:", err.message);
            return res.status(500).json({
              success: false,
              message: "Database error while updating approval status.",
              error_code: "DB_ERROR",
            });
          }

          if (status === "Approved") {
            // Fetch next supervisor for approval
            const getNextSupervisorQuery = `
              SELECT supervisor_id FROM employees WHERE employee_id = ?
            `;
            con.query(getNextSupervisorQuery, [planDetails.supervisor_id], (err, supervisorResults) => {
              if (err) {
                console.error("Error fetching next supervisor:", err.message);
                return res.status(500).json({
                  success: false,
                  message: "Database error while fetching next supervisor.",
                  error_code: "DB_ERROR",
                });
              }

              if (supervisorResults.length > 0) {
                const nextSupervisorId = supervisorResults[0].supervisor_id;

                // Add next supervisor to approvalworkflow
                const insertApprovalWorkflowQuery = `
                  INSERT INTO approvalworkflow (plan_id, approver_id, status)
                  VALUES (?, ?, 'Pending')
                `;

                con.query(insertApprovalWorkflowQuery, [plan_id, nextSupervisorId], (err) => {
                  if (err) {
                    console.error("Error creating next approval workflow:", err.message);
                    return res.status(500).json({
                      success: false,
                      message: "Database error while creating next approval workflow.",
                      error_code: "DB_ERROR",
                    });
                  }

                  // Update plan with next supervisor
                  const updatePlanQuery = `
                    UPDATE plans
                    SET employee_id = ?, supervisor_id = ?
                    WHERE plan_id = ?
                  `;
                  con.query(updatePlanQuery, [nextSupervisorId, nextSupervisorId, plan_id], (err) => {
                    if (err) {
                      console.error("Error updating plan with next supervisor:", err.message);
                      return res.status(500).json({
                        success: false,
                        message: "Database error while updating plan with next supervisor.",
                        error_code: "DB_ERROR",
                      });
                    }

                    return res.status(200).json({
                      success: true,
                      message: "approved",
                    });
                  });
                });
              } else {
                // Finalize the plan
                const finalizePlanQuery = `
                  UPDATE plans
                  SET status = 'Approved'
                  WHERE plan_id = ?
                `;
                con.query(finalizePlanQuery, [plan_id], (err) => {
                  if (err) {
                    console.error("Error finalizing plan approval:", err.message);
                    return res.status(500).json({
                      success: false,
                      message: "Database error while finalizing plan approval.",
                      error_code: "DB_ERROR",
                    });
                  }

                  return res.status(200).json({
                    success: true,
                    message: "Plan fully approved. No further supervisors required.",
                  });
                });
              }
            });
          } else if (status === "Declined") {
            // Decline the plan and restore original supervisor
            const restorePlanQuery = `
              UPDATE plans
              SET employee_id = ?, supervisor_id = ?
              WHERE plan_id = ?
            `;
            con.query(restorePlanQuery, [planDetails.employee_id, planDetails.supervisor_id, plan_id], (err) => {
              if (err) {
                console.error("Error restoring plan details:", err.message);
                return res.status(500).json({
                  success: false,
                  message: "Database error while restoring plan details.",
                  error_code: "DB_ERROR",
                });
              }

              return res.status(200).json({
                success: true,
                message: "Plan declined and reverted to original supervisor.",
              });
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("Error in updatePlanStatus:", error.message);
    res.status(500).json({
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};








// Fetch detailed plan for the next supervisor
const getDetailedPlanForSupervisor = async (req, res) => {
  const { plan_id } = req.params; // Get the plan_id from the URL params
  const token = req.headers["authorization"]?.split(" ")[1]; // Get token from the Authorization header

  // Check if the token is missing
  if (!token) {
    console.error("Token is missing in the request header.");
    return res.status(403).json({
      success: false,
      message: "Authorization token is required.",
      error_code: "TOKEN_MISSING"
    });
  }

  try {
    // Verify the token and extract the user_id (assuming user_id is embedded in the token)
    const user_id = await verifyToken(token); // Extract user_id from JWT token

    if (!user_id) {
      console.error("Failed to verify token. No user_id returned.");
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
        error_code: "TOKEN_INVALID"
      });
    }
    console.log(`Successfully verified user_id: ${user_id}`);

    // Query to get the employee_id from the users table using the user_id
    const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
    console.log(`Executing query: ${getEmployeeQuery} with user_id: ${user_id}`);

    con.query(getEmployeeQuery, [user_id], (err, results) => {
      if (err) {
        console.error("Error fetching employee_id from users table:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching employee_id from users table.",
          error_code: "DB_ERROR",
          error: err.message
        });
      }

      if (results.length === 0) {
        console.warn("No employee record found for user_id:", user_id);
        return res.status(404).json({
          success: false,
          message: "Employee not found. Unable to fetch details based on the provided user_id.",
          error_code: "EMPLOYEE_NOT_FOUND"
        });
      }

      const supervisor_id = results[0].employee_id; // Get the employee_id of the supervisor
      console.log(`Fetched supervisor_id: ${supervisor_id}`);

      // Query to get the detailed plan and approval workflow for the supervisor
      const detailedPlanQuery = `
        SELECT p.plan_id, p.objective, p.goal, p.details, aw.status, aw.comment
        FROM plans p
        JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        WHERE p.plan_id = ? AND aw.approver_id = ?;
      `;

      console.log(`Executing query: ${detailedPlanQuery} with plan_id: ${plan_id} and supervisor_id: ${supervisor_id}`);
      con.query(detailedPlanQuery, [plan_id, supervisor_id], (err, planResults) => {
        if (err) {
          console.error("Error fetching detailed plan from database:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching detailed plan from database.",
            error_code: "DB_ERROR",
            error: err.message
          });
        }

        if (planResults.length === 0) {
          console.warn(`No plan found for plan_id: ${plan_id} assigned to supervisor_id: ${supervisor_id}`);
          return res.status(404).json({
            success: false,
            message: "Plan not found or not assigned to you for approval.",
            error_code: "PLAN_NOT_FOUND"
          });
        }

        // Log the fetched plan details for debugging
        console.log("Fetched Plan Details:", planResults[0]);

        // Return the detailed plan for the supervisor
        res.json({ success: true, plan: planResults[0] });
      });
    });
  } catch (error) {
    // General error (e.g., invalid token, unknown errors)
    console.error("Unexpected error while fetching detailed plan:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred while fetching detailed plan. Error: ${error.message}`,
      error_code: "UNKNOWN_ERROR"
    });
  }
};




const getSubmittedPlanssp = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "No token provided. Authorization token is required to access the plans.",
      error_code: "TOKEN_MISSING",
    });
  }

  try {
    const user_id = await verifyToken(token);
    console.log(`Verified token. user_id: ${user_id}`);

    const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
    console.log(`Executing query: ${getEmployeeQuery} with user_id: ${user_id}`);

    con.query(getEmployeeQuery, [user_id], (err, results) => {
      if (err) {
        console.error("Error fetching employee_id:", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching employee_id from users table.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        console.warn(`No employee record found for user_id: ${user_id}`);
        return res.status(404).json({
          success: false,
          message: "Employee not found. Unable to fetch employee details based on the provided user_id.",
          error_code: "EMPLOYEE_NOT_FOUND",
        });
      }

      const supervisor_id = results[0].employee_id;
      console.log(`Found supervisor_id: ${supervisor_id}`);

      const query = `
      SELECT p.plan_id, p.objective, p.goal, p.details, aw.status
      FROM plans p
      JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
      WHERE aw.approver_id = ? AND aw.status = 'Pending'
    `;

      con.query(query, [supervisor_id], (err, results) => {
        if (err) {
          console.error("Error fetching plans from database:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching plans from database.",
            error_code: "DB_ERROR",
            error: err.message
          });
        }

        if (results.length === 0) {
          console.warn(`No plans found for approver_id: ${supervisor_id} with Pending status.`);
          return res.status(404).json({
            success: false,
            message: "No plans found awaiting approval for this supervisor.",
            error_code: "NO_PLANS_FOUND"
          });
        }

        console.log("Fetched plans awaiting approval:", results);

        res.json({ success: true, plans: results });
      });

    });
  } catch (error) {
    console.error("Error in getSubmittedPlanssp:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred while fetching submitted plans. Error: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};








const updatePlanApprovalStatus = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Authorization token is required to update the plan status.",
        error_code: "TOKEN_MISSING",
      });
    }

    // Verify token and get user_id
    const user_id = await verifyToken(token);

    // Fetch supervisor_id and role from users table
    const getEmployeeQuery = `
      SELECT u.employee_id, r.role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.role_id 
      WHERE u.user_id = ?
    `;
    con.query(getEmployeeQuery, [user_id], async (err, results) => {
      if (err) {
        console.error("Error fetching supervisor details:", err.message);
        return res.status(500).json({
          success: false,
          message: "Database error while fetching supervisor context.",
          error_code: "DB_ERROR",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User context not found.",
          error_code: "USER_NOT_FOUND",
        });
      }

      const supervisor_id = results[0].employee_id;
      const user_role = results[0].role_name.toLowerCase();
      const isAdminOrExec = ['ceo', 'deputy ceo', 'admin', 'svp', 'vp'].includes(user_role);

      const { plan_id, status, comment } = req.body;

      // Check if the plan exists and is pending approval
      // If user is Admin/Exec, they can approve any pending plan
      let planCheckQuery = `
        SELECT p.plan_id, aw.status, p.employee_id, p.supervisor_id, aw.approver_id
        FROM plans p
        JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        WHERE p.plan_id = ? AND aw.status = 'Pending'
      `;

      const queryParams = [plan_id];
      if (!isAdminOrExec) {
        planCheckQuery += ` AND aw.approver_id = ?`;
        queryParams.push(supervisor_id);
      }

      con.query(planCheckQuery, queryParams, (err, results) => {
        if (err) {
          console.error("Error checking plan existence:", err.message);
          return res.status(500).json({
            success: false,
            message: "Database error while checking plan status.",
            error_code: "DB_ERROR",
          });
        }

        if (results.length === 0) {
          console.error("Plan not found or not pending approval contextually:", { plan_id, supervisor_id, isAdminOrExec });
          return res.status(404).json({
            success: false,
            message: "Plan not found or not pending approval.",
            error_code: "PLAN_NOT_FOUND",
          });
        }

        const planDetails = results[0];
        const actual_approver_id = planDetails.approver_id;

        // Update the approval status in approvalworkflow
        const updateApprovalQuery = `
          UPDATE approvalworkflow
          SET status = ?, comment = ?, approval_date = NOW()
          WHERE plan_id = ? AND approver_id = ?
        `;

        con.query(updateApprovalQuery, [status, comment, plan_id, actual_approver_id], async (err) => {
          if (err) {
            console.error("Error updating approval status:", err.message);
            return res.status(500).json({
              success: false,
              message: "Database error while updating approval status.",
              error_code: "DB_ERROR",
            });
          }

          // Trigger Telegram/In-app notification
          try {
            const queryPromise = util.promisify(con.query).bind(con);
            const planRows = await queryPromise(`
              SELECT p.plan_id, g.name as goal_name, p.user_id
              FROM plans p
              JOIN goals g ON p.goal_id = g.goal_id
              WHERE p.plan_id = ?
            `, [plan_id]);

            const approverRows = await queryPromise(`
              SELECT CONCAT(fname, ' ', lname) as full_name FROM employees WHERE employee_id = ?
            `, [supervisor_id]);
            
            if (planRows.length > 0) {
              const planData = planRows[0];
              const changedBy = approverRows.length ? approverRows[0].full_name : 'Supervisor';
              NotificationService.createStatusChangeNotification(planData, 'Pending', status, changedBy).catch(err => 
                console.error('Notification error (non-fatal):', err)
              );
            }
          } catch (notifErr) {
            console.error('Failed to trigger status change notification:', notifErr);
          }

          if (status === "Approved") {
            // Instead of fetching a next supervisor, update the plans table so that
            // supervisor_id is set to the supervisor of the user (based on users and employees join)
            const updatePlanQuery = `
              UPDATE plans p
              JOIN users u ON p.user_id = u.user_id
              JOIN employees e ON u.employee_id = e.employee_id
              SET p.reporting = 'active', 
                  p.employee_id = e.employee_id,
                  p.supervisor_id = e.supervisor_id
              WHERE p.plan_id = ?
            `;
            con.query(updatePlanQuery, [plan_id], (err) => {
              if (err) {
                console.error("Error updating plan supervisor details:", err.message);
                return res.status(500).json({
                  success: false,
                  message: "Database error while updating plan details.",
                  error_code: "DB_ERROR",
                });
              }
              return res.status(200).json({
                success: true,
                message: "approved"
              });
            });
          } else if (status === "Declined") {
            // Decline the plan and restore original supervisor details
            const restorePlanQuery = `
              UPDATE plans
              SET employee_id = ?, supervisor_id = ?
              WHERE plan_id = ?
            `;
            con.query(restorePlanQuery, [planDetails.employee_id, planDetails.supervisor_id, plan_id], (err) => {
              if (err) {
                console.error("Error restoring plan details:", err.message);
                return res.status(500).json({
                  success: false,
                  message: "Database error while restoring plan details.",
                  error_code: "DB_ERROR",
                });
              }
              return res.status(200).json({
                success: true,
                message: "Plan declined and reverted to original supervisor."
              });
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("Error in updatePlanStatus:", error.message);
    res.status(500).json({
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};








// Function to fetch referred plans for a supervisor
const getReferredPlans = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    console.error("Error: No token provided in the request headers.");
    return res.status(403).json({
      success: false,
      message: "No token provided. Authorization token is required to access the plans.",
      error_code: "TOKEN_MISSING",
    });
  }

  try {
    const user_id = await verifyToken(token);
    console.log(`Decoded user_id from token: ${user_id}`);

    // Query to fetch employee_id for the given user_id from the users table
    const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
    con.query(getEmployeeQuery, [user_id], async (err, results) => {
      if (err) {
        console.error("Database Error (fetching employee_id):", err.message);
        return res.status(500).json({
          success: false,
          message: "Error fetching employee_id from users table.",
          error_code: "DB_ERROR",
          error: err.message,
        });
      }

      if (results.length === 0) {
        console.error(`No employee found for user_id: ${user_id}`);
        return res.status(404).json({
          success: false,
          message: "Employee not found. Unable to fetch employee details based on the provided user_id.",
          error_code: "EMPLOYEE_NOT_FOUND",
        });
      }

      const supervisor_id = results[0].employee_id;
      console.log(`Supervisor ID fetched: ${supervisor_id}`);

      // SQL query to fetch referred plans - only plans where comment contains "Referred from"
      const query = `
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
          sod.status,
          sod.priority,
          p.department_id,
          COALESCE(os.name_amharic, os.name) AS org_node_name,
          COALESCE(os.name_amharic, os.name) AS department_name,
          os.type AS org_node_type,
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
          sod.editing_status,
          sod.reporting,
          p.goal_id,
          o.name AS objective_name,
          g.name AS goal_name,
          so.specific_objective_name,
          aw.status AS approval_status,
          aw.comment,
          aw.approval_date,
          e.fname,
          e.lname,
          e.name AS employee_name
        FROM plans p
        JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        JOIN users u ON p.user_id = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN employee_positions ep2 ON e.employee_id = ep2.employee_id AND ep2.is_primary = 1
        LEFT JOIN organization_structure os ON COALESCE(p.department_id, ep2.org_node_id, e.department_id) = os.id
        JOIN objectives o ON p.objective_id = o.objective_id
        JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
        JOIN goals g ON p.goal_id = g.goal_id
        JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
        WHERE aw.approver_id = ? 
          AND aw.comment LIKE 'Referred from %'
          AND p.reporting = 'deactivate';
      `;

      con.query(query, [supervisor_id], (err, results) => {
        if (err) {
          console.error("Database Error (fetching referred plans):", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching referred plans from database.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }

        console.log(`Query returned ${results ? results.length : 0} referred plans for supervisor ${supervisor_id}`);

        if (!results || results.length === 0) {
          console.warn(`No referred plans found for supervisor_id: ${supervisor_id}`);
          return res.status(200).json({
            success: true,
            message: "No referred plans found for this supervisor.",
            plans: [],
          });
        }

        // Filter out any columns with null values and extract referrer info from comment
        const filteredResults = results.map(row => {
          const cleanRow = Object.fromEntries(Object.entries(row).filter(([key, value]) => value !== null));

          // Extract referrer name from comment (format: "Referred from [Name]")
          if (cleanRow.comment && cleanRow.comment.includes("Referred from")) {
            const referrerMatch = cleanRow.comment.match(/Referred from (.+)/);
            cleanRow.referred_by = referrerMatch ? referrerMatch[1] : "Unknown";
          } else {
            cleanRow.referred_by = "Unknown";
          }

          // Set referral_date from approval_date
          cleanRow.referral_date = cleanRow.approval_date;

          // Ensure referral info is set for the card display
          cleanRow.referred_to_name = cleanRow.referred_by;

          // Extract referral comment if available (from the previous approval entry)
          cleanRow.referral_comment = "";

          return cleanRow;
        });

        console.log(`Referred plans fetched successfully: ${filteredResults.length} plans`);
        res.json({ success: true, plans: filteredResults });
      });
    });
  } catch (error) {
    console.error("Unknown Error:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred while fetching referred plans. Error: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};


// Function to refer a plan to another supervisor
const referPlanToSupervisor = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "No token provided. Authorization token is required.",
      error_code: "TOKEN_MISSING",
    });
  }

  try {
    const user_id = await verifyToken(token);
    const { plan_id, new_supervisor_id, comment } = req.body;

    // Validate input
    if (!plan_id || !new_supervisor_id) {
      return res.status(400).json({
        success: false,
        message: "plan_id and new_supervisor_id are required."
      });
    }

    // Get employee_id from users table first
    const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
    con.query(getEmployeeQuery, [user_id], (err, userResults) => {
      if (err) {
        console.error("Error fetching employee_id from users table:", err);
        return res.status(500).json({
          success: false,
          message: "Error fetching employee details",
          error: err.message
        });
      }

      if (userResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found in users table"
        });
      }

      const referrer_id = userResults[0].employee_id;

      // Get referrer name from employees table
      const getReferrerQuery = "SELECT fname, lname FROM employees WHERE employee_id = ?";
      con.query(getReferrerQuery, [referrer_id], (err, referrerResults) => {
        if (err) {
          console.error("Error fetching referrer details:", err);
          return res.status(500).json({
            success: false,
            message: "Error fetching referrer details",
            error: err.message
          });
        }

        if (referrerResults.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Referrer not found"
          });
        }

        const referrerName = `${referrerResults[0].fname} ${referrerResults[0].lname}`;

        // Check if plan exists
        const checkPlanQuery = "SELECT * FROM plans WHERE plan_id = ?";
        con.query(checkPlanQuery, [plan_id], (err, planResults) => {
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
              message: "Plan not found"
            });
          }

          // Update the current approval workflow to mark as Approved with referral comment
          const updateApprovalQuery = `
            UPDATE approvalworkflow 
            SET status = 'Approved', 
                comment = ?, 
                comment_writer = ?,
                approval_date = NOW()
            WHERE plan_id = ? AND status = 'Pending'
          `;

          const referralComment = `REFERRED by ${referrerName}: ${comment || ''}`;

          con.query(updateApprovalQuery, [referralComment, referrerName, plan_id], (err, updateResult) => {
            if (err) {
              console.error("Error updating approval workflow:", err);
              return res.status(500).json({
                success: false,
                message: "Error updating approval workflow",
                error: err.message
              });
            }

            // Create new approval workflow entry for the new supervisor
            const createNewApprovalQuery = `
              INSERT INTO approvalworkflow (plan_id, approver_id, status, comment, comment_writer, approval_date)
              VALUES (?, ?, 'Pending', ?, '', NOW())
            `;

            const newApprovalComment = `Referred from ${referrerName}`;

            con.query(createNewApprovalQuery, [plan_id, new_supervisor_id, newApprovalComment], (err, insertResult) => {
              if (err) {
                console.error("Error creating new approval workflow:", err);
                return res.status(500).json({
                  success: false,
                  message: "Error creating new approval workflow",
                  error: err.message
                });
              }

              res.json({
                success: true,
                message: "Plan successfully referred to the new supervisor",
                data: {
                  plan_id,
                  referred_to: new_supervisor_id,
                  referred_by: referrerName
                }
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error("Error in referPlanToSupervisor:", error.message);
    res.status(500).json({
      success: false,
      message: `An unexpected error occurred: ${error.message}`,
      error_code: "UNKNOWN_ERROR",
    });
  }
};

module.exports = {
  getSubmittedreports,
  getSubmittedPlans,
  getSubmittedPlanssp,
  updatePlanStatus,
  updateReportStatus,
  getDetailedPlanForSupervisor,
  updatePlanApprovalStatus,
  referPlanToSupervisor,
  getReferredPlans
};








