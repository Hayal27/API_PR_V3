const jwt = require("jsonwebtoken");
const con = require("../models/db");
const { logAudit, AUDIT_ACTIONS } = require('../middleware/auditLogger');

const addReport = (req, res) => {
  const { outcome, execution_percentage, Description } = req.body;
  const planId = parseInt(req.params.planId); // Convert to integer

  console.log("Request Body:", req.body);
  console.log("Plan ID:", req.params.planId);

  // Validate required fields
  if (!outcome) {
    return res.status(400).json({ message: "Outcome is required" });
  }
  if (!execution_percentage) {
    return res.status(400).json({ message: "Execution percentage is required" });
  }
  if (!Description) {
    return res.status(400).json({ message: "Description is required" });
  }
  if (isNaN(planId)) {
    return res.status(400).json({ message: "A valid planId is required" });
  }

  // Validate token
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log("Authorization Token:", token);
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

    // Fetch specific_objective_detail_id along with status and deadline
    con.query(
      `SELECT p.specific_objective_detail_id, COALESCE(aw.status, p.status) as status, sod.deadline
       FROM plans p
       LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
       LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
       WHERE p.plan_id = ?`,
      [planId],
      (err, planResult) => {
        if (err) {
          console.error("Database Error during plan lookup:", err);
          return res.status(500).json({
            message: "Error finding plan details",
          });
        }

        if (planResult.length === 0) {
          return res.status(404).json({ message: "Plan not found" });
        }

        const plan = planResult[0];
        const status = plan.status?.toLowerCase();
        const deadline = plan.deadline ? new Date(plan.deadline) : null;
        const now = new Date();

        // Enforce status restrictions
        if (['pending', 'declined'].includes(status)) {
          return res.status(403).json({
            message: `Cannot update a plan that is ${status}. Wait for approval.`
          });
        }

        // Enforce deadline restrictions (for progress updates)
        if (deadline && now > deadline) {
          return res.status(403).json({
            message: "The deadline for this plan has passed. Updates are no longer allowed."
          });
        }

        const specific_objective_detail_id = planResult[0].specific_objective_detail_id;
        console.log("Specific ObjectiveDetail ID:", specific_objective_detail_id);

        // Determine progress
        let progress = "started";
        if (execution_percentage >= 100) {
          progress = "completed";
        } else if (execution_percentage > 0) {
          progress = "on going";
        }

        // Update report status in plans table
        con.query(
          "UPDATE plans SET report_status = ? WHERE plan_id = ?",
          ["Pending", planId],
          (err) => {
            if (err) {
              console.error("Error updating report status:", err);
              return res.status(500).json({
                message: "Error updating report status",
              });
            }
          }
        );

      

        // Update specific objective details
        const updateSpecificObjectiveDetailQuery = `
          UPDATE specific_objective_details
          SET outcome = ?, execution_percentage = ?, progress = ?, description = ?
          WHERE specific_objective_detail_id = ?
        `;

        con.query(
          updateSpecificObjectiveDetailQuery,
          [outcome, execution_percentage, progress, Description, specific_objective_detail_id],
          (err) => {
            if (err) {
              console.error("Error updating specific goal:", err);
              return res.status(500).json({
                message: "Error updating specific goal",
              });
            }

            logAudit(user_id, AUDIT_ACTIONS.REPORT_CREATE || 'REPORT_CREATE', `Submitted report for plan ID ${planId} — Execution: ${execution_percentage}%, Outcome: ${outcome}`, {
              plan_id: planId, specific_objective_detail_id, outcome, execution_percentage, description: Description
            }, req).catch(() => {});

            res.status(200).json({
              message: "Outcome, execution percentage, and Description updated successfully",
              specific_objective_detail_id,
            });
          }
        );
      }
    );
  });
};





// const updatePlan = async (req, res) => {
//   try {
//     const user_id = req.user_id; // Get user_id from the request
//     const { planId } = req.params; // Get planId from URL params
//     const updates = req.body; // Get the updates from the request body

//     // Input validation for year
//     if (updates.year && isNaN(updates.year)) {
//       console.error("Invalid year format:", updates.year);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid year format. Please provide a valid number.",
//         error_code: "INVALID_YEAR_FORMAT",
//       });
//     }

//     // Input validation for progress
//     if (updates.progress && !["planned", "የ እቅዱ ሂደት", "completed"].includes(updates.progress)) {
//       console.error("Invalid progress value:", updates.progress);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid progress value. Allowed values are 'planned', 'progress', or 'completed'.",
//         error_code: "INVALID_PROGRESS_VALUE",
//       });
//     }

//     // Allowed fields for update
//     const allowedUpdates = [
//       "details", "measurement", "baseline",
//       "plan", "Description", "year", "quarter",
//       "የ እቅዱ ሂደት", "outcome", "execution_percentage",
//     ];

//     // Filter out invalid fields
//     const updateFields = Object.keys(updates).filter(field => allowedUpdates.includes(field));

