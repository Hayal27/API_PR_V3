const express = require('express');
const router = express.Router();
const con = require('../models/db');
const verifyToken = require('../middleware/verifyToken');

// ─── GET /api/risks ─────────────────────────────────────────────────────────
// Returns all risk flags (privileged users see all; others see their own action plans)
router.get('/risks', verifyToken, (req, res) => {
  const userId = req.user_id;
  con.query(
    `SELECT u.role_id, LOWER(COALESCE(r.role_name, '')) AS role_name 
     FROM users u 
     LEFT JOIN roles r ON u.role_id = r.role_id 
     WHERE u.user_id = ?`,
    [userId],
    (userErr, userRows) => {
      const roleId = userRows && userRows.length > 0 ? Number(userRows[0].role_id) : 0;
      const roleName = userRows && userRows.length > 0 ? userRows[0].role_name : '';

      const isPrivileged = [1, 2, 3, 29].includes(roleId) ||
        roleName.includes('ceo') ||
        roleName.includes('deputy') ||
        roleName.includes('admin') ||
        roleName.includes('executive') ||
        roleName.includes('director');

      const sql = `
        SELECT rf.*,
          COALESCE(sod.specific_objective_detailname, sod.name, sod.details, 'Action Plan') AS action_plan_name,
          CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) AS reported_by_name,
          u.avatar_url AS reported_by_avatar
        FROM risk_flags rf
        LEFT JOIN specific_objective_details sod ON rf.action_plan_id = sod.specific_objective_detail_id
        LEFT JOIN users u ON rf.reported_by = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        ${isPrivileged ? '' : 'WHERE sod.user_id = ? OR sod.created_by = ?'}
        ORDER BY FIELD(rf.risk_level,'critical','high','medium','low'), rf.created_at DESC
      `;
      const params = isPrivileged ? [] : [userId, userId];
      con.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Error fetching risks', error: err.message });
        res.json({ success: true, risks: rows || [] });
      });
    }
  );
});

