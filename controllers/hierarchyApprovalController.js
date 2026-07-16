// hierarchyApprovalController.js
// Manages automatic cascaded plan approval flow based on org structure hierarchy

const con = require('../models/db');
const util = require('util');
const NotificationService = require('../services/notificationService');
const query = util.promisify(con.query).bind(con);

/**
 * Builds the approval chain for a plan by walking up the org tree from the 
 * plan creator's primary position to the root (CEO).
 * Returns ordered array of { org_node_id, org_node_name, approver_employee_id, approver_name }
 */
const buildApprovalChain = async (planCreatorEmployeeId) => {
  // 1. Get the plan creator's primary org node
  const primaryPositions = await query(`
    SELECT ep.org_node_id, os.name as org_node_name, os.parent_id
    FROM employee_positions ep
    JOIN organization_structure os ON ep.org_node_id = os.id
    WHERE ep.employee_id = ? AND ep.is_primary = 1
    LIMIT 1
  `, [planCreatorEmployeeId]);

  if (!primaryPositions.length) {
    // Fall back to delegation if no primary
    const anyPosition = await query(`
      SELECT ep.org_node_id, os.name as org_node_name, os.parent_id
      FROM employee_positions ep
      JOIN organization_structure os ON ep.org_node_id = os.id
      WHERE ep.employee_id = ?
      LIMIT 1
    `, [planCreatorEmployeeId]);
    if (!anyPosition.length) return [];
    primaryPositions.push(anyPosition[0]);
  }

  const chain = [];
  let currentNodeId = primaryPositions[0].parent_id;

  // Walk up the tree until we reach root (parent_id IS NULL)
  while (currentNodeId !== null && currentNodeId !== undefined) {
    const nodeRows = await query(`
      SELECT id, name, parent_id FROM organization_structure WHERE id = ?
    `, [currentNodeId]);

    if (!nodeRows.length) break;
    const node = nodeRows[0];

    // Find the employee holding this position — priority to primary holder
    let holderRows = await query(`
      SELECT ep.employee_id, CONCAT(e.fname, ' ', e.lname) as full_name
      FROM employee_positions ep
      JOIN employees e ON ep.employee_id = e.employee_id
      WHERE ep.org_node_id = ? AND ep.is_primary = 1 AND ep.employee_id != ?
      LIMIT 1
    `, [currentNodeId, planCreatorEmployeeId]);

    if (!holderRows.length) {
      // Fallback to delegated holder if no primary holder
      holderRows = await query(`
        SELECT ep.employee_id, CONCAT(e.fname, ' ', e.lname) as full_name
        FROM employee_positions ep
        JOIN employees e ON ep.employee_id = e.employee_id
        WHERE ep.org_node_id = ? AND ep.is_delegation = 1 AND ep.employee_id != ?
        LIMIT 1
      `, [currentNodeId, planCreatorEmployeeId]);
    }

    const holder = holderRows.length ? holderRows[0] : null;

    chain.push({
      org_node_id: node.id,
      org_node_name: node.name,
      approver_employee_id: holder?.employee_id || null,
      approver_name: holder?.full_name || 'Unassigned'
    });

    currentNodeId = node.parent_id;
  }

  return chain;
};

/**
 * POST /api/plans/:plan_id/build-approval-chain
 * Called after plan creation to generate the approval steps.
 * Idempotent — safe to re-call if steps already exist.
 */
