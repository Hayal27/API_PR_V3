// // ApprovalWorkflowController.js

// const con = require("../models/db");
// const util = require("util");

// const createWorkflow = async (req, res) => {
//   const { planId, reportId, approverId, status = 'Pending' } = req.body;

//   try {
//     const query = util.promisify(con.query).bind(con);

//     if (!planId || !approverId) {
//       return res.status(400).json({ message: 'Missing required fields: planId or approverId' });
//     }

//     const result = await query(
//       'INSERT INTO ApprovalWorkflow (plan_id, report_id, approver_id, status) VALUES (?, ?, ?, ?)',
//       [planId, reportId, approverId, status]
//     );

//     if (!result || !result.insertId) {
//       console.error("Approval workflow insertion failed.");
//       return res.status(500).json({ message: "Failed to insert approval workflow data into the database." });
//     }

//     res.status(201).json({ success: true, message: 'Approval workflow created successfully', data: result });
//   } catch (error) {
//     console.error("Error creating approval workflow:", error);
//     res.status(500).json({ message: "Failed to create approval workflow." });
//   }
// };

// const getWorkflowByPlanId = (req, res) => {
//   const { planId } = req.params;

//   con.query('SELECT * FROM ApprovalWorkflow WHERE plan_id = ?', [planId], (err, rows) => {
//     if (err) {
//       console.error('Error fetching approval workflow:', err);
//       return res.status(500).json({ success: false, message: 'Error fetching approval workflow' });
//     }

//     res.status(200).json({ success: true, data: rows });
//   });
// };

// const updateApprovalStatus = async (req, res) => {
//   const { planId, approverId, status } = req.body;

//   try {
//     if (!planId || !approverId || !status) {
//       return res.status(400).json({ message: 'Missing required fields: planId, approverId, or status' });
//     }

//     const query = util.promisify(con.query).bind(con);

//     const result = await query(
//       'UPDATE ApprovalWorkflow SET status = ? WHERE plan_id = ? AND approver_id = ?',
//       [status, planId, approverId]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Approval workflow not found or not updated' });
//     }

//     res.status(200).json({ success: true, message: 'Approval workflow status updated successfully' });
//   } catch (error) {
//     console.error('Error updating approval workflow status:', error);
//     res.status(500).json({ message: 'Error updating approval workflow status' });
//   }
// };

// module.exports = {
//   createWorkflow,
//   getWorkflowByPlanId,
//   updateApprovalStatus
// };
