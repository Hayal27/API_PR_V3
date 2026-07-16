const con = require('./db');

// Function to create an approval record for a plan
const createApprovalRecord = (plan_id, approver_id, callback) => {
  const query = 'INSERT INTO ApprovalWorkflow (plan_id, approver_id, status) VALUES (?, ?, "Pending")';

  con.query(query, [plan_id, approver_id], (err, result) => {
    if (err) {
      console.error('Error creating approval record:', err);
      return callback(err, null);
    }
    return callback(null, result);
  });
};

// Function to update approval status for a given plan and supervisor
const updateApprovalStatus = (plan_id, approver_id, status, comment, callback) => {
  const query = 'UPDATE ApprovalWorkflow SET status = ?, comment = ?, approval_date = NOW() WHERE plan_id = ? AND approver_id = ?';

  con.query(query, [status, comment, plan_id, approver_id], (err, result) => {
    if (err) {
      console.error('Error updating approval status:', err);
      return callback(err, null);
    }
    return callback(null, result);
  });
};

// Function to fetch pending approvals for a specific supervisor
const getPendingApprovalsForSupervisor = (approver_id, callback) => {
  const query = `
    SELECT p.*, aw.status, aw.comment
    FROM plans p
    JOIN ApprovalWorkflow aw ON p.plan_id = aw.plan_id
    WHERE aw.approver_id = ? AND aw.status = 'Pending'
  `;

  con.query(query, [approver_id], (err, results) => {
    if (err) {
      console.error('Error fetching pending approvals:', err);
      return callback(err, null);
    }
    return callback(null, results);
  });
};

module.exports = {
  createApprovalRecord,
  updateApprovalStatus,
  getPendingApprovalsForSupervisor
};