// ─── GET /api/risks/action-plan/:id ─────────────────────────────────────────
router.get('/risks/action-plan/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT rf.*,
      CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) AS reported_by_name
    FROM risk_flags rf
    LEFT JOIN users u ON rf.reported_by = u.user_id
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    WHERE rf.action_plan_id = ?
    ORDER BY FIELD(rf.risk_level,'critical','high','medium','low'), rf.created_at DESC
  `;
  con.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching risks', error: err.message });
    res.json({ success: true, risks: rows || [] });
  });
});

// ─── POST /api/risks ─────────────────────────────────────────────────────────
router.post('/risks', verifyToken, (req, res) => {
  const { action_plan_id, risk_level, title, description, mitigation, escalation_target } = req.body;
  if (!action_plan_id || !title) return res.status(400).json({ success: false, message: 'action_plan_id and title are required' });

  const riskLevelToEscalation = {
    critical: 'CEO',
    high: 'Senior Management Committee',
    medium: 'Division Heads',
    low: 'Department Head',
  };
  const escalation = escalation_target || riskLevelToEscalation[risk_level] || 'Department Head';

  con.query(
    'INSERT INTO risk_flags (action_plan_id, risk_level, title, description, mitigation, escalation_target, reported_by) VALUES (?,?,?,?,?,?,?)',
    [action_plan_id, risk_level || 'medium', title, description || null, mitigation || null, escalation, req.user_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error creating risk', error: err.message });
      res.json({ success: true, risk_id: result.insertId, message: 'Risk flagged successfully' });
    }
  );
});

// ─── POST /api/risks/auto-scan ──────────────────────────────────────────────
// Scans action plans based on parameters (progress %, days overdue, priority),
// auto-registers risk flags, determines escalation, and dispatches notifications to CEO & authorities.
router.post('/risks/auto-scan', verifyToken, async (req, res) => {
  try {
    const plansSql = `
      SELECT
        sod.specific_objective_detail_id AS id,
        COALESCE(sod.specific_objective_detailname, sod.name, sod.details, 'Action Plan') AS name,
        COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0) AS progress,
        sod.deadline,
        sod.priority,
        sod.status,
        sod.user_id,
        sod.created_by,
        so.specific_objective_name AS kpi_name
      FROM specific_objective_details sod
      LEFT JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
    `;
    const [plans] = await con.promise().query(plansSql);

    let newlyRegisteredCount = 0;
    let notificationsCount = 0;
    const now = new Date();

    for (const plan of plans) {
      const progress = Number(plan.progress) || 0;
      const deadline = plan.deadline ? new Date(plan.deadline) : null;
      const daysDiff = deadline ? Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)) : 999;
      const isOverdue = deadline && daysDiff < 0;

      let riskLevel = null;
      let escalationTarget = null;
      let title = null;
      let description = null;
      let mitigation = null;

      // Evaluation Rules based on parameters
      if (isOverdue && progress < 70) {
        // Critical: Overdue & Off Track
        riskLevel = 'critical';
        escalationTarget = 'CEO';
        title = `🚨 OVERDUE CRITICAL RISK: ${plan.name} (${Math.abs(daysDiff)} days overdue)`;
        description = `Action Plan "${plan.name}" (KPI: ${plan.kpi_name || 'N/A'}) missed its deadline of ${deadline.toLocaleDateString()} with progress at only ${progress}%. Immediate executive response required.`;
        mitigation = `Emergency intervention plan needed. Reallocate priority resources and request CEO waiver/extension.`;
      } else if (daysDiff <= 7 && daysDiff >= 0 && progress < 60) {
        // High: Deadline near (<7 days) & progress under 60%
        riskLevel = 'high';
        escalationTarget = 'Senior Management Committee';
        title = `🟠 HIGH RISK: Target deadline near for ${plan.name} (${daysDiff} days left)`;
        description = `Action Plan deadline is in ${daysDiff} days (${deadline.toLocaleDateString()}) but progress is currently at ${progress}%. High risk of missing quarterly delivery.`;
        mitigation = `Formulate corrective action plan within 1 week and re-assign tasks to subordinate staff.`;
      } else if (progress < 70 && plan.status === 'in_progress') {
        // Medium: Off track progress under normal timeline
        riskLevel = 'medium';
        escalationTarget = 'Division Heads';
        title = `🟡 MEDIUM RISK: Off track progress on ${plan.name} (${progress}%)`;
        description = `Action Plan progress is currently ${progress}%, falling below the 70% M&E threshold (Off Track).`;
        mitigation = `Division Head review required to propose department-level corrective mitigation.`;
      }

      if (riskLevel && title) {
        // Check if an open/monitoring risk with identical title already exists for this action plan
        const [existing] = await con.promise().query(
          `SELECT risk_id FROM risk_flags WHERE action_plan_id = ? AND title = ? AND status != 'resolved'`,
          [plan.id, title]
        );

        if (existing.length === 0) {
          // Auto-register risk flag
          await con.promise().query(
            `INSERT INTO risk_flags (action_plan_id, risk_level, title, description, mitigation, escalation_target, status, reported_by)
             VALUES (?, ?, ?, ?, ?, ?, 'open', ?)`,
            [plan.id, riskLevel, title, description, mitigation, escalationTarget, req.user_id]
          );
          newlyRegisteredCount++;

          // Send notifications to CEO (roles 1, 2, 29) + plan owners
          const targetUsersSql = riskLevel === 'critical'
            ? `SELECT user_id FROM users WHERE role_id IN (1, 2, 29) OR user_id IN (?, ?)`
            : `SELECT user_id FROM users WHERE user_id IN (?, ?)`;
          
          const [usersToNotify] = await con.promise().query(targetUsersSql, [plan.user_id || 0, plan.created_by || 0]);

          for (const u of usersToNotify) {
            await con.promise().query(
              `INSERT INTO notifications (user_id, type, title, message, created_at)
               VALUES (?, 'risk_alert', ?, ?, NOW())`,
              [u.user_id, `🚩 M&E ${riskLevel.toUpperCase()} Risk Alert: Escalated to ${escalationTarget}`, description]
            );
            notificationsCount++;
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Auto-scan completed! Registered ${newlyRegisteredCount} new risk flags and sent ${notificationsCount} escalation notifications.`,
      newlyRegisteredCount,
      notificationsCount
    });

  } catch (err) {
    console.error('Error in risk auto-scan:', err);
    res.status(500).json({ success: false, message: 'Error running auto-risk scan', error: err.message });
  }
});

// ─── PUT /api/risks/:id ──────────────────────────────────────────────────────
router.put('/risks/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { risk_level, title, description, mitigation, escalation_target, status } = req.body;
  con.query(
    'UPDATE risk_flags SET risk_level=COALESCE(?,risk_level), title=COALESCE(?,title), description=COALESCE(?,description), mitigation=COALESCE(?,mitigation), escalation_target=COALESCE(?,escalation_target), status=COALESCE(?,status) WHERE risk_id=?',
    [risk_level, title, description, mitigation, escalation_target, status, id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating risk', error: err.message });
      res.json({ success: true, message: 'Risk updated' });
    }
  );
});

// ─── DELETE /api/risks/:id ───────────────────────────────────────────────────
router.delete('/risks/:id', verifyToken, (req, res) => {
  con.query('DELETE FROM risk_flags WHERE risk_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error deleting risk', error: err.message });
    res.json({ success: true, message: 'Risk deleted' });
  });
});

module.exports = router;
