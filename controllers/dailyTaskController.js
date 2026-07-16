const db = require("../models/db");

// ============================================================================
// DAILY TASK CONTROLLER
// Handles: Daily office task management (personal task planner)
// ============================================================================

// Create daily task
exports.createDailyTask = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, description, priority, task_date, start_time, end_time, category, notes } = req.body;

    if (!title || !task_date) {
      return res.status(400).json({ success: false, message: "Title and task_date are required" });
    }

    const query = `
      INSERT INTO daily_tasks (user_id, title, description, priority, task_date, start_time, end_time, category, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [userId, title, description || null, priority || 'medium', task_date, start_time || null, end_time || null, category || 'general', notes || null], (err, result) => {
      if (err) {
        console.error("Error creating daily task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      res.json({ success: true, message: "Daily task created", daily_task_id: result.insertId });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get daily tasks for a date (or date range)
exports.getDailyTasks = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { date, start_date, end_date, status } = req.query;

    let query = `
      SELECT * FROM daily_tasks
      WHERE user_id = ?
    `;
    const params = [userId];

    if (date) {
      query += ` AND task_date = ?`;
      params.push(date);
    } else if (start_date && end_date) {
      query += ` AND task_date BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY task_date DESC, COALESCE(start_time, '23:59:59') ASC, priority DESC`;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching daily tasks:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      res.json({ success: true, tasks: results });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update daily task
exports.updateDailyTask = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { title, description, priority, status, task_date, start_time, end_time, category, notes } = req.body;

    let updates = [];
    let params = [];

    if (title !== undefined) { updates.push(`title = ?`); params.push(title); }
    if (description !== undefined) { updates.push(`description = ?`); params.push(description); }
    if (priority !== undefined) { updates.push(`priority = ?`); params.push(priority); }
    if (status !== undefined) { updates.push(`status = ?`); params.push(status); }
    if (task_date !== undefined) { updates.push(`task_date = ?`); params.push(task_date); }
    if (start_time !== undefined) { updates.push(`start_time = ?`); params.push(start_time); }
    if (end_time !== undefined) { updates.push(`end_time = ?`); params.push(end_time); }
    if (category !== undefined) { updates.push(`category = ?`); params.push(category); }
    if (notes !== undefined) { updates.push(`notes = ?`); params.push(notes); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    updates.push(`updated_at = NOW()`);
    const query = `UPDATE daily_tasks SET ${updates.join(', ')} WHERE daily_task_id = ? AND user_id = ?`;
    params.push(id, userId);

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Error updating daily task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      res.json({ success: true, message: "Daily task updated" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete daily task
exports.deleteDailyTask = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    db.query(`DELETE FROM daily_tasks WHERE daily_task_id = ? AND user_id = ?`, [id, userId], (err, result) => {
      if (err) {
        console.error("Error deleting daily task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      res.json({ success: true, message: "Daily task deleted" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get daily task statistics
exports.getDailyTaskStats = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const today = new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND task_date = ?) as today_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND task_date = ? AND status = 'todo') as today_todo,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND task_date = ? AND status = 'in_progress') as today_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND task_date = ? AND status = 'done') as today_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND task_date = DATE_SUB(?, INTERVAL 1 DAY) AND status = 'done') as yesterday_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(task_date, 1) = YEARWEEK(?, 1) AND status = 'done') as week_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(task_date, 1) = YEARWEEK(?, 1)) as week_total
    `;

    db.query(query, [userId, today, userId, today, userId, today, userId, today, userId, today, userId, today, userId, today], (err, results) => {
      if (err) {
        console.error("Error fetching daily task stats:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const stats = results[0] || {};
      stats.today_completion_rate = stats.today_total > 0 ? Math.round((stats.today_done / stats.today_total) * 100) : 0;
      stats.week_completion_rate = stats.week_total > 0 ? Math.round((stats.week_done / stats.week_total) * 100) : 0;

      res.json({ success: true, stats });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
