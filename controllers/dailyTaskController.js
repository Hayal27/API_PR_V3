const db = require("../models/db");
const NotificationService = require("../services/notificationService");

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

// Get daily tasks for a date (or date range / period)
exports.getDailyTasks = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { date, start_date, end_date, status, period } = req.query;
    const refDate = date || new Date().toISOString().split('T')[0];

    let query = `
      SELECT 
        daily_task_id,
        user_id,
        title,
        description,
        priority,
        status,
        DATE_FORMAT(task_date, '%Y-%m-%d') as task_date,
        start_time,
        end_time,
        category,
        notes,
        created_at,
        updated_at
      FROM daily_tasks
      WHERE user_id = ?
    `;
    const params = [userId];

    if (period) {
      const p = String(period).toLowerCase().trim();
      if (p === 'today' || p === 'daily') {
        query += ` AND DATE(task_date) = ?`;
        params.push(refDate);
      } else if (p === 'yesterday' || p === 'last_day') {
        query += ` AND DATE(task_date) = DATE_SUB(?, INTERVAL 1 DAY)`;
        params.push(refDate);
      } else if (p === 'this_week' || p === 'weekly') {
        query += ` AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(?, 1)`;
        params.push(refDate);
      } else if (p === 'last_week') {
        query += ` AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(DATE_SUB(?, INTERVAL 1 WEEK), 1)`;
        params.push(refDate);
      } else if (p === 'this_month' || p === 'monthly') {
        query += ` AND YEAR(DATE(task_date)) = YEAR(?) AND MONTH(DATE(task_date)) = MONTH(?)`;
        params.push(refDate, refDate);
      } else if (p === 'last_month') {
        query += ` AND DATE(task_date) >= DATE_FORMAT(DATE_SUB(?, INTERVAL 1 MONTH), '%Y-%m-01') AND DATE(task_date) < DATE_FORMAT(?, '%Y-%m-01')`;
        params.push(refDate, refDate);
      } else if (p === 'this_year' || p === 'yearly') {
        query += ` AND YEAR(DATE(task_date)) = YEAR(?)`;
        params.push(refDate);
      } else if (p === 'last_year') {
        query += ` AND YEAR(DATE(task_date)) = YEAR(?) - 1`;
        params.push(refDate);
      } else if (p === 'all') {
        // No date constraint to fetch all tasks
      } else {
        // Fallback for custom or daily
        query += ` AND DATE(task_date) = ?`;
        params.push(refDate);
      }
    } else if (start_date && end_date) {
      query += ` AND DATE(task_date) BETWEEN ? AND ?`;
      params.push(start_date, end_date);
    } else if (date) {
      query += ` AND DATE(task_date) = ?`;
      params.push(date);
    }

    if (status && status !== 'all') {
      const s = status.toLowerCase();
      if (s === 'todo') {
        query += ` AND (status = 'todo' OR status = 'pending')`;
      } else if (s === 'in_progress') {
        query += ` AND status = 'in_progress'`;
      } else if (s === 'done' || s === 'completed') {
        query += ` AND (status = 'done' OR status = 'completed')`;
      } else {
        query += ` AND status = ?`;
        params.push(status);
      }
    }

    query += ` ORDER BY task_date DESC, COALESCE(start_time, '23:59:59') ASC, priority DESC, daily_task_id DESC`;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching daily tasks:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      res.json({ success: true, tasks: results, period: period || (date ? 'day' : 'all'), count: results.length });
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