const buildAndSavePlanApprovalChain = async (planId, planCreatorEmployeeId) => {
  const chain = await buildApprovalChain(planCreatorEmployeeId);
  if (!chain.length) return [];

  // Delete any existing steps (for idempotency)
  await query('DELETE FROM plan_approval_steps WHERE plan_id = ?', [planId]);

  for (let i = 0; i < chain.length; i++) {
    const step = chain[i];
    await query(`
      INSERT INTO plan_approval_steps 
        (plan_id, step_number, org_node_id, org_node_name, approver_employee_id, approver_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      planId,
      i + 1,
      step.org_node_id,
      step.org_node_name,
      step.approver_employee_id,
      step.approver_name,
      i === 0 ? 'Pending' : 'Pending' // all pending, first is active
    ]);
  }

  return chain;
};

/**
 * GET /api/approval-steps/:plan_id
 * Returns all approval steps for a plan with their current statuses.
 */
const getApprovalSteps = async (req, res) => {
  const { plan_id } = req.params;
  try {
    const steps = await query(`
      SELECT 
        pas.*,
        CONCAT(e.fname, ' ', e.lname) as approver_full_name,
        r.role_name as approver_role,
        ep.is_delegation
      FROM plan_approval_steps pas
      LEFT JOIN employees e ON pas.approver_employee_id = e.employee_id
      LEFT JOIN roles r ON e.role_id = r.role_id
      LEFT JOIN employee_positions ep ON ep.employee_id = pas.approver_employee_id AND ep.org_node_id = pas.org_node_id
      WHERE pas.plan_id = ?
      ORDER BY pas.step_number ASC
    `, [plan_id]);

    // Also get plan info
    const planRows = await query(
      'SELECT status, reporting FROM plans WHERE plan_id = ?', [plan_id]
    );

    res.json({
      success: true,
      steps,
      plan: planRows[0] || null,
      total_steps: steps.length,
      current_step: steps.find(s => s.status === 'Pending')?.step_number || null
    });
  } catch (err) {
    console.error('getApprovalSteps error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch approval steps', error: err.message });
  }
};

/**
 * Helper to resolve employee_id from user_id (from JWT token)
 */
const resolveEmployeeId = async (user_id) => {
  const rows = await query('SELECT employee_id FROM users WHERE user_id = ?', [user_id]);
  return rows.length ? rows[0].employee_id : null;
};

/**
 * POST /api/approval-steps/:plan_id/approve
 */
const approveStep = async (req, res) => {
  const { plan_id } = req.params;
  const { comment } = req.body;
  const user_id = req.user_id;

  try {
    const employee_id = await resolveEmployeeId(user_id);
    if (!employee_id) return res.status(404).json({ success: false, message: 'Employee not found for this user.' });

    const pendingSteps = await query(`
      SELECT * FROM plan_approval_steps 
      WHERE plan_id = ? AND status = 'Pending'
      ORDER BY step_number ASC LIMIT 1
    `, [plan_id]);

    if (!pendingSteps.length) {
      return res.status(400).json({ success: false, message: 'No pending approval step found for this plan.' });
    }

    const currentStep = pendingSteps[0];

    // Check if the user is either the cached approver OR a current holder of the position (primary or delegated)
    let isAuthorized = (currentStep.approver_employee_id === employee_id);
    
    if (!isAuthorized && currentStep.org_node_id) {
      const holderCheck = await query(`
        SELECT 1 FROM employee_positions 
        WHERE employee_id = ? AND org_node_id = ?
      `, [employee_id, currentStep.org_node_id]);
      if (holderCheck.length > 0) isAuthorized = true;
    }

    // Finally check for Admin/CEO override
    if (!isAuthorized) {
      const adminCheck = await query(
        `SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?`,
        [user_id]
      );
      const isAdmin = adminCheck.some(r => ['admin', 'ceo'].includes(r.role_name?.toLowerCase()));
      if (isAdmin) isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to approve this step. You must hold the required position or be an admin.' 
      });
    }

    await query(`
      UPDATE plan_approval_steps 
      SET status = 'Approved', comment = ?, approved_at = NOW()
      WHERE id = ?
    `, [comment || '', currentStep.id]);

    await query(`
      UPDATE approvalworkflow SET status = 'Approved', approved_at = NOW(), comment = ?
      WHERE plan_id = ? AND approver_id = ?
    `, [comment || '', plan_id, employee_id]).catch(() => {});

    const remainingSteps = await query(`
      SELECT * FROM plan_approval_steps 
      WHERE plan_id = ? AND status = 'Pending'
      ORDER BY step_number ASC
    `, [plan_id]);

    let planStatus = 'Pending';
    let reportingStatus = 'deactivate';
    let nextApprover = null;

    // Fetch plan data for notification
    const planData = (await query(`
      SELECT p.plan_id, g.name as goal_name, p.user_id
      FROM plans p
      JOIN goals g ON p.goal_id = g.goal_id
      WHERE p.plan_id = ?
    `, [plan_id]))[0];

    const changedByRows = await query(`
      SELECT CONCAT(fname, ' ', lname) as full_name FROM employees WHERE employee_id = ?
    `, [employee_id]);
    const changedBy = changedByRows.length ? changedByRows[0].full_name : 'Supervisor';

    if (remainingSteps.length === 0) {
      planStatus = 'Approved';
      reportingStatus = 'active';
      await query(`UPDATE plans SET status = 'Approved', reporting = 'active', updated_at = NOW() WHERE plan_id = ?`, [plan_id]);
      await query(`UPDATE approvalworkflow SET status = 'Approved', approved_at = NOW() WHERE plan_id = ?`, [plan_id]).catch(() => {});
    } else {
      nextApprover = remainingSteps[0];
      if (nextApprover.approver_employee_id) {
        await query(`
          UPDATE approvalworkflow 
          SET approver_id = ?, status = 'Pending', approved_at = NULL, comment = ''
          WHERE plan_id = ?
        `, [nextApprover.approver_employee_id, plan_id]).catch(() => {});
      }
      
      // Notify about pending step
      NotificationService.createStatusChangeNotification(planData, 'Pending', 'Pending Update', changedBy).catch(err => 
        console.error('Telegram notification error:', err)
      );
    }

    if (remainingSteps.length === 0) {
      // Notify about final approval
      NotificationService.createStatusChangeNotification(planData, 'Pending', 'Approved', changedBy).catch(err => 
        console.error('Telegram notification error:', err)
      );
    }

    res.json({
      success: true,
      message: remainingSteps.length === 0
        ? '✅ Final approval done. Plan reporting is now active!'
        : `✅ Step ${currentStep.step_number} approved. Moving to step ${currentStep.step_number + 1}.`,
      plan_status: planStatus,
      reporting: reportingStatus,
      next_approver: nextApprover ? {
        step_number: nextApprover.step_number,
        org_node_name: nextApprover.org_node_name,
        approver_name: nextApprover.approver_name,
        approver_employee_id: nextApprover.approver_employee_id
      } : null
    });
  } catch (err) {
    console.error('approveStep error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve step', error: err.message });
  }
};

/**
 * POST /api/approval-steps/:plan_id/decline
 */
const declineStep = async (req, res) => {
  const { plan_id } = req.params;
  const { comment } = req.body;
  const user_id = req.user_id;

  try {
    const employee_id = await resolveEmployeeId(user_id);
    if (!employee_id) return res.status(404).json({ success: false, message: 'Employee not found.' });

    const pendingSteps = await query(`
      SELECT * FROM plan_approval_steps 
      WHERE plan_id = ? AND status = 'Pending'
      ORDER BY step_number ASC LIMIT 1
    `, [plan_id]);

    if (!pendingSteps.length) {
      return res.status(400).json({ success: false, message: 'No pending approval step found.' });
    }

    const currentStep = pendingSteps[0];

    // Check if the user is authorized (cached approver, current holder, or admin/ceo)
    let isAuthorized = (currentStep.approver_employee_id === employee_id);
    
    if (!isAuthorized && currentStep.org_node_id) {
      const holderCheck = await query(`
        SELECT 1 FROM employee_positions WHERE employee_id = ? AND org_node_id = ?
      `, [employee_id, currentStep.org_node_id]);
      if (holderCheck.length > 0) isAuthorized = true;
    }

    if (!isAuthorized) {
      const adminCheck = await query(
        `SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.user_id = ?`,
        [user_id]
      );
      const isAdmin = adminCheck.some(r => ['admin', 'ceo'].includes(r.role_name?.toLowerCase()));
      if (isAdmin) isAuthorized = true;
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to decline this step.' });
    }

    await query(`
      UPDATE plan_approval_steps SET status = 'Declined', comment = ?, approved_at = NOW()
      WHERE id = ?
    `, [comment || '', currentStep.id]);

    await query(`UPDATE plans SET status = 'Declined', updated_at = NOW() WHERE plan_id = ?`, [plan_id]);
    await query(`UPDATE approvalworkflow SET status = 'Declined', comment = ?, approved_at = NOW() WHERE plan_id = ?`, [comment || '', plan_id]).catch(() => {});

    // Fetch plan data and changedBy for notification
    const planData = (await query(`
      SELECT p.plan_id, g.name as goal_name, p.user_id
      FROM plans p
      JOIN goals g ON p.goal_id = g.goal_id
      WHERE p.plan_id = ?
    `, [plan_id]))[0];

    const changedByRows = await query(`
      SELECT CONCAT(fname, ' ', lname) as full_name FROM employees WHERE employee_id = ?
    `, [employee_id]);
    const changedBy = changedByRows.length ? changedByRows[0].full_name : 'Supervisor';

    // Notify about decline
    NotificationService.createStatusChangeNotification(planData, 'Pending', 'Declined', changedBy).catch(err => 
      console.error('Telegram notification error:', err)
    );

    res.json({
      success: true,
      message: `❌ Plan declined at step ${currentStep.step_number} (${currentStep.org_node_name}).`,
      declined_by: currentStep.approver_name,
      org_node: currentStep.org_node_name
    });
  } catch (err) {
    console.error('declineStep error:', err);
    res.status(500).json({ success: false, message: 'Failed to decline step', error: err.message });
  }
};

/**
 * GET /api/supervisor/hierarchy-plans
 */
const getPendingPlansForApprover = async (req, res) => {
  const user_id = req.user_id;

  try {
    const employee_id = await resolveEmployeeId(user_id);
    if (!employee_id) return res.status(404).json({ success: false, message: 'Employee not found.' });

    const plans = await query(`
      SELECT 
        p.plan_id,
        p.status,
        p.created_at,
        p.year,
        p.department_name,
        CONCAT(e.fname, ' ', e.lname) as plan_creator_name,
        CONCAT(e.fname, ' ', e.lname) as created_by_name,
        CONCAT(e.fname, ' ', e.lname) as created_by,
        e.employee_id as creator_employee_id,
        pas.step_number,
        pas.org_node_name as approval_step_name,
        pas.id as step_id,
        pas.approver_employee_id,
        COALESCE(os.name_amharic, os.name) as org_node_name,
        os.type as org_node_type,
        g.name as goal_name,
        o.name as objective_name,
        so.specific_objective_name,
        sod.specific_objective_detailname,
        sod.specific_objective_detailname as detail_name,
        sod.baseline, sod.plan as plan_value, sod.measurement,
        sod.deadline, sod.priority
      FROM plan_approval_steps pas
      JOIN plans p ON pas.plan_id = p.plan_id
      JOIN employees e ON p.employee_id = e.employee_id
      LEFT JOIN employee_positions ep2 ON e.employee_id = ep2.employee_id AND ep2.is_primary = 1
      LEFT JOIN organization_structure os ON COALESCE(p.department_id, ep2.org_node_id, e.department_id) = os.id
      LEFT JOIN goals g ON p.goal_id = g.goal_id
      LEFT JOIN objectives o ON p.objective_id = o.objective_id
      LEFT JOIN specific_objectives so ON p.specific_objective_id = so.specific_objective_id
      LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE (pas.approver_employee_id = ? OR pas.org_node_id IN (
          SELECT org_node_id FROM employee_positions WHERE employee_id = ?
        ))
        AND pas.status = 'Pending'
        AND p.status != 'Declined'
        AND NOT EXISTS (
          SELECT 1 FROM plan_approval_steps pas2
          WHERE pas2.plan_id = pas.plan_id
            AND pas2.step_number < pas.step_number
            AND pas2.status = 'Pending'
        )
      ORDER BY p.created_at DESC
    `, [employee_id, employee_id]);

    res.json({ success: true, plans, count: plans.length });
  } catch (err) {
    console.error('getPendingPlansForApprover error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch pending plans', error: err.message });
  }
};

module.exports = {
  buildApprovalChain,
  buildAndSavePlanApprovalChain,
  getApprovalSteps,
  approveStep,
  declineStep,
  getPendingPlansForApprover
};
