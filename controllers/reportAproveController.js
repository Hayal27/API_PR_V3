const jwt = require("jsonwebtoken");
const con = require("../models/db");
const approvalWorkflowModel = require("../models/approvalWorkflowModel");
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



const getSubmittedReports = async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "No token provided. Authorization token is required to access the plans.",
      error_code: "TOKEN_MISSING"
    });
  }

  try {
    const user_id = await verifyToken(token); // Get user_id from token

    // Get employee_id from the users table using user_id
    const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
    con.query(getEmployeeQuery, [user_id], async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Error fetching employee_id from users table.",
          error_code: "DB_ERROR",
          error: err.message
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Employee not found. Unable to fetch employee details based on the provided user_id.",
          error_code: "EMPLOYEE_NOT_FOUND"
        });
      }

      const supervisor_id = results[0].employee_id;

      // Query to get plans that are either 'Ongoing' or 'Completed' along with all fields from the specific_goals table
      const query = `
        SELECT 
          p.plan_id, 
          p.details AS plan_details,
          obj.name AS objective_name, 
          g.name AS goal_name, 
          sg.specific_goals_name, 
          sg.details AS specific_goal_details,
          sg.baseline, 
          sg.plan AS specific_goal_plan, 
          sg.execution_percentage,
          sg.outcome,
          sg.measurement, 
          sg.created_at, 
          sg.created_by, 
          sg.year, 
          sg.quarter, 
          sg.month, 
          sg.day, 
          sg.deadline, 
          sg.status AS specific_goal_status, 
          sg.priority, 
          sg.name AS specific_goal_name, 
          sg.description, 
          sg.count, 
          sg.progress, 
          aw.report_status AS approval_status
        FROM plans p
        JOIN ApprovalWorkflow aw ON p.plan_id = aw.plan_id
        JOIN objectives obj ON p.objective_id = obj.objective_id
        JOIN goals g ON p.goal_id = g.id
        JOIN specific_goals sg ON p.specific_goal_id = sg.id
        WHERE p.supervisor_id = ? 
          AND aw.approver_id = ? 
          AND (sg.progress = 'on going' OR sg.progress = 'completed')
      `;

      con.query(query, [supervisor_id, supervisor_id], (err, results) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Error fetching plans from database.",
            error_code: "DB_ERROR",
            error: err.message
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No plans found with progress 'Ongoing' or 'Completed' for this supervisor.",
            error_code: "NO_PLANS_FOUND"
          });
        }

        res.json({ success: true, plans: results });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Unknown error occurred while fetching submitted plans. Error: ${error.message}`,
      error_code: "UNKNOWN_ERROR"
    });
  }
};







// update report status
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
        JOIN ApprovalWorkflow aw ON p.plan_id = aw.plan_id
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

        // Update the approval status in ApprovalWorkflow
        const updateApprovalQuery = `
          UPDATE ApprovalWorkflow
          SET status = ?, comment = ?, approval_date = NOW()
          WHERE report_id = ? AND approver_id = ?
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
              // Use Report status for notification if it's a report approval
              NotificationService.createStatusChangeNotification(planData, 'Pending', `Report ${status}`, changedBy).catch(err => 
                console.error('Notification error (non-fatal):', err)
              );
            }
          } catch (notifErr) {
            console.error('Failed to trigger status change notification:', notifErr);
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

                // Add next supervisor to ApprovalWorkflow
                const insertApprovalWorkflowQuery = `
                  INSERT INTO ApprovalWorkflow (report_id, approver_id, status)
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
        JOIN ApprovalWorkflow aw ON p.plan_id = aw.plan_id
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




// const getSubmittedPlanssp = async (req, res) => {
//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) {
//     return res.status(403).json({
//       success: false,
//       message: "No token provided. Authorization token is required to access the plans.",
//       error_code: "TOKEN_MISSING",
//     });
//   }

//   try {
//     const user_id = await verifyToken(token);
//     console.log(`Verified token. user_id: ${user_id}`);

//     const getEmployeeQuery = "SELECT employee_id FROM users WHERE user_id = ?";
//     console.log(`Executing query: ${getEmployeeQuery} with user_id: ${user_id}`);
    
//     con.query(getEmployeeQuery, [user_id], (err, results) => {
//       if (err) {
//         console.error("Error fetching employee_id:", err.message);
//         return res.status(500).json({
//           success: false,
//           message: "Error fetching employee_id from users table.",
//           error_code: "DB_ERROR",
//           error: err.message,
//         });
//       }

//       if (results.length === 0) {
//         console.warn(`No employee record found for user_id: ${user_id}`);
//         return res.status(404).json({
//           success: false,
//           message: "Employee not found. Unable to fetch employee details based on the provided user_id.",
//           error_code: "EMPLOYEE_NOT_FOUND",
//         });
//       }

//       const supervisor_id = results[0].employee_id;
//       console.log(`Found supervisor_id: ${supervisor_id}`);

//       const query = `
//       SELECT p.plan_id, p.objective, p.goal, p.details, aw.status
//       FROM plans p
//       JOIN ApprovalWorkflow aw ON p.plan_id = aw.plan_id
//       WHERE aw.approver_id = ? AND aw.status = 'Pending'
//     `;
    
//     con.query(query, [supervisor_id], (err, results) => {
//       if (err) {
//         console.error("Error fetching plans from database:", err.message);
//         return res.status(500).json({
//           success: false,
//           message: "Error fetching plans from database.",
//           error_code: "DB_ERROR",
//           error: err.message
//         });
//       }
    
//       if (results.length === 0) {
//         console.warn(`No plans found for approver_id: ${supervisor_id} with Pending status.`);
//         return res.status(404).json({
//           success: false,
//           message: "No plans found awaiting approval for this supervisor.",
//           error_code: "NO_PLANS_FOUND"
//         });
//       }
    
//       console.log("Fetched plans awaiting approval:", results);
    
//       res.json({ success: true, plans: results });
//     });
    
//     });
//   } catch (error) {
//     console.error("Error in getSubmittedPlanssp:", error.message);
//     res.status(500).json({
//       success: false,
//       message: `Unknown error occurred while fetching submitted plans. Error: ${error.message}`,
//       error_code: "UNKNOWN_ERROR",
//     });
//   }
// };





const updatePlanApprovalStatus   = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Authorization token is required to update the plan status.",
        error_code: "TOKEN_MISSING"
      });
    }

    // Verify token and get user_id
    const user_id = await verifyToken(token);

    // Get employee_id from the users table using user_id
    const getEmployeeQuery = `
      SELECT employee_id FROM users WHERE user_id = ?
    `;
    con.query(getEmployeeQuery, [user_id], async (err, results) => {
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
        return res.status(404).json({
          success: false,
          message: "Employee not found. No supervisor data available.",
          error_code: "EMPLOYEE_NOT_FOUND"
        });
      }

      const supervisor_id = results[0].employee_id;
      const { plan_id, status, comment } = req.body;

      // Validate input
      try {
        validateApprovalInput(status, comment);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError.message,
          error_code: "VALIDATION_ERROR"
        });
      }

      // Check if the plan exists and is pending approval
      const planCheckQuery = `
        SELECT p.plan_id, aw.status, p.objective, p.goal, p.details, p.created_by, p.employee_id, p.supervisor_id
        FROM plans p
        JOIN ApprovalWorkflow aw ON p.plan_id = aw.plan_id
        WHERE p.plan_id = ? AND p.supervisor_id = ? AND aw.approver_id = ? AND aw.status = 'Pending'
      `;
      con.query(planCheckQuery, [plan_id, supervisor_id, supervisor_id], (err, results) => {
        if (err) {
          console.error("Error checking plan existence:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error checking plan existence.",
            error_code: "DB_ERROR",
            error: err.message
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Plan not found or not pending approval.",
            error_code: "PLAN_NOT_FOUND"
          });
        }

        const planDetails = results[0];

        // Update approval status in the ApprovalWorkflow table
        const updateApprovalQuery = `
          UPDATE ApprovalWorkflow
          SET status = ?, comment = ?, approval_date = NOW()
          WHERE plan_id = ? AND approver_id = ?
        `;
        con.query(updateApprovalQuery, [status, comment, plan_id, supervisor_id], async (err, result) => {
          if (err) {
            console.error("Error updating approval status:", err.message);
            return res.status(500).json({
              success: false,
              message: "Error updating approval status.",
              error_code: "DB_ERROR",
              error: err.message
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
            // Update the plan's status in the plans table to 'Approved'
            const updatePlanStatusQuery = `
              UPDATE plans
              SET status = 'Approved'
              WHERE plan_id = ?
            `;
            con.query(updatePlanStatusQuery, [plan_id], (err, updateResult) => {
              if (err) {
                console.error("Error updating plan status:", err.message);
                return res.status(500).json({
                  success: false,
                  message: "Error updating plan status in the plans table.",
                  error_code: "DB_ERROR",
                  error: err.message
                });
              }

              return res.status(200).json({
                success: true,
                message: "Plan approved successfully and status updated.",
                plan_details: planDetails
              });
            });
          } else if (status === "Declined") {
            return res.status(200).json({
              success: true,
              message: "Plan declined successfully.",
              plan_details: planDetails
            });
          } else {
            return res.status(200).json({
              success: true,
              message: `Plan ${status.toLowerCase()} successfully.`,
              plan_details: planDetails
            });
          }
        });
      });
    });
  } catch (error) {
    console.error("Error in updatePlanStatus:", error.message);
    res.status(500).json({
      success: false,
      message: `Unknown error occurred while updating plan status. Error: ${error.message}`,
      error_code: "UNKNOWN_ERROR"
    });
  }
};






module.exports = {  
  getSubmittedReports,
 
  updateReportStatus,
  getDetailedPlanForSupervisor,
  updatePlanApprovalStatus
};