// Get daily task statistics across Daily, Weekly, Monthly, and Yearly periods
exports.getDailyTaskStats = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const today = new Date().toISOString().split('T')[0];

    const query = `
      SELECT 
        -- Today Metrics
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = ?) as today_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = ? AND (status = 'todo' OR status = 'pending')) as today_todo,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = ? AND status = 'in_progress') as today_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = ? AND (status = 'done' OR status = 'completed')) as today_done,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = ? AND start_time IS NOT NULL AND end_time IS NOT NULL) as today_hours_planned,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = ? AND (status = 'done' OR status = 'completed') AND start_time IS NOT NULL AND end_time IS NOT NULL) as today_hours_completed,

        -- Yesterday (Last Day) Metrics
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = DATE_SUB(?, INTERVAL 1 DAY)) as yesterday_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = DATE_SUB(?, INTERVAL 1 DAY) AND (status = 'done' OR status = 'completed')) as yesterday_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = DATE_SUB(?, INTERVAL 1 DAY) AND status = 'in_progress') as yesterday_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = DATE_SUB(?, INTERVAL 1 DAY) AND (status = 'todo' OR status = 'pending')) as yesterday_todo,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = DATE_SUB(?, INTERVAL 1 DAY) AND start_time IS NOT NULL AND end_time IS NOT NULL) as yesterday_hours_planned,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = DATE_SUB(?, INTERVAL 1 DAY) AND (status = 'done' OR status = 'completed') AND start_time IS NOT NULL AND end_time IS NOT NULL) as yesterday_hours_completed,

        -- Weekly Metrics (This Week)
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(?, 1)) as week_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(?, 1) AND (status = 'done' OR status = 'completed')) as week_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(?, 1) AND status = 'in_progress') as week_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(?, 1) AND (status = 'todo' OR status = 'pending')) as week_todo,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(?, 1) AND start_time IS NOT NULL AND end_time IS NOT NULL) as week_hours_planned,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(?, 1) AND (status = 'done' OR status = 'completed') AND start_time IS NOT NULL AND end_time IS NOT NULL) as week_hours_completed,

        -- Last Week Metrics
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(DATE_SUB(?, INTERVAL 1 WEEK), 1)) as last_week_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(DATE_SUB(?, INTERVAL 1 WEEK), 1) AND (status = 'done' OR status = 'completed')) as last_week_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(DATE_SUB(?, INTERVAL 1 WEEK), 1) AND status = 'in_progress') as last_week_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(DATE_SUB(?, INTERVAL 1 WEEK), 1) AND (status = 'todo' OR status = 'pending')) as last_week_todo,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(DATE_SUB(?, INTERVAL 1 WEEK), 1) AND start_time IS NOT NULL AND end_time IS NOT NULL) as last_week_hours_planned,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND YEARWEEK(DATE(task_date), 1) = YEARWEEK(DATE_SUB(?, INTERVAL 1 WEEK), 1) AND (status = 'done' OR status = 'completed') AND start_time IS NOT NULL AND end_time IS NOT NULL) as last_week_hours_completed,

        -- Monthly Metrics (This Month)
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND MONTH(DATE(task_date)) = MONTH(?)) as month_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND MONTH(DATE(task_date)) = MONTH(?) AND (status = 'done' OR status = 'completed')) as month_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND MONTH(DATE(task_date)) = MONTH(?) AND status = 'in_progress') as month_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND MONTH(DATE(task_date)) = MONTH(?) AND (status = 'todo' OR status = 'pending')) as month_todo,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND MONTH(DATE(task_date)) = MONTH(?) AND start_time IS NOT NULL AND end_time IS NOT NULL) as month_hours_planned,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND MONTH(DATE(task_date)) = MONTH(?) AND (status = 'done' OR status = 'completed') AND start_time IS NOT NULL AND end_time IS NOT NULL) as month_hours_completed,

        -- Last Month Metrics
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) >= DATE_FORMAT(DATE_SUB(?, INTERVAL 1 MONTH), '%Y-%m-01') AND DATE(task_date) < DATE_FORMAT(?, '%Y-%m-01')) as last_month_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) >= DATE_FORMAT(DATE_SUB(?, INTERVAL 1 MONTH), '%Y-%m-01') AND DATE(task_date) < DATE_FORMAT(?, '%Y-%m-01') AND (status = 'done' OR status = 'completed')) as last_month_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) >= DATE_FORMAT(DATE_SUB(?, INTERVAL 1 MONTH), '%Y-%m-01') AND DATE(task_date) < DATE_FORMAT(?, '%Y-%m-01') AND status = 'in_progress') as last_month_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) >= DATE_FORMAT(DATE_SUB(?, INTERVAL 1 MONTH), '%Y-%m-01') AND DATE(task_date) < DATE_FORMAT(?, '%Y-%m-01') AND (status = 'todo' OR status = 'pending')) as last_month_todo,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND DATE(task_date) >= DATE_FORMAT(DATE_SUB(?, INTERVAL 1 MONTH), '%Y-%m-01') AND DATE(task_date) < DATE_FORMAT(?, '%Y-%m-01') AND start_time IS NOT NULL AND end_time IS NOT NULL) as last_month_hours_planned,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND DATE(task_date) >= DATE_FORMAT(DATE_SUB(?, INTERVAL 1 MONTH), '%Y-%m-01') AND DATE(task_date) < DATE_FORMAT(?, '%Y-%m-01') AND (status = 'done' OR status = 'completed') AND start_time IS NOT NULL AND end_time IS NOT NULL) as last_month_hours_completed,

        -- Yearly Metrics (This Year)
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?)) as year_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND (status = 'done' OR status = 'completed')) as year_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND status = 'in_progress') as year_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND (status = 'todo' OR status = 'pending')) as year_todo,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND start_time IS NOT NULL AND end_time IS NOT NULL) as year_hours_planned,
        (SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, start_time, end_time)), 0) / 60 FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) AND (status = 'done' OR status = 'completed') AND start_time IS NOT NULL AND end_time IS NOT NULL) as year_hours_completed,

        -- Last Year Metrics
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) - 1) as last_year_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) - 1 AND (status = 'done' OR status = 'completed')) as last_year_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) - 1 AND status = 'in_progress') as last_year_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND YEAR(DATE(task_date)) = YEAR(?) - 1 AND (status = 'todo' OR status = 'pending')) as last_year_todo,

        -- All Time Metrics
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ?) as all_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND (status = 'done' OR status = 'completed')) as all_done,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND status = 'in_progress') as all_in_progress,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND (status = 'todo' OR status = 'pending')) as all_todo
    `;

    const params = [
      // Today (6)
      userId, today, userId, today, userId, today, userId, today, userId, today, userId, today,
      // Yesterday (6)
      userId, today, userId, today, userId, today, userId, today, userId, today, userId, today,
      // Week (6)
      userId, today, userId, today, userId, today, userId, today, userId, today, userId, today,
      // Last Week (6)
      userId, today, userId, today, userId, today, userId, today, userId, today, userId, today,
      // Month (6)
      userId, today, today, userId, today, today, userId, today, today, userId, today, today, userId, today, today, userId, today, today,
      // Last Month (6)
      userId, today, today, userId, today, today, userId, today, today, userId, today, today, userId, today, today, userId, today, today,
      // Year (6)
      userId, today, userId, today, userId, today, userId, today, userId, today, userId, today,
      // Last Year (4)
      userId, today, userId, today, userId, today, userId, today,
      // All Time (4)
      userId, userId, userId, userId
    ];

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching daily task stats:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const stats = results[0] || {};
      stats.today_completion_rate = stats.today_total > 0 ? Math.round((stats.today_done / stats.today_total) * 100) : 0;
      stats.yesterday_completion_rate = stats.yesterday_total > 0 ? Math.round((stats.yesterday_done / stats.yesterday_total) * 100) : 0;
      stats.week_completion_rate = stats.week_total > 0 ? Math.round((stats.week_done / stats.week_total) * 100) : 0;
      stats.last_week_completion_rate = stats.last_week_total > 0 ? Math.round((stats.last_week_done / stats.last_week_total) * 100) : 0;
      stats.month_completion_rate = stats.month_total > 0 ? Math.round((stats.month_done / stats.month_total) * 100) : 0;
      stats.last_month_completion_rate = stats.last_month_total > 0 ? Math.round((stats.last_month_done / stats.last_month_total) * 100) : 0;
      stats.year_completion_rate = stats.year_total > 0 ? Math.round((stats.year_done / stats.year_total) * 100) : 0;
      stats.last_year_completion_rate = stats.last_year_total > 0 ? Math.round((stats.last_year_done / stats.last_year_total) * 100) : 0;
      stats.all_completion_rate = stats.all_total > 0 ? Math.round((stats.all_done / stats.all_total) * 100) : 0;

      stats.today_hours_planned = Number(Number(stats.today_hours_planned || 0).toFixed(1));
      stats.today_hours_completed = Number(Number(stats.today_hours_completed || 0).toFixed(1));
      stats.yesterday_hours_planned = Number(Number(stats.yesterday_hours_planned || 0).toFixed(1));
      stats.yesterday_hours_completed = Number(Number(stats.yesterday_hours_completed || 0).toFixed(1));
      stats.week_hours_planned = Number(Number(stats.week_hours_planned || 0).toFixed(1));
      stats.week_hours_completed = Number(Number(stats.week_hours_completed || 0).toFixed(1));
      stats.last_week_hours_planned = Number(Number(stats.last_week_hours_planned || 0).toFixed(1));
      stats.last_week_hours_completed = Number(Number(stats.last_week_hours_completed || 0).toFixed(1));
      stats.month_hours_planned = Number(Number(stats.month_hours_planned || 0).toFixed(1));
      stats.month_hours_completed = Number(Number(stats.month_hours_completed || 0).toFixed(1));
      stats.last_month_hours_planned = Number(Number(stats.last_month_hours_planned || 0).toFixed(1));
      stats.last_month_hours_completed = Number(Number(stats.last_month_hours_completed || 0).toFixed(1));
      stats.year_hours_planned = Number(Number(stats.year_hours_planned || 0).toFixed(1));
      stats.year_hours_completed = Number(Number(stats.year_hours_completed || 0).toFixed(1));

      // Retrieve authenticated user's profile information
      const userQuery = `
        SELECT 
          u.user_id,
          COALESCE(
            NULLIF(TRIM(CONCAT(COALESCE(e.fname, e.name, ''), ' ', COALESCE(e.lname, ''))), ''),
            e.name,
            u.username
          ) as full_name,
          COALESCE(e.position, r.role_name, 'Officer') as position,
          COALESCE(d.name, 'Ethiopian IT Park') as department_name,
          r.role_name
        FROM users u
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        WHERE u.user_id = ?
      `;

      db.query(userQuery, [userId], (uErr, userRows) => {
        const userInfo = (userRows && userRows.length > 0) ? {
          name: (userRows[0].full_name || '').trim(),
          position: userRows[0].position || userRows[0].role_name || 'Officer',
          department_name: userRows[0].department_name || 'Ethiopian IT Park',
          role_name: userRows[0].role_name || 'Staff'
        } : null;

        res.json({ success: true, stats, userInfo });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send task reminder notification (In-app + Telegram)
exports.sendTaskReminder = async (req, res) => {
  try {
    const userId = req.user_id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    db.query(`SELECT * FROM daily_tasks WHERE daily_task_id = ? AND user_id = ?`, [id, userId], async (err, results) => {
      if (err || !results || results.length === 0) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      const task = results[0];
      const title = `🔔 Daily Task Reminder: ${task.title}`;
      const message = `Reminder for your scheduled office task: "${task.title}" [Priority: ${(task.priority || 'medium').toUpperCase()}]\nTime: ${task.start_time || 'Anytime'}${task.end_time ? ' - ' + task.end_time : ''}\nDate: ${task.task_date}`;

      try {
        await NotificationService.createNotification({
          user_id: userId,
          type: 'task',
          title,
          message,
          data: { target_page: 'daily_tasks', daily_task_id: task.daily_task_id, priority: task.priority },
          priority: task.priority === 'high' ? 'high' : 'medium'
        });

        res.json({ success: true, message: "Reminder dispatched successfully via active channels" });
      } catch (notifErr) {
        console.error("Error creating notification:", notifErr);
        res.status(500).json({ success: false, message: "Failed to dispatch reminder", error: notifErr.message });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send general test notification alert
exports.sendTestReminder = async (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const title = `🔔 Daily Task Test Alert`;
    const message = `Your Daily Task Management reminder channels (In-App, Telegram, Desktop Push) are active and synchronized!`;

    await NotificationService.createNotification({
      user_id: userId,
      type: 'task',
      title,
      message,
      data: { target_page: 'daily_tasks', test: true },
      priority: 'medium'
    });

    res.json({ success: true, message: "Test reminder notification dispatched successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
