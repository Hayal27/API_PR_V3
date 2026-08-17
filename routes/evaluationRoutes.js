const express = require('express');
const router = express.Router();
const con = require('../models/db');
const verifyToken = require('../middleware/verifyToken');

// ─── GET /api/evaluations ────────────────────────────────────────────────────
router.get('/evaluations', verifyToken, (req, res) => {
  const sql = `
    SELECT ev.*,
      CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) AS created_by_name
    FROM evaluations ev
    LEFT JOIN users u ON ev.created_by = u.user_id
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    ORDER BY ev.period_year DESC, ev.created_at DESC
  `;
  con.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Error fetching evaluations', error: err.message });
    res.json({ success: true, evaluations: rows || [] });
  });
});

// ─── POST /api/evaluations ───────────────────────────────────────────────────
router.post('/evaluations', verifyToken, (req, res) => {
  const { type, title, timing, key_questions, led_by, period_year } = req.body;
  if (!type || !title) return res.status(400).json({ success: false, message: 'type and title are required' });
  con.query(
    'INSERT INTO evaluations (type, title, timing, key_questions, led_by, period_year, created_by) VALUES (?,?,?,?,?,?,?)',
    [type, title, timing || null, key_questions || null, led_by || null, period_year || new Date().getFullYear(), req.user_id],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Error creating evaluation', error: err.message });
      res.json({ success: true, evaluation_id: result.insertId, message: 'Evaluation created' });
    }
  );
});

// ─── PUT /api/evaluations/:id ────────────────────────────────────────────────
router.put('/evaluations/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, timing, key_questions, led_by, status, findings, recommendations, period_year } = req.body;
  con.query(
    `UPDATE evaluations SET
      title = COALESCE(?, title),
      timing = COALESCE(?, timing),
      key_questions = COALESCE(?, key_questions),
      led_by = COALESCE(?, led_by),
      status = COALESCE(?, status),
      findings = COALESCE(?, findings),
      recommendations = COALESCE(?, recommendations),
      period_year = COALESCE(?, period_year)
    WHERE evaluation_id = ?`,
    [title, timing, key_questions, led_by, status, findings, recommendations, period_year, id],
    (err) => {
      if (err) return res.status(500).json({ success: false, message: 'Error updating evaluation', error: err.message });
      res.json({ success: true, message: 'Evaluation updated' });
    }
  );
});

// ─── DELETE /api/evaluations/:id ─────────────────────────────────────────────
router.delete('/evaluations/:id', verifyToken, (req, res) => {
  con.query('DELETE FROM evaluations WHERE evaluation_id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Error deleting evaluation', error: err.message });
    res.json({ success: true, message: 'Evaluation deleted' });
  });
});

module.exports = router;
