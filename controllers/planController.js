const jwt = require("jsonwebtoken");
const con = require("../models/db");
const { addApprovalHistory } = require("./approvalHistoryController");
const { buildAndSavePlanApprovalChain } = require("./hierarchyApprovalController");
const NotificationService = require("../services/notificationService");
const util = require('util');

const addPlan = (req, res) => {
  console.log('🔥 ADDPLAN REQUEST RECEIVED');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

  const { goal_id, objective_id, specific_objective_id, specific_objective_details_id, supervisor_id: selectedSupervisorEmployeeId } = req.body;

  console.log('🎯 Extracted parameters:', {
    goal_id,
    objective_id,
    specific_objective_id,
    specific_objective_details_id,
    selectedSupervisorEmployeeId,
    supervisor_id_from_body: req.body.supervisor_id
  });

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
          // Retrieve supervisor_id, department_id, and role_name
          con.query(
            `SELECT e.supervisor_id, e.department_id, r.role_name 
                 FROM employees e 
                 LEFT JOIN roles r ON e.role_id = r.role_id 
                 WHERE e.employee_id = ?`,
            [employee_id],
            (err, employeeResult) => {
              if (err) {
                console.error("Error retrieving employee details:", err);
                return res.status(500).json({ message: "Error retrieving employee details" });
              }
              if (employeeResult.length === 0) {
                return res.status(404).json({ message: "Employee details not found" });
              }

              const { supervisor_id: defaultSupervisorEmployeeId, department_id, role_name } = employeeResult[0];
              // Use selected supervisor's employee_id if provided, otherwise use default supervisor's employee_id
              const supervisor_id = selectedSupervisorEmployeeId || defaultSupervisorEmployeeId;

              console.log('Plan creation supervisor assignment:', {
                selectedSupervisorEmployeeId,
                defaultSupervisorEmployeeId,
                finalSupervisorId: supervisor_id,
                planCreatorEmployeeId: employee_id,
                role_name
              });

              // Use role_name as department_name (Position in Org Structure)
              // If role_name is missing, fallback to fetching department name or 'Unknown'
              const processPlanInsertion = (deptName) => {
                // Insert the plan into the plans table
                const insertPlanQuery = `
                      INSERT INTO plans (
                        user_id, department_id, supervisor_id, employee_id, goal_id, objective_id, specific_objective_id, specific_objective_detail_id,
                        status, reporting, year, department_name, created_at, updated_at
                      )
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'deactivate', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
                  new Date().getFullYear(), // Add current year
                  deptName, // Add department name (or Position)
                ];

                con.query(insertPlanQuery, values, (err, result) => {
                  if (err) {
                    console.error("Error adding plan:", err);
                    return res.status(500).json({ message: "Error adding plan", error: err });
                  }
                  const plan_id = result.insertId;

                  console.log('Plan created successfully:', {
                    plan_id,
                    supervisor_id_in_plans_table: supervisor_id,
                    employee_id_in_plans_table: employee_id
                  });

                  // Insert into the approval workflow table
                  const approvalQuery = `
                        INSERT INTO approvalworkflow (plan_id, approver_id, status, approval_date, approved_at, comment_writer)
                        VALUES (?, ?, 'Pending', NOW(), NULL, '')
                      `;

                  console.log('Creating approval workflow entry:', {
                    plan_id,
                    approver_id: supervisor_id,
                    note: 'approver_id is the employee_id of the selected supervisor'
                  });

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
                        }

                        // 🔑 Auto-build hierarchy approval chain from org structure
                        let approvalChain = [];
                        try {
                          approvalChain = await buildAndSavePlanApprovalChain(plan_id, employee_id);
                          console.log(`✅ Built ${approvalChain.length}-step approval chain for plan ${plan_id}`);

                          // Notify first approver via Telegram/In-app
                          if (approvalChain.length > 0 && approvalChain[0].approver_employee_id) {
                            const firstApprover = approvalChain[0];
                            const queryPromise = util.promisify(con.query).bind(con);
                            const approverUserRows = await queryPromise('SELECT user_id FROM users WHERE employee_id = ?', [firstApprover.approver_employee_id]);
                            
                            if (approverUserRows.length > 0) {
                              NotificationService.createNotification({
                                user_id: approverUserRows[0].user_id,
                                plan_id: plan_id,
                                type: 'approval_request',
                                title: 'New Plan Approval Request',
                                message: `A new plan has been submitted for approval at the ${firstApprover.org_node_name} level.`,
                                priority: 'high'
                              }).catch(err => console.error('Notification error:', err));
                            }
                          }
                        } catch (chainErr) {
                          console.error("Error building approval chain (non-fatal):", chainErr);
                          // Non-fatal: plan still created, chain will be built on first approval fetch
                        }

                        res.status(201).json({
                          message: "Plan and associated entries created successfully",
                          plan_id,
                          approval_chain: approvalChain.map((s, i) => ({
                            step: i + 1,
                            org_node: s.org_node_name,
                            approver: s.approver_name,
                            approver_employee_id: s.approver_employee_id
                          }))
                        });
                      });
                    });
                  });
                });
              };

              // Determine department_name (Position)
              if (role_name) {
                processPlanInsertion(role_name);
              } else {
                // Fallback to department name if role_name is not found
                con.query("SELECT name FROM departments WHERE department_id = ?", [department_id], (err, deptResult) => {
                  if (err) {
                    console.error("Error retrieving department name:", err);
                    return res.status(500).json({ message: "Error retrieving department name" });
                  }
                  const department_name = deptResult.length > 0 ? deptResult[0].name : 'Unknown Department';
                  processPlanInsertion(department_name);
                });
              }
            }
          );
        });
      }
    );
  });
};

module.exports = { addPlan };