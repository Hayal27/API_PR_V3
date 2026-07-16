// const express = require('express');
// const approvalWorkflowModel = require('../models/approvalWorkflowModel');
// const verifyToken = require('../middleware/verifyToken');
// const router = express.Router();

// // Route to get pending approvals for the supervisor
// router.get('/pending', verifyToken, (req, res) => {
//     const supervisor_id = req.user_id;

//     approvalWorkflowModel.getPendingApprovalsForSupervisor(supervisor_id, (err, results) => {
//         if (err) return res.status(500).json({ message: 'Error fetching pending approvals' });
//         res.json(results);
//     });
// });

// // Route to approve a plan
// router.post('/approve', verifyToken, (req, res) => {
//     const supervisor_id = req.user_id;
//     const { plan_id } = req.body;

//     approvalWorkflowModel.updateApprovalStatus(plan_id, supervisor_id, 'Approved', null, (err, result) => {
//         if (err) return res.status(500).json({ message: 'Error approving plan' });
//         res.json({ message: 'Plan approved successfully' });
//     });
// });

// // Route to decline a plan with a comment
// router.post('/decline', verifyToken, (req, res) => {
//     const supervisor_id = req.user_id;
//     const { plan_id, comment } = req.body;

//     approvalWorkflowModel.updateApprovalStatus(plan_id, supervisor_id, 'Declined', comment, (err, result) => {
//         if (err) return res.status(500).json({ message: 'Error declining plan' });
//         res.json({ message: 'Plan declined with comment' });
//     });
// });

// module.exports = router;
