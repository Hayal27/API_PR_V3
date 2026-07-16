const jwt = require("jsonwebtoken");
const con = require("../models/db");

const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const addPlan = async (req, res) => {
  const {
    planId,
    objective,
    goal,
    row_no,
    details,
    measurement,
    baseline,
    plan,
    outcome,
    execution_percentage,
    description,
    year,
    quarter,
  } = req.body;

  if (
    !planId ||
    !objective ||
    !goal ||
    !row_no ||
    !details ||
    !measurement ||
    !baseline ||
    !plan ||
    !outcome ||
    !execution_percentage ||
    !description ||
    !year ||
    !quarter
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  try {
    const decoded = jwt.verify(token, "hayaltamrat@27");
    const user_id = decoded.user_id;

    const queryAsync = promisify(con.query).bind(con);

    // Get current employee_id
    const userResult = await queryAsync(
      "SELECT employee_id FROM users WHERE user_id = ?",
      [user_id]
    );

    if (userResult.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const current_employee_id = userResult[0].employee_id;

    // Get employee first name
    const employeeResult = await queryAsync(
      "SELECT fname, department_id FROM employees WHERE employee_id = ?",
      [current_employee_id]
    );

    if (employeeResult.length === 0) {
      return res.status(400).json({ message: "Employee not found" });
    }

    const { fname: employee_first_name, department_id } = employeeResult[0];

    // Get department name from departments table using department_id
    const departmentResult = await queryAsync(
      "SELECT name FROM departments WHERE department_id = ?",
      [department_id]
    );

    if (departmentResult.length === 0) {
      return res.status(400).json({ message: "Department not found" });
    }

    const department_name = departmentResult[0].name;

    // Get supervisor_id
    const supervisorResult = await queryAsync(
      "SELECT supervisor_id FROM employees WHERE employee_id = ?",
      [current_employee_id]
    );

    if (supervisorResult.length === 0) {
      return res.status(400).json({ message: "Supervisor not found" });
    }

    const supervisor_id = supervisorResult[0].supervisor_id;

    // Insert plan with department name instead of department_id
    const planQuery = `
      INSERT INTO plans (
        user_id, department_name, objective, goal, row_no, details, measurement, baseline,
        plan, outcome, execution_percentage, description, status, comment, created_at,
        updated_at, year, quarter, supervisor_id, employee_id, created_by, progress
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, 'planned')
    `;

    const planValues = [
      user_id,
      department_name, // Use department_name here instead of department_id
      objective,
      goal,
      row_no,
      details,
      measurement,
      baseline,
      plan,
      outcome,
      execution_percentage,
      description,
      "Pending",
      null,
      year,
      quarter,
      supervisor_id,
      current_employee_id,
      employee_first_name,
    ];

    const planResult = await queryAsync(planQuery, planValues);
    const plan_id = planResult.insertId;

    // Insert approval workflow
    const approvalWorkflowQuery = `
      INSERT INTO ApprovalWorkflow (plan_id, approver_id, status)
      VALUES (?, ?, 'Pending')
    `;

    await queryAsync(approvalWorkflowQuery, [plan_id, supervisor_id]);

    res.status(201).json({
      message: "Plan and approval workflow added successfully",
      plan_id,
    });
  } catch (err) {
    console.error("Error processing request:", err.message);
    res.status(500).json({ message: "An error occurred while adding the plan" });
  }
};





module.exports = { addPlan };