//     if (updateFields.length === 0) {
//       console.error("No valid fields to update.");
//       return res.status(400).json({
//         success: false,
//         message: "No valid fields to update. Ensure you're updating only allowed fields.",
//         error_code: "NO_VALID_FIELDS",
//       });
//     }

//     // Step 1: Fetch specific_objective_detail_id from plan table
//     const fetchSpecificObjectiveDetailIDdQuery = `
//       SELECT specific_objective_detail_id 
//       FROM plans 
//       WHERE plan_id = ? AND user_id = ?
//     `;

//     con.query(fetchSpecificObjectiveDetailIDdQuery, [planId, user_id], (err, planResults) => {
//       if (err) {
//         console.error("Error fetching plan:", err.stack);
//         return res.status(500).json({
//           success: false,
//           message: "Database error while fetching the plan.",
//           error_code: "DB_ERROR_PLAN_FETCH",
//           error: err.message,
//         });
//       }

//       if (planResults.length === 0) {
//         console.error("Plan not found or unauthorized access. Plan ID:", planId);
//         return res.status(404).json({
//           success: false,
//           message: "Plan not found or you don't have permission to update this plan.",
//           error_code: "PLAN_NOT_FOUND_OR_UNAUTHORIZED",
//         });
//       }

//       const specific_objective_detail_id = planResults[0].specific_objective_detail_id;

//       // Step 2: Check if the specific objective detail exists and belongs to the user
//       const checkSpecificObjectiveDetailQuery = `
//         SELECT * FROM specific_objective_details 
//         WHERE specific_objective_detail_id = ? AND user_id = ?
//       `;

//       con.query(checkSpecificObjectiveDetailQuery, [specific_objective_detail_id, user_id], (err, SpecificObjectiveDetailResults) => {
//         if (err) {
//           console.error("Error checking specific objective detail existence:", err.stack);
//           return res.status(500).json({
//             success: false,
//             message: "Error while checking specific objective detail existence in the database.",
//             error_code: "DB_ERROR_CHECK",
//             error: err.message,
//           });
//         }

//         if (SpecificObjectiveDetailResults.length === 0) {
//           console.error("specific objective detail not found or unauthorized for update. Specifc Objective Detail ID:", specific_objective_detail_id);
//           return res.status(404).json({
//             success: false,
//             message: "specific objective detail not found or you don't have permission to update this SpecificObjectiveDetail.",
//             error_code: "SPECIFIC_OBJECTIVE_DETAIL_NOT_FOUND_OR_UNAUTHORIZED",
//           });
//         }

//         // Step 3: Prepare and execute the update query
//         const updateQuery = `
//           UPDATE specific_objective_details 
//           SET ${updateFields.map((field) => `${field} = ?`).join(", ")}
//           WHERE specific_objective_detail_id = ? AND user_id = ?
//         `;

//         const updateValues = [...updateFields.map((field) => updates[field]), specific_objective_detail_id, user_id];

//         con.query(updateQuery, updateValues, (err, result) => {
//           if (err) {
//             console.error("Error during update:", err.stack);
//             return res.status(500).json({
//               success: false,
//               message: "Database error while updating the specific objective detail.",
//               error_code: "DB_ERROR_UPDATE",
//               error: err.message,
//             });
//           }

//           if (result.affectedRows === 0) {
//             console.warn("No updates applied. The specific objective detail may not exist or no changes were made.");
//             return res.status(404).json({
//               success: false,
//               message: "No updates were applied. The specific objective detail may not exist or no changes were made.",
//               error_code: "NO_UPDATES_APPLIED",
//             });
//           }

//           console.log("specific objective detail updated successfully. Specifc Objective Detail ID:", specific_objective_detail_id);

//           // Step 4: Update the approval workflow status
//           const updateApprovalWorkflowQuery = `
//             UPDATE approvalworkflow
//             SET status = 'pending'
//             WHERE plan_id = ?
//           `;

//           con.query(updateApprovalWorkflowQuery, [planId], (err, approvalResult) => {
//             if (err) {
//               console.error("Error updating approval workflow:", err.stack);
//               return res.status(500).json({
//                 success: false,
//                 message: "Database error while updating approval workflow status.",
//                 error_code: "DB_ERROR_APPROVAL_UPDATE",
//                 error: err.message,
//               });
//             }

//             console.log("Approval workflow status updated to 'pending'. Plan ID:", planId);

//             // Step 5: Fetch the updated specific objective detail to display the changes
//             const fetchUpdatedSpecificObjectiveDetailQuery = `
//               SELECT * FROM specific_objective_details 
//               WHERE specific_objective_detail_id = ? AND user_id = ?
//             `;

//             con.query(fetchUpdatedSpecificObjectiveDetailQuery, [specific_objective_detail_id, user_id], (err, updatedSpecificObjectiveDetailResults) => {
//               if (err) {
//                 console.error("Error fetching updated specific objective detail:", err.stack);
//                 return res.status(500).json({
//                   success: false,
//                   message: "Error fetching updated specific objective detail from the database.",
//                   error_code: "DB_ERROR_FETCH_UPDATED",
//                   error: err.message,
//                 });
//               }

