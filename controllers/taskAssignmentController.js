const db = require("../models/db");
const NotificationService = require("../services/notificationService");

// ============================================================================
// TASK ASSIGNMENT CONTROLLER
// Handles: Assigning tasks, tracking, supervisor interactions
// ============================================================================

// Create a new task assignment
exports.assignTask = (req, res) => {
  try {
    const assignedBy = req.user_id;
    if (!assignedBy) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { title, description, assigned_to, priority, due_date, category } = req.body;

    if (!title || !assigned_to) {
      return res.status(400).json({ success: false, message: "Title and assigned_to are required" });
    }

    const attachment = req.file ? req.file.filename : null;

    const query = `
      INSERT INTO task_assignments (title, description, assigned_by, assigned_to, priority, due_date, category, attachment, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    db.query(query, [title, description || null, assignedBy, assigned_to, priority || 'medium', due_date || null, category || 'general', attachment], (err, result) => {
      if (err) {
        console.error("Error assigning task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      // Fetch assigner name for detailed notification
      const assignerQuery = `
        SELECT CONCAT(e.fname, ' ', e.lname) as full_name, r.role_name
        FROM users u
        JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = ?
      `;

      db.query(assignerQuery, [assignedBy], (assignerErr, assignerRows) => {
        const assignerName = (!assignerErr && assignerRows.length > 0)
          ? assignerRows[0].full_name
          : 'Your supervisor';
        const assignerRole = (!assignerErr && assignerRows.length > 0)
          ? assignerRows[0].role_name || ''
          : '';

        // Format due date nicely
        const dueDateStr = due_date
          ? new Date(due_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
          : 'No due date set';

        const priorityEmoji = { high: '🔴', medium: '🟡', low: '🟢' }[priority] || '🟡';

        // Build detailed notification message
        const detailedMessage =
          `📋 *New Task Assigned to You*\n\n` +
          `*Task:* ${title}\n` +
          `*Priority:* ${priorityEmoji} ${(priority || 'medium').toUpperCase()}\n` +
          `*Due Date:* 📅 ${dueDateStr}\n` +
          `*Category:* ${category || 'General'}\n` +
          `*Assigned By:* ${assignerName}${assignerRole ? ` (${assignerRole})` : ''}\n` +
          (description ? `\n*Description:*\n${description}` : '') +
          `\n\n_Please open the EITPR app to view and start this task._`;

        // Send Notification using NotificationService (supports Telegram)
        NotificationService.createNotification({
          user_id: assigned_to,
          type: 'task',
          title: `New Task: ${title}`,
          message: detailedMessage,
          data: {
            assignment_id: result.insertId,
            task_title: title,
            priority: priority || 'medium',
            due_date: due_date,
            category: category || 'general',
            assigned_by_name: assignerName
          },
          priority: priority === 'high' ? 'high' : 'medium'
        }).catch(err => console.error("Failed to send task notification:", err));
      });

      res.json({ success: true, message: "Task assigned successfully", assignment_id: result.insertId });
    });
  } catch (error) {
    console.error("Error in assignTask:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Get tasks I assigned to others
exports.getAssignedByMe = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { status, priority } = req.query;

    let query = `
      SELECT 
        ta.*,
        u_to.user_name as assigned_to_username,
        CONCAT(e_to.fname, ' ', e_to.lname) as assigned_to_name,
        '' as assigned_to_position,
        d_to.name as assigned_to_department
      FROM task_assignments ta
      LEFT JOIN users u_to ON ta.assigned_to = u_to.user_id
      LEFT JOIN employees e_to ON u_to.employee_id = e_to.employee_id
      LEFT JOIN departments d_to ON e_to.department_id = d_to.department_id
      WHERE ta.assigned_by = ?
    `;
    const params = [userId];

    if (status) { query += ` AND ta.status = ?`; params.push(status); }
    if (priority) { query += ` AND ta.priority = ?`; params.push(priority); }

    query += ` ORDER BY ta.created_at DESC`;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching assigned tasks:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const tasks = results.map(task => ({
        ...task,
        is_overdue: task.due_date && new Date(task.due_date) < new Date() && !['completed', 'confirmed'].includes(task.status)
      }));

      res.json({ success: true, tasks });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get tasks assigned to me
exports.getAssignedToMe = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { status, priority } = req.query;

    let query = `
      SELECT 
        ta.*,
        u_by.user_name as assigned_by_username,
        CONCAT(e_by.fname, ' ', e_by.lname) as assigned_by_name,
        os_by.name as assigned_by_position,
        d_by.name as assigned_by_department
      FROM task_assignments ta
      LEFT JOIN users u_by ON ta.assigned_by = u_by.user_id
      LEFT JOIN employees e_by ON u_by.employee_id = e_by.employee_id
      LEFT JOIN departments d_by ON e_by.department_id = d_by.department_id
      LEFT JOIN employee_positions ep_by ON e_by.employee_id = ep_by.employee_id AND ep_by.is_primary = 1
      LEFT JOIN organization_structure os_by ON ep_by.org_node_id = os_by.id
      WHERE ta.assigned_to = ?
    `;
    const params = [userId];

    if (status) { query += ` AND ta.status = ?`; params.push(status); }
    if (priority) { query += ` AND ta.priority = ?`; params.push(priority); }

    query += ` ORDER BY ta.created_at DESC`;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching my assigned tasks:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const tasks = results.map(task => ({
        ...task,
        is_overdue: task.due_date && new Date(task.due_date) < new Date() && !['completed', 'confirmed'].includes(task.status)
      }));

      res.json({ success: true, tasks });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get users supervised by current user (full hierarchy - direct + all descendants, including org structure and delegation)
exports.getSupervisedUsers = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Step 1: Get current user's employee_id
    db.query('SELECT employee_id FROM users WHERE user_id = ?', [userId], (err, userRows) => {
      if (err || userRows.length === 0) {
        return res.status(500).json({ success: false, message: "Could not fetch employee info" });
      }

      const myEmployeeId = userRows[0].employee_id;

      // Step 2: Fetch ALL relevant tables to build the combined hierarchy
      const q = `
        SELECT employee_id, supervisor_id FROM employees;
        SELECT id, parent_id FROM organization_structure;
        SELECT employee_id, org_node_id, is_primary, is_delegation FROM employee_positions;
      `;

      db.query(q, (err, [allEmps, allNodes, allPositions]) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Database error", error: err.message });
        }

        const subordinateIds = new Set();
        
        // --- RELATIONSHIP 1: Employees supervisor chain (Legacy) ---
        const queueEmps = [myEmployeeId];
        const visitedEmps = new Set([myEmployeeId]);
        while (queueEmps.length > 0) {
          const currentId = queueEmps.shift();
          const reports = allEmps.filter(e => e.supervisor_id === currentId);
          for (const rep of reports) {
            if (!visitedEmps.has(rep.employee_id)) {
              visitedEmps.add(rep.employee_id);
              subordinateIds.add(rep.employee_id);
              queueEmps.push(rep.employee_id);
            }
          }
        }

        // --- RELATIONSHIP 2: Organization Structure + Delegations ---
        // Find all nodes held by me (Million/user 79)
        const myHeldNodes = allPositions
          .filter(p => p.employee_id === myEmployeeId)
          .map(p => p.org_node_id);

        if (myHeldNodes.length > 0) {
          // BFS Org tree downwards from held nodes
          const descendantNodes = new Set();
          const queueNodes = [...myHeldNodes];
          while (queueNodes.length > 0) {
            const nodeId = queueNodes.shift();
            const children = allNodes.filter(n => n.parent_id === nodeId);
            for (const child of children) {
              if (!descendantNodes.has(child.id)) {
                descendantNodes.add(child.id);
                queueNodes.push(child.id);
              }
            }
          }

          // Step 3: Find any employee holding a position in those descendant nodes
          const hierarchySubordinates = allPositions
            .filter(p => descendantNodes.has(p.org_node_id))
            .map(p => p.employee_id);

          hierarchySubordinates.forEach(id => {
            if (id !== myEmployeeId) subordinateIds.add(id);
          });
        }

        if (subordinateIds.size === 0) {
          return res.json({ success: true, users: [] });
        }

        const idsArray = Array.from(subordinateIds);

        // Step 4: Fetch user details for all subordinates
        const detailQuery = `
          SELECT 
            u.user_id,
            u.user_name,
            e.employee_id,
            CONCAT(e.fname, ' ', e.lname) as name,
            os_main.name as position,
            e.email,
            d.name as department_name,
            u.avatar_url,
            e.supervisor_id,
            (SELECT CONCAT(e2.fname, ' ', e2.lname) FROM employees e2 WHERE e2.employee_id = e.supervisor_id) as supervisor_name,
            (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'pending') as pending_tasks,
            (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'completed') as completed_tasks
          FROM users u
          JOIN employees e ON u.employee_id = e.employee_id
          LEFT JOIN departments d ON e.department_id = d.department_id
          LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
          LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
          WHERE e.employee_id IN (?) AND u.status = '1'
          ORDER BY e.fname ASC
        `;

        db.query(detailQuery, [idsArray], (err2, results) => {
          if (err2) {
            console.error("Error fetching supervised users details:", err2);
            return res.status(500).json({ success: false, message: "Database error", error: err2.message });
          }

          res.json({ success: true, users: results });
        });
      });
    });
  } catch (error) {
    console.error("Error in getSupervisedUsers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get available users to assign tasks to (all active users except self)
exports.getAvailableUsers = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = `
      SELECT 
        u.user_id,
        u.user_name,
        CONCAT(e.fname, ' ', e.lname) as name,
        '' as position,
        d.name as department_name,
        u.avatar_url
      FROM users u
      JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE u.status = '1' AND u.user_id != ?
      ORDER BY e.fname ASC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching users:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      res.json({ success: true, users: results });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update task assignment status (by assignee)
exports.updateAssignmentStatus = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { status, completion_note } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    let query = `UPDATE task_assignments SET status = ?, updated_at = NOW()`;
    const params = [status];

    if (completion_note) {
      query += `, completion_note = ?`;
      params.push(completion_note);
    }

    if (status === 'completed') {
      query += `, completed_at = NOW()`;
    }

    query += ` WHERE assignment_id = ? AND assigned_to = ?`;
    params.push(id, userId);

    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Error updating status:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }

      res.json({ success: true, message: "Status updated successfully" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Supervisor confirms task completion
exports.confirmTask = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    const query = `
      UPDATE task_assignments 
      SET status = 'confirmed', confirmed_at = NOW(), updated_at = NOW()
      WHERE assignment_id = ? AND assigned_by = ? AND status = 'completed'
    `;

    db.query(query, [id, userId], (err, result) => {
      if (err) {
        console.error("Error confirming task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Assignment not found or not ready for confirmation" });
      }

      res.json({ success: true, message: "Task confirmed successfully" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Supervisor rejects task
exports.rejectTask = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { rejection_reason } = req.body;

    const query = `
      UPDATE task_assignments 
      SET status = 'rejected', rejection_reason = ?, updated_at = NOW()
      WHERE assignment_id = ? AND assigned_by = ?
    `;

    db.query(query, [rejection_reason || 'Not satisfactory', id, userId], (err, result) => {
      if (err) {
        console.error("Error rejecting task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }

      res.json({ success: true, message: "Task rejected" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete task assignment
exports.deleteAssignment = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    const query = `DELETE FROM task_assignments WHERE assignment_id = ? AND assigned_by = ?`;

    db.query(query, [id, userId], (err, result) => {
      if (err) {
        console.error("Error deleting assignment:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }

      res.json({ success: true, message: "Assignment deleted" });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get assignment statistics
exports.getAssignmentStats = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = `
      SELECT 
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ?) as total_assigned_by_me,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ?) as total_assigned_to_me,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ? AND status = 'pending') as pending_assigned,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ? AND status = 'completed') as completed_waiting_confirm,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ? AND status = 'confirmed') as confirmed_tasks,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ? AND status = 'pending') as my_pending_tasks,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ? AND status = 'in_progress') as my_inprogress_tasks,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ? AND status = 'completed') as my_completed_tasks,
        (SELECT COUNT(*) FROM task_assignments WHERE (assigned_by = ? OR assigned_to = ?) AND due_date < NOW() AND status NOT IN ('completed','confirmed')) as overdue_tasks
    `;

    db.query(query, [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId], (err, results) => {
      if (err) {
        console.error("Error fetching stats:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      res.json({ success: true, stats: results[0] || {} });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
