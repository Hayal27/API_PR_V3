const db = require("../models/db");

// Get all tasks for a user
exports.getUserTasks = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { status, priority, sortBy } = req.query;

    let query = `
      SELECT 
        t.*,
        u.user_name as assigned_by_name,
        e.name as assigned_by_employee_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_by = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE t.user_id = ?
    `;

    const params = [userId];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }

    // Sorting
    if (sortBy === "dueDate") {
      query += ` ORDER BY t.due_date ASC`;
    } else if (sortBy === "priority") {
      query += ` ORDER BY FIELD(t.priority, 'high', 'medium', 'low'), t.created_at DESC`;
    } else {
      query += ` ORDER BY t.created_at DESC`;
    }

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching tasks:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      // Calculate execution percentage and stats
      const tasks = results.map(task => ({
        ...task,
        execution_percentage: task.completed_subtasks && task.total_subtasks 
          ? Math.round((task.completed_subtasks / task.total_subtasks) * 100) 
          : 0,
        is_overdue: new Date(task.due_date) < new Date() && task.status !== 'completed'
      }));

      res.json({ success: true, tasks });
    });
  } catch (error) {
    console.error("Error in getUserTasks:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Create a new task
exports.createTask = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, description, priority, due_date, category, tags } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const query = `
      INSERT INTO tasks (user_id, title, description, priority, due_date, category, tags, status, created_at, updated_at, assigned_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW(), ?)
    `;

    db.query(query, [userId, title, description || null, priority || 'medium', due_date || null, category || 'general', tags || null, userId], (err, result) => {
      if (err) {
        console.error("Error creating task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      res.json({ success: true, message: "Task created successfully", task_id: result.insertId });
    });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Update task
exports.updateTask = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { taskId } = req.params;
    const { title, description, priority, due_date, status, category, tags, completed_subtasks, total_subtasks } = req.body;

    let query = `UPDATE tasks SET `;
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push(`title = ?`);
      params.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = ?`);
      params.push(description);
    }
    if (priority !== undefined) {
      updates.push(`priority = ?`);
      params.push(priority);
    }
    if (due_date !== undefined) {
      updates.push(`due_date = ?`);
      params.push(due_date);
    }
    if (status !== undefined) {
      updates.push(`status = ?`);
      params.push(status);
    }
    if (category !== undefined) {
      updates.push(`category = ?`);
      params.push(category);
    }
    if (tags !== undefined) {
      updates.push(`tags = ?`);
      params.push(tags);
    }
    if (completed_subtasks !== undefined) {
      updates.push(`completed_subtasks = ?`);
      params.push(completed_subtasks);
    }
    if (total_subtasks !== undefined) {
      updates.push(`total_subtasks = ?`);
      params.push(total_subtasks);
    }

    updates.push(`updated_at = NOW()`);
    query += updates.join(", ") + ` WHERE task_id = ? AND user_id = ?`;
    params.push(taskId, userId);

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      res.json({ success: true, message: "Task updated successfully" });
    });
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete task
exports.deleteTask = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { taskId } = req.params;

    const query = `DELETE FROM tasks WHERE task_id = ? AND user_id = ?`;

    db.query(query, [taskId, userId], (err, result) => {
      if (err) {
        console.error("Error deleting task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Task not found" });
      }

      res.json({ success: true, message: "Task deleted successfully" });
    });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get task statistics
exports.getTaskStats = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = `
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN priority = 'high' AND status != 'completed' THEN 1 ELSE 0 END) as high_priority_tasks,
        SUM(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 ELSE 0 END) as overdue_tasks,
        AVG(CASE WHEN total_subtasks > 0 THEN (completed_subtasks / total_subtasks) * 100 ELSE 0 END) as avg_completion_percentage
      FROM tasks
      WHERE user_id = ?
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching task stats:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const stats = results[0] || {};
      res.json({ 
        success: true, 
        stats: {
          total_tasks: stats.total_tasks || 0,
          completed_tasks: stats.completed_tasks || 0,
          pending_tasks: stats.pending_tasks || 0,
          in_progress_tasks: stats.in_progress_tasks || 0,
          high_priority_tasks: stats.high_priority_tasks || 0,
          overdue_tasks: stats.overdue_tasks || 0,
          completion_percentage: Math.round(stats.avg_completion_percentage || 0),
          completion_rate: stats.total_tasks > 0 ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0
        }
      });
    });
  } catch (error) {
    console.error("Error in getTaskStats:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Add task reminder
exports.addTaskReminder = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { taskId } = req.params;
    const { reminder_time, reminder_type } = req.body;

    const query = `
      INSERT INTO task_reminders (task_id, reminder_time, reminder_type, created_at)
      VALUES (?, ?, ?, NOW())
    `;

    db.query(query, [taskId, reminder_time, reminder_type || 'notification'], (err, result) => {
      if (err) {
        console.error("Error adding reminder:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      res.json({ success: true, message: "Reminder added successfully", reminder_id: result.insertId });
    });
  } catch (error) {
    console.error("Error in addTaskReminder:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get task reminders
exports.getTaskReminders = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = `
      SELECT tr.*, t.title, t.due_date, t.priority
      FROM task_reminders tr
      JOIN tasks t ON tr.task_id = t.task_id
      WHERE t.user_id = ? AND tr.reminder_time > NOW()
      ORDER BY tr.reminder_time ASC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching reminders:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      res.json({ success: true, reminders: results });
    });
  } catch (error) {
    console.error("Error in getTaskReminders:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get task notifications (overdue, urgent, and remaining tasks)
exports.getTaskNotifications = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = `
      SELECT 
        task_id,
        title,
        description,
        priority,
        due_date,
        status,
        category,
        CASE 
          WHEN due_date < NOW() AND status != 'completed' THEN 'overdue'
          WHEN priority = 'high' AND status != 'completed' THEN 'urgent'
          WHEN status = 'pending' OR status = 'in_progress' THEN 'remaining'
          ELSE 'other'
        END as notification_type,
        CASE 
          WHEN due_date < NOW() AND status != 'completed' THEN DATEDIFF(NOW(), due_date)
          WHEN due_date IS NOT NULL THEN DATEDIFF(due_date, NOW())
          ELSE NULL
        END as days_diff
      FROM tasks
      WHERE user_id = ? AND status != 'completed'
      ORDER BY 
        CASE 
          WHEN due_date < NOW() THEN 1
          WHEN priority = 'high' THEN 2
          WHEN status = 'pending' OR status = 'in_progress' THEN 3
          ELSE 4
        END,
        due_date ASC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching task notifications:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      // Organize notifications by type
      const notifications = {
        overdue: [],
        urgent: [],
        remaining: [],
        total_count: 0,
        notification_messages: []
      };

      results.forEach(task => {
        if (task.notification_type === 'overdue') {
          notifications.overdue.push({
            ...task,
            message: `⚠️ OVERDUE: "${task.title}" is ${task.days_diff} day(s) overdue`
          });
        } else if (task.notification_type === 'urgent') {
          notifications.urgent.push({
            ...task,
            message: `🔴 URGENT: "${task.title}" - High priority task pending`
          });
        } else if (task.notification_type === 'remaining') {
          const daysLeft = task.days_diff;
          let message = `📋 REMAINING: "${task.title}"`;
          if (daysLeft !== null) {
            message += ` - ${daysLeft} day(s) remaining`;
          }
          notifications.remaining.push({
            ...task,
            message: message
          });
        }
      });

      // Generate notification messages
      notifications.total_count = results.length;
      
      if (notifications.overdue.length > 0) {
        notifications.notification_messages.push({
          type: 'overdue',
          count: notifications.overdue.length,
          message: `⚠️ You have ${notifications.overdue.length} overdue task(s)`,
          icon: '⚠️'
        });
      }

      if (notifications.urgent.length > 0) {
        notifications.notification_messages.push({
          type: 'urgent',
          count: notifications.urgent.length,
          message: `🔴 You have ${notifications.urgent.length} urgent task(s)`,
          icon: '🔴'
        });
      }

      if (notifications.remaining.length > 0) {
        notifications.notification_messages.push({
          type: 'remaining',
          count: notifications.remaining.length,
          message: `📋 You have ${notifications.remaining.length} remaining task(s)`,
          icon: '📋'
        });
      }

      res.json({ 
        success: true, 
        notifications,
        summary: {
          total_incomplete: notifications.total_count,
          overdue_count: notifications.overdue.length,
          urgent_count: notifications.urgent.length,
          remaining_count: notifications.remaining.length
        }
      });
    });
  } catch (error) {
    console.error("Error in getTaskNotifications:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ==============================================
// Breakdown Supervisors Tracking API
// ==============================================

exports.getBreakdownSupervisors = async (req, res) => {
  const { detailId } = req.params;
  try {
    const util = require('util');
    const query = util.promisify(db.query).bind(db);
    
    // Find who owns this plan detail
    const planResult = await query('SELECT employee_id FROM plans WHERE specific_objective_detail_id = ? LIMIT 1', [detailId]);
    if (!planResult.length) return res.json({ success: true, supervisors: [] });
    
    const ownerEmployeeId = planResult[0].employee_id;
    
    // Use the comprehensive hierarchical approval logic to find the true parent position holder
    const { buildApprovalChain } = require('./hierarchyApprovalController');
    const chain = await buildApprovalChain(ownerEmployeeId);
    
    if (!chain || !chain.length) {
      return res.json({ success: true, supervisors: [] });
    }
    
    // The immediate hierarchical supervisor is the first valid approver in the chain
    const immediateSupervisorInfo = chain.find(step => step.approver_employee_id);
    
    if (!immediateSupervisorInfo) {
      return res.json({ success: true, supervisors: [] });
    }
    
    // Get full details to match frontend expectations
    const supervisorDetails = await query(`
      SELECT 
        1 as id, 
        u.user_id as supervisor_user_id, 
        u.user_name, 
        CONCAT(e.fname, ' ', e.lname) as name, 
        COALESCE(os.name_amharic, os.name, d.name) as department_name, 
        u.avatar_url
      FROM users u
      JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
      LEFT JOIN organization_structure os ON COALESCE(ep.org_node_id, e.department_id) = os.id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE e.employee_id = ?
    `, [immediateSupervisorInfo.approver_employee_id]);
    
    res.json({ success: true, supervisors: supervisorDetails });

  } catch (err) {
    console.error('getBreakdownSupervisors error:', err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// These are no longer needed as supervisors are strictly hierarchical now, but we return a polite error just in case.
exports.addBreakdownSupervisor = (req, res) => {
  return res.status(400).json({ success: false, message: "Task breakdown supervisors are automatically assigned based on organizational hierarchy." });
};

exports.removeBreakdownSupervisor = (req, res) => {
  return res.status(400).json({ success: false, message: "Hierarchical supervisors cannot be manually removed." });
};