//               if (updatedSpecificObjectiveDetailResults.length === 0) {
//                 console.error("Updated specific objective detail not found. Specifc Objective Detail ID:", specific_objective_detail_id);
//                 return res.status(404).json({
//                   success: false,
//                   message: "Updated specific objective detail not found. Please try again.",
//                   error_code: "UPDATED_SPECIFIC_OBJECTIVE_DETAIL_NOT_FOUND",
//                 });
//               }

//               const updatedSpecificObjectiveDetail = updatedSpecificObjectiveDetailResults[0];
//               console.log("Fetched updated specific objective details:", updatedSpecificObjectiveDetail);

//               return res.status(200).json({
//                 success: true,
//                 message: "specific objective detail and approval workflow updated successfully.",
//                 data: updatedSpecificObjectiveDetail, // Return the updated specific objective detail details
//               });
//             });
//           });
//         });
//       });
//     });
//   } catch (error) {
//     console.error("Error in updatePlan function:", error.stack);
//     return res.status(500).json({
//       success: false,
//       message: `An unexpected error occurred. ${error.message}`,
//       error_code: "UNKNOWN_ERROR",
//     });
//   }
// };



  // Fetch approved plans for the logged-in user
const getApprovedPlans = (req, res) => {
    // Extract the token from the Authorization header
    const token = req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }
  
    // Verify the token
    jwt.verify(token, 'hayaltamrat@27', (err, decoded) => {
      if (err) {
        console.error('JWT Error:', err);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
  
      const user_id = decoded.user_id; // Assuming user_id is in the JWT payload
      console.log('User ID from token:', user_id);
  
      // Fetch approved plans for the user
      const query = `
        SELECT plan_id, objective, year, quarter
        FROM plans
        WHERE user_id = ? AND status = 'Approved'
      `;
  
      con.query(query, [user_id], (err, results) => {
        if (err) {
          console.error('Database Error:', err);
          return res.status(500).json({ message: 'Error fetching approved plans' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'No approved plans found' });
        }
  
        res.status(200).json({ plans: results });
      });
    });
  };
  
// Add report for StaffViewPlan component (different format)
const addReportFromStaff = (req, res) => {
  const { plan_id, report_content } = req.body;
  const attachments = req.files || [];

  console.log("Staff Report Request Body:", req.body);
  console.log("Plan ID:", plan_id);
  console.log("Attachments:", attachments.length);

  // Validate required fields
  if (!plan_id) {
    return res.status(400).json({ message: "Plan ID is required" });
  }
  if (!report_content) {
    return res.status(400).json({ message: "Report content is required" });
  }

  // Extract the token from the Authorization header
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  // Verify the token
  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    console.log("User ID from token:", user_id);

    // Verify plan ownership and status
    con.query(
      `SELECT p.user_id, COALESCE(aw.status, p.status) as status 
       FROM plans p
       LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
       WHERE p.plan_id = ?`,
      [plan_id],
      (err, planResult) => {
        if (err) {
          console.error("Database Error during plan lookup:", err);
          return res.status(500).json({
            message: "Error verifying plan ownership",
          });
        }

        if (planResult.length === 0) {
          return res.status(404).json({ message: "Plan not found" });
        }

        const plan = planResult[0];
        const status = plan.status?.toLowerCase();

        if (plan.user_id !== user_id) {
          return res.status(403).json({ message: "You can only add reports to your own plans" });
        }

        // Restrict pending and declined plans
        if (['pending', 'declined'].includes(status)) {
          return res.status(403).json({
            message: `Cannot add reports to a plan that is ${status}. Wait for approval.`
          });
        }

        // Insert report into reports table
        const insertReportQuery = `
          INSERT INTO reports (plan_id, user_id, report_content, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
        `;

        con.query(insertReportQuery, [plan_id, user_id, report_content], (err, result) => {
          if (err) {
            console.error("Database Error during report insertion:", err);
            return res.status(500).json({
              message: "Error adding report",
            });
          }

          const report_id = result.insertId;

          // Handle file attachments if any
          if (attachments.length > 0) {
            const fileInsertPromises = attachments.map(file => {
              return new Promise((resolve, reject) => {
                const insertFileQuery = `
                  INSERT INTO report_attachments (report_id, file_name, file_path, file_size, created_at)
                  VALUES (?, ?, ?, ?, NOW())
                `;
                con.query(insertFileQuery, [report_id, file.originalname, file.path, file.size], (err, result) => {
                  if (err) reject(err);
                  else resolve(result);
                });
              });
            });

            Promise.all(fileInsertPromises)
              .then(() => {
                res.status(201).json({
                  success: true,
                  message: "Report and attachments added successfully",
                  report_id: report_id
                });
              })
              .catch(err => {
                console.error("Error inserting file attachments:", err);
                res.status(500).json({
                  message: "Report added but failed to save attachments"
                });
              });
          } else {
            res.status(201).json({
              success: true,
              message: "Report added successfully",
              report_id: report_id
            });
          }
        });
      }
    );
  });
};

  module.exports = {
    addReport,
    addReportFromStaff,
    getApprovedPlans
  };
  