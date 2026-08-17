const express = require('express');
const router = express.Router();
const con = require('../models/db');
const verifyToken = require('../middleware/verifyToken');

// ─── GET /api/data-quality/summary ─────────────────────────────────────────
// Org-wide quality score aggregate
router.get('/data-quality/summary', verifyToken, (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total_checks,
      SUM(is_valid + is_reliable + is_timely + is_complete + is_accurate + is_integral) AS total_passed,
      COUNT(*) * 6 AS total_possible,
      ROUND(SUM(is_valid + is_reliable + is_timely + is_complete + is_accurate + is_integral) / (COUNT(*) * 6) * 100, 1) AS overall_quality_pct,
      SUM(CASE WHEN signed_off_at IS NOT NULL THEN 1 ELSE 0 END) AS signed_off_count,
      SUM(is_valid) AS valid_count,
      SUM(is_reliable) AS reliable_count,
      SUM(is_timely) AS timely_count,
      SUM(is_complete) AS complete_count,
      SUM(is_accurate) AS accurate_count,
      SUM(is_integral) AS integral_count
    FROM data_quality_checks
  `;
  con.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching quality summary', error: err.message });
    res.json({ success: true, summary: rows[0] || {} });
  });
});

// ─── GET /api/data-quality/:action_plan_id ──────────────────────────────────
router.get('/data-quality/:action_plan_id', verifyToken, (req, res) => {
  const { action_plan_id } = req.params;
  const { period } = req.query;
  let sql = 'SELECT dqc.*, CONCAT(COALESCE(e.fname,""), " ", COALESCE(e.lname,"")) AS supervisor_name FROM data_quality_checks dqc LEFT JOIN users u ON dqc.supervisor_id = u.user_id LEFT JOIN employees e ON u.employee_id = e.employee_id WHERE dqc.action_plan_id = ?';
  const params = [action_plan_id];
  if (period) { sql += ' AND dqc.reporting_period = ?'; params.push(period); }
  sql += ' ORDER BY dqc.submitted_at DESC LIMIT 10';
  con.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching quality checks', error: err.message });
    res.json({ success: true, checks: rows || [] });
  });
});

// ─── POST /api/data-quality ─────────────────────────────────────────────────
// Upsert quality checklist for an action plan + reporting period
router.post('/data-quality', verifyToken, (req, res) => {
  const { action_plan_id, reporting_period, is_valid, is_reliable, is_timely, is_complete, is_accurate, is_integral } = req.body;
  if (!action_plan_id) return res.status(400).json({ success: false, message: 'action_plan_id is required' });

  const period = reporting_period || new Date().toISOString().slice(0, 7); // default YYYY-MM

  const sql = `
    INSERT INTO data_quality_checks (action_plan_id, reporting_period, is_valid, is_reliable, is_timely, is_complete, is_accurate, is_integral, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      is_valid = VALUES(is_valid),
      is_reliable = VALUES(is_reliable),
      is_timely = VALUES(is_timely),
      is_complete = VALUES(is_complete),
      is_accurate = VALUES(is_accurate),
      is_integral = VALUES(is_integral),
      submitted_at = NOW()
  `;
  con.query(sql, [action_plan_id, period, is_valid?1:0, is_reliable?1:0, is_timely?1:0, is_complete?1:0, is_accurate?1:0, is_integral?1:0], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Error saving quality check', error: err.message });
    res.json({ success: true, check_id: result.insertId || null, message: 'Quality check saved' });
  });
});

// ─── PUT /api/data-quality/:check_id/sign-off ───────────────────────────────
// Supervisor signs off on a quality check
router.put('/data-quality/:check_id/sign-off', verifyToken, (req, res) => {
  const { check_id } = req.params;
  const { supervisor_note } = req.body;
  con.query(
    'UPDATE data_quality_checks SET supervisor_id=?, supervisor_note=?, signed_off_at=NOW() WHERE check_id=?',
    [req.user_id, supervisor_note || null, check_id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error signing off', error: err.message });
      res.json({ success: true, message: 'Quality check signed off successfully' });
    }
  );
});

module.exports = router;
