// const jwt = require("jsonwebtoken");
// const con = require("../models/db");

// const addPlan = (req, res) => {
//   const {
//     objective_id,
//     goal_id,
//     row_no,
//     details,
//     measurement,
//     baseline,
//     plan,
//     outcome,
//     execution_percentage,
//     description,
//     year,
//     quarter,
//   } = req.body;

//   if (
//     !objective_id ||
//     !goal_id ||
//     !row_no ||
//     !details ||
//     !measurement ||
//     !baseline ||
//     !plan ||
//     !outcome ||
//     !execution_percentage ||
//     !description ||
//     !year ||
//     !quarter
//   ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "Authorization token is required" });
//   }

//   jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
//     if (err) {
//       console.error("JWT Error:", err);
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }

//     const user_id = decoded.user_id;
//     console.log("user_id from token:", user_id);

//     con.query(
//       "SELECT employee_id FROM users WHERE user_id = ?",
//       [user_id],
//       (err, result) => {
//         if (err) {
//           console.error("Database Error during user lookup:", err);
//           return res
//             .status(500)
//             .json({ message: "Error finding employee_id for the user" });
//         }

//         if (result.length === 0) {
//           return res.status(400).json({ message: "User not found" });
//         }

//         const current_employee_id = result[0].employee_id;
//         console.log("Current Employee ID:", current_employee_id);

//         con.query(
//           "SELECT fname FROM employees WHERE employee_id = ?",
//           [current_employee_id],
//           (err, result) => {
//             if (err) {
//               console.error("Database Error during employee lookup:", err);
//               return res
//                 .status(500)
//                 .json({ message: "Error fetching employee details" });
//             }

//             if (result.length === 0) {
//               return res
//                 .status(400)
//                 .json({ message: "Employee not found" });
//             }

//             const employee_first_name = result[0].fname;
//             console.log("Employee First Name:", employee_first_name);

//             con.query(
//               "SELECT supervisor_id, department_id FROM employees WHERE employee_id = ?",
//               [current_employee_id],
//               (err, result) => {
//                 if (err) {
//                   console.error(
//                     "Database Error during supervisor lookup:",
//                     err
//                   );
//                   return res
//                     .status(500)
//                     .json({
//                       message:
//                         "Error finding supervisor and department for the employee",
//                     });
//                 }

//                 if (result.length === 0) {
//                   return res
//                     .status(400)
//                     .json({
//                       message: "Employee does not have a supervisor or department",
//                     });
//                 }

//                 const { supervisor_id, department_id } = result[0];
//                 console.log("Supervisor ID:", supervisor_id);
//                 console.log("Department ID:", department_id);

//                 const query = `
//                   INSERT INTO plans (
//                     user_id, department_id, objective_id, goal_id, row_no, details, measurement, baseline,
//                     plan, outcome, execution_percentage, description, status, comment, created_at,
//                     updated_at, year, quarter, supervisor_id, employee_id, created_by, progress
//                   ) 
//                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, 'planned')
//                 `;

//                 const values = [
//                   user_id,
//                   department_id,
//                   objective_id,
//                   goal_id,
//                   row_no,
//                   details,
//                   measurement,
//                   baseline,
//                   plan,
//                   outcome,
//                   execution_percentage,
//                   description,
//                   "Pending",
//                   null,
//                   year,
//                   quarter,
//                   supervisor_id,
//                   current_employee_id,
//                   employee_first_name,
//                 ];

//                 con.query(query, values, (err, result) => {
//                   if (err) {
//                     console.error("Error adding plan:", err);
//                     return res.status(500).json({ message: "Error adding plan" });
//                   }

//                   const plan_id = result.insertId;
//                   console.log("Plan added successfully:", plan_id);

//                   const approvalWorkflowQuery = `
//                     INSERT INTO ApprovalWorkflow (plan_id, approver_id, status)
//                     VALUES (?, ?, 'Pending')
//                   `;

//                   con.query(
//                     approvalWorkflowQuery,
//                     [plan_id, supervisor_id],
//                     (err) => {
//                       if (err) {
//                         console.error(
//                           "Error inserting approval workflow:",
//                           err
//                         );
//                         return res
//                           .status(500)
//                           .json({
//                             message: "Error creating approval workflow",
//                           });
//                       }

//                       res.status(201).json({
//                         message: "Plan and approval workflow added successfully",
//                         plan_id,
//                       });
//                     }
//                   );
//                 });
//               }
//             );
//           }
//         );
//       }
//     );
//   });
// };

// module.exports = {
//   addPlan,
// };







const jwt = require("jsonwebtoken");
const con = require("../models/db");
const { addApprovalHistory } = require("./approvalHistoryController");

const addPlan = (req, res) => {
  const { goal_id, objective_id, specific_objective_id, specific_objective_details_id } = req.body;

  // Validate required fields
  if (!goal_id || !objective_id || !specific_objective_id || !specific_objective_details_id) {
    const missingFields = [];
    if (!goal_id) missingFields.push("goal_id");
    if (!objective_id) missingFields.push("objective_id");
    if (!specific_objective_id) missingFields.push("specific_objective_id");
    if (!specific_objective_details_id) missingFields.push("specific_objective_details_id");
    return res.status(400).json({
      message: "The following fields are missing or invalid.",
      missingFields,
    });
  }

  const specificObjectiveDetailsId = Array.isArray(specific_objective_details_id)
    ? specific_objective_details_id[0]
    : specific_objective_details_id;

  // Verify the token and extract the user_id
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;

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
          return res.status(500).json({ message: "Error validating foreign keys" });
        }

        const {
          goal_exists,
          objective_exists,
          specific_objective_exists,
          specific_objective_detail_exists,
        } = results[0];

        if (!goal_exists || !objective_exists || !specific_objective_exists || !specific_objective_detail_exists) {
          return res.status(400).json({
            message: "Invalid foreign key references. Ensure all referenced data exists.",
            details: {
              goal_id: !!goal_exists,
              objective_id: !!objective_exists,
              specific_objective_id: !!specific_objective_exists,
              specific_objective_details_id: !!specific_objective_detail_exists,
            },
          });
        }

        // Retrieve employee_id from the users table
        con.query("SELECT employee_id FROM users WHERE user_id = ?", [user_id], (err, userResult) => {
          if (err) {
            console.error("Error retrieving employee ID:", err);
            return res.status(500).json({ message: "Error retrieving employee ID" });
          }
          if (userResult.length === 0) {
            return res.status(404).json({ message: "User not found" });
          }

          const employee_id = userResult[0].employee_id;

          // Retrieve supervisor_id and department_id
          con.query(
            "SELECT supervisor_id, department_id FROM employees WHERE employee_id = ?",
            [employee_id],
            (err, employeeResult) => {
              if (err) {
                console.error("Error retrieving employee details:", err);
                return res.status(500).json({ message: "Error retrieving employee details" });
              }
              if (employeeResult.length === 0) {
                return res.status(404).json({ message: "Employee details not found" });
              }

              const { supervisor_id, department_id } = employeeResult[0];

              // Insert the plan into the plans table
              const insertPlanQuery = `
                INSERT INTO plans (
                  user_id, department_id, supervisor_id, employee_id, goal_id, objective_id, specific_objective_id, specific_objective_detail_id,
                  status, reporting, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'deactivate', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              `;
              const values = [
                user_id,
                department_id,
                supervisor_id,
                employee_id,
                goal_id,
                objective_id,
                specific_objective_id,
                specificObjectiveDetailsId,
              ];

              con.query(insertPlanQuery, values, (err, result) => {
                if (err) {
                  console.error("Error adding plan:", err);
                  return res.status(500).json({ message: "Error adding plan", error: err });
                }
                const plan_id = result.insertId;

                // Insert into the approval workflow table
                const approvalQuery = `
                  INSERT INTO approvalworkflow (plan_id, approver_id, status, approval_date, approved_at, comment_writer)
                  VALUES (?, ?, 'Pending', NOW(), NULL, '')
                `;
                con.query(approvalQuery, [plan_id, supervisor_id], async (err) => {
                  if (err) {
                    console.error("Error adding approval workflow:", err);
                    return res.status(500).json({ message: "Error adding approval workflow", error: err });
                  }

                  // Get supervisor details for approval history
                  const getSupervisorDetailsQuery = `
                    SELECT e.name, r.role_name, u.fname, u.lname
                    FROM employees e
                    JOIN users u ON e.employee_id = u.employee_id
                    JOIN roles r ON u.role_id = r.role_id
                    WHERE e.employee_id = ?
                  `;

                  con.query(getSupervisorDetailsQuery, [supervisor_id], async (err, supervisorResults) => {
                    let supervisorName = "Unknown";
                    let supervisorRole = "Unknown";

                    if (!err && supervisorResults && supervisorResults.length > 0) {
                      const supervisor = supervisorResults[0];
                      supervisorName = supervisor.name || `${supervisor.fname} ${supervisor.lname}`;
                      supervisorRole = supervisor.role_name;
                    }

                    // Get plan creator details
                    const getCreatorDetailsQuery = `
                      SELECT u.fname, u.lname, e.name as employee_name
                      FROM users u
                      LEFT JOIN employees e ON u.employee_id = e.employee_id
                      WHERE u.user_id = ?
                    `;

                    con.query(getCreatorDetailsQuery, [user_id], async (err, creatorResults) => {
                      let createdByName = "Unknown";

                      if (!err && creatorResults && creatorResults.length > 0) {
                        const creator = creatorResults[0];
                        createdByName = creator.employee_name || `${creator.fname} ${creator.lname}`;
                      }

                      // Add initial approval history entry
                      try {
                        await addApprovalHistory(
                          plan_id,
                          supervisor_id,
                          supervisorName,
                          supervisorRole,
                          'Pending',
                          'Plan submitted for approval',
                          1, // step_number
                          1, // is_current_step
                          user_id,
                          createdByName
                        );
                      } catch (historyErr) {
                        console.error("Error adding initial approval history:", historyErr);
                        // Continue without failing the plan creation
                      }

                      res.status(201).json({
                        message: "Plan and associated entries created successfully",
                        plan_id,
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
};




module.exports = { addPlan };
