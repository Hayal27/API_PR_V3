const db = require("../models/db");
const NotificationService = require("../services/notificationService");

// ============================================================================
// TASK ASSIGNMENT CONTROLLER
// Handles: Assigning tasks, tracking, supervisor interactions
// ============================================================================

// Create a new task assignment (supports single or multi-employee assignment with custom roles)
exports.assignTask = (req, res) => {
  try {
    const assignedBy = req.user_id;
    if (!assignedBy) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let { title, description, assigned_to, assigned_members, priority, due_date, category } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }

    // Parse assigned members
    let members = [];
    if (assigned_members) {
      try {
        members = typeof assigned_members === 'string' ? JSON.parse(assigned_members) : assigned_members;
      } catch (_) {
        members = [];
      }
    }

    if (!Array.isArray(members) || members.length === 0) {
      if (assigned_to) {
        if (Array.isArray(assigned_to)) {
          members = assigned_to.map(id => ({ user_id: id, role: 'Executor', instructions: '' }));
        } else if (typeof assigned_to === 'string' && assigned_to.includes(',')) {
          members = assigned_to.split(',').map(s => s.trim()).filter(Boolean).map(id => ({ user_id: id, role: 'Executor', instructions: '' }));
        } else {
          members = [{ user_id: assigned_to, role: req.body.role || 'Executor', instructions: '' }];
        }
      }
    }

    if (members.length === 0) {
      return res.status(400).json({ success: false, message: "At least one target employee is required" });
    }

    const attachment = req.file ? req.file.filename : null;

    // Fetch assigner name for detailed notification
    const assignerQuery = `
      SELECT CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as full_name, r.role_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
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

      const dueDateStr = due_date
        ? new Date(due_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
        : 'No due date set';

      const priorityEmoji = { urgent: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[priority] || '🟡';

      let insertedCount = 0;
      const createdIds = [];

      members.forEach(member => {
        const targetUserId = member.user_id || member.id;
        if (!targetUserId) return;

        const memberRole = member.role || 'Executor';
        const memberInstructions = member.instructions || '';
        
        let finalDescription = description || '';
        if (memberRole && memberRole !== 'Executor') {
          finalDescription = `[Role: ${memberRole}] ${finalDescription}`;
        }
        if (memberInstructions) {
          finalDescription = `${finalDescription}\n\n*Specific Instructions:* ${memberInstructions}`;
        }

        const insertQuery = `
          INSERT INTO task_assignments (title, description, assigned_by, assigned_to, priority, due_date, category, attachment, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        db.query(insertQuery, [
          title,
          finalDescription.trim() || null,
          assignedBy,
          targetUserId,
          priority || 'medium',
          due_date || null,
          category || 'general',
          attachment
        ], (insertErr, result) => {
          if (!insertErr && result) {
            insertedCount++;
            createdIds.push(result.insertId);

            // Send notification
            const detailedMessage =
              `📋 *New Task Assigned to You*\n\n` +
              `*Task:* ${title}\n` +
              `*Your Role:* 🎖️ ${memberRole}\n` +
              `*Priority:* ${priorityEmoji} ${(priority || 'medium').toUpperCase()}\n` +
              `*Due Date:* 📅 ${dueDateStr}\n` +
              `*Category:* ${category || 'General'}\n` +
              `*Assigned By:* ${assignerName}${assignerRole ? ` (${assignerRole})` : ''}\n` +
              (memberInstructions ? `\n*Your Specific Instructions:*\n${memberInstructions}\n` : (description ? `\n*Task Description:*\n${description}\n` : '')) +
              `\n_Please open the ITPCR app to view and start this task._`;

            NotificationService.createNotification({
              user_id: targetUserId,
              type: 'task',
              title: `New Task (${memberRole}): ${title}`,
              message: detailedMessage,
              data: {
                assignment_id: result.insertId,
                task_title: title,
                role: memberRole,
                priority: priority || 'medium',
                due_date: due_date,
                category: category || 'general',
                assigned_by_name: assignerName
              },
              priority: priority === 'urgent' || priority === 'high' ? 'high' : 'medium'
            }).catch(e => console.error("Failed to send task notification:", e));
          }
        });
      });

      res.json({
        success: true,
        message: `Task assigned successfully to ${members.length} employee(s)`,
        count: members.length
      });
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
        CONCAT(COALESCE(e_to.fname, u_to.user_name), ' ', COALESCE(e_to.lname, '')) as assigned_to_name,
        COALESCE(os_to.name, 'Staff') as assigned_to_position,
        COALESCE(d_to.name, os_to.name, 'General Directorate') as assigned_to_department
      FROM task_assignments ta
      LEFT JOIN users u_to ON ta.assigned_to = u_to.user_id
      LEFT JOIN employees e_to ON u_to.employee_id = e_to.employee_id
      LEFT JOIN departments d_to ON e_to.department_id = d_to.department_id
      LEFT JOIN employee_positions ep_to ON e_to.employee_id = ep_to.employee_id AND ep_to.is_primary = 1
      LEFT JOIN organization_structure os_to ON ep_to.org_node_id = os_to.id
      WHERE ta.assigned_by = ?
      GROUP BY ta.assignment_id
    `;
    const params = [userId];

    if (status && status !== 'all') { query += ` AND ta.status = ?`; params.push(status); }
    if (priority && priority !== 'all') { query += ` AND ta.priority = ?`; params.push(priority); }

    query += ` ORDER BY ta.created_at DESC`;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching assigned tasks:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const seenIds = new Set();
      const uniqueList = [];
      (results || []).forEach(task => {
        if (!seenIds.has(task.assignment_id)) {
          seenIds.add(task.assignment_id);
          uniqueList.push({
            ...task,
            is_overdue: task.due_date && new Date(task.due_date) < new Date() && !['completed', 'confirmed'].includes(task.status)
          });
        }
      });

      res.json({ success: true, tasks: uniqueList });
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
        CONCAT(COALESCE(e_by.fname, u_by.user_name), ' ', COALESCE(e_by.lname, '')) as assigned_by_name,
        COALESCE(os_by.name, 'Staff') as assigned_by_position,
        COALESCE(d_by.name, os_by.name, 'General Directorate') as assigned_by_department
      FROM task_assignments ta
      LEFT JOIN users u_by ON ta.assigned_by = u_by.user_id
      LEFT JOIN employees e_by ON u_by.employee_id = e_by.employee_id
      LEFT JOIN departments d_by ON e_by.department_id = d_by.department_id
      LEFT JOIN employee_positions ep_by ON e_by.employee_id = ep_by.employee_id AND ep_by.is_primary = 1
      LEFT JOIN organization_structure os_by ON ep_by.org_node_id = os_by.id
      WHERE ta.assigned_to = ?
      GROUP BY ta.assignment_id
    `;
    const params = [userId];

    if (status && status !== 'all') { query += ` AND ta.status = ?`; params.push(status); }
    if (priority && priority !== 'all') { query += ` AND ta.priority = ?`; params.push(priority); }

    query += ` ORDER BY ta.created_at DESC`;

    db.query(query, params, (err, results) => {
      if (err) {
        console.error("Error fetching my assigned tasks:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const seenIds = new Set();
      const uniqueList = [];
      (results || []).forEach(task => {
        if (!seenIds.has(task.assignment_id)) {
          seenIds.add(task.assignment_id);
          uniqueList.push({
            ...task,
            is_overdue: task.due_date && new Date(task.due_date) < new Date() && !['completed', 'confirmed'].includes(task.status)
          });
        }
      });

      const tasks = uniqueList;

      const page = parseInt(req.query.page, 10);
      const limit = parseInt(req.query.limit, 10);
      const total = tasks.length;

      if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
        res.json({
          success: true,
          tasks,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        });
      } else {
        res.json({
          success: true,
          tasks,
          pagination: {
            total,
            page: 1,
            limit: total,
            totalPages: 1
          }
        });
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get users supervised by current user (with breakdown stats)
exports.getSupervisedUsers = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allUsersQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        e.employee_id,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as name,
        COALESCE(os_main.name, pos.title, pos.name, r.role_name, 'Staff') as position,
        e.email as email,
        COALESCE(d.name, os_main.name, 'General Directorate') as department_name,
        u.avatar_url,
        e.supervisor_id,
        (SELECT CONCAT(e2.fname, ' ', e2.lname) FROM employees e2 WHERE e2.employee_id = e.supervisor_id) as supervisor_name,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'pending') as pending_tasks,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'completed') as completed_tasks
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE u.status = '1'
      ORDER BY e.fname ASC, u.user_name ASC
    `;

    db.query(allUsersQuery, [], (err, results) => {
      if (err) {
        console.error("Error in getSupervisedUsers query:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const allList = results || [];

      // Check current user's employee_id and role for recursive multi-level hierarchy resolution
      const userRoleQuery = `
        SELECT u.employee_id, u.role_id, LOWER(COALESCE(r.role_name, '')) AS role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = ?
      `;
      db.query(userRoleQuery, [userId], (errUser, uRows) => {
        const myEmpId = (!errUser && uRows && uRows.length > 0) ? uRows[0].employee_id : null;
        const roleId = (!errUser && uRows && uRows.length > 0) ? Number(uRows[0].role_id) : 0;
        const roleName = (!errUser && uRows && uRows.length > 0) ? uRows[0].role_name : '';

        // Privileged roles see all users across the corporation
        const isPrivileged = [1, 2, 3, 9, 29].includes(roleId) ||
          roleName.includes('ceo') ||
          roleName.includes('deputy') ||
          roleName.includes('admin') ||
          roleName.includes('executive');

        if (isPrivileged || !myEmpId) {
          const filteredList = allList.filter(u => u.user_id !== userId);
          return processBreakdownAndRespond(filteredList);
        }

        // Fetch complete organizational structure and employee hierarchy for deep recursive traversal
        const hierarchyQuery = `
          SELECT employee_id, supervisor_id, department_id FROM employees;
          SELECT id, parent_id FROM organization_structure;
          SELECT employee_id, org_node_id FROM employee_positions;
        `;
        db.query(hierarchyQuery, (errH, [allEmps, allNodes, allPositions]) => {
          if (errH) {
            console.error("Error fetching hierarchy for subordinates:", errH);
            const filteredList = allList.filter(u => u.user_id !== userId);
            return processBreakdownAndRespond(filteredList);
          }

          const subordinateEmpIds = new Set();

          // ── BFS 1: supervisor_id chain recursively down to all lowest leaf levels ──
          const queueEmps = [myEmpId];
          const visitedEmps = new Set([myEmpId]);
          while (queueEmps.length > 0) {
            const cur = queueEmps.shift();
            (allEmps || []).filter(e => e.supervisor_id === cur && e.employee_id !== cur).forEach(e => {
              if (!visitedEmps.has(e.employee_id)) {
                visitedEmps.add(e.employee_id);
                subordinateEmpIds.add(e.employee_id);
                queueEmps.push(e.employee_id);
              }
            });
          }

          // ── BFS 2: organization_structure sub-tree recursively down to all child units/leaf nodes ──
          const myHeldNodes = (allPositions || [])
            .filter(p => p.employee_id === myEmpId)
            .map(p => p.org_node_id)
            .concat((allEmps || []).filter(e => e.employee_id === myEmpId).map(e => e.department_id))
            .filter(Boolean);

          if (myHeldNodes.length > 0) {
            const descendantNodes = new Set();
            const queueNodes = [...myHeldNodes];
            while (queueNodes.length > 0) {
              const nodeId = queueNodes.shift();
              (allNodes || []).filter(n => n.parent_id === nodeId).forEach(child => {
                if (!descendantNodes.has(child.id)) {
                  descendantNodes.add(child.id);
                  queueNodes.push(child.id);
                }
              });
            }

            // Include employees in held node or any descendant child node
            (allPositions || [])
              .filter(p => (descendantNodes.has(p.org_node_id) || myHeldNodes.includes(p.org_node_id)) && p.employee_id !== myEmpId)
              .forEach(p => subordinateEmpIds.add(p.employee_id));

            (allEmps || [])
              .filter(e => (descendantNodes.has(e.department_id) || myHeldNodes.includes(e.department_id)) && e.employee_id !== myEmpId)
              .forEach(e => subordinateEmpIds.add(e.employee_id));
          }

          let filteredList = allList.filter(u =>
            u.user_id !== userId && (
              subordinateEmpIds.has(u.employee_id) ||
              subordinateEmpIds.has(u.supervisor_id)
            )
          );

          // Fallback: If no strict hierarchy found, but user is director/manager/lead, show all
          if (filteredList.length === 0 && (roleName.includes('director') || roleName.includes('manager') || roleName.includes('head') || roleName.includes('lead'))) {
            filteredList = allList.filter(u => u.user_id !== userId);
          }

          processBreakdownAndRespond(filteredList);
        });

        function processBreakdownAndRespond(filteredList) {

        const userIds = filteredList.map(u => u.user_id);
        if (userIds.length === 0) {
          return res.json({ success: true, users: [] });
        }

        const breakdownQuery = `
          SELECT 
            mta.user_id, 
            mt.monthly_task_id AS task_id, 
            mt.name, 
            COALESCE(mt.progress, 0) AS progress, 
            mt.weight, 
            mt.created_at AS start_date,
            sod.deadline AS deadline,
            'monthly' AS type
          FROM monthly_task_assignees mta
          JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
          LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
          WHERE mta.user_id IN (?)
          UNION ALL
          SELECT 
            wta.user_id, 
            wt.weekly_task_id AS task_id, 
            wt.name, 
            COALESCE(wt.progress, 0) AS progress, 
            wt.weight, 
            wt.created_at AS start_date,
            sod.deadline AS deadline,
            'weekly' AS type
          FROM weekly_task_assignees wta
          JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id
          LEFT JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
          LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
          WHERE wta.user_id IN (?)
        `;

        db.query(breakdownQuery, [userIds, userIds], (errB, bTasks) => {
          const userTasksMap = {};
          if (!errB && bTasks) {
            bTasks.forEach(bt => {
              if (!userTasksMap[bt.user_id]) userTasksMap[bt.user_id] = [];
              userTasksMap[bt.user_id].push(bt);
            });
          }

          filteredList.forEach(u => {
            const tasks = userTasksMap[u.user_id] || [];
            const totalBTasks = tasks.length;
            let totalProg = 0;
            let overdueCount = 0;
            let earliestStart = null;
            let latestDeadline = null;

            tasks.forEach(t => {
              const prog = parseFloat(t.progress) || 0;
              totalProg += prog;
              if (prog === 0) overdueCount++;

              if (t.start_date) {
                if (!earliestStart || new Date(t.start_date) < new Date(earliestStart)) {
                  earliestStart = t.start_date;
                }
              }
              if (t.deadline) {
                if (!latestDeadline || new Date(t.deadline) > new Date(latestDeadline)) {
                  latestDeadline = t.deadline;
                }
              }
            });

            const avgProg = totalBTasks > 0 ? Math.round(totalProg / totalBTasks) : 0;
            let health = 'on_track';
            if (totalBTasks > 0) {
              if (avgProg < 40 || overdueCount > 0) health = 'overdue';
              else if (avgProg < 75) health = 'behind';
            }

            u.breakdown_tasks_count = totalBTasks;
            u.breakdown_avg_progress = avgProg;
            u.breakdown_overdue_count = overdueCount;
            u.health_status = health;
            u.start_date = earliestStart;
            u.deadline = latestDeadline;
            u.breakdown_tasks = tasks;
          });

          res.json({ success: true, users: filteredList });
        });
        } // end processBreakdownAndRespond
      });
    });
  } catch (error) {
    console.error("Error in getSupervisedUsers:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
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

      // Notify supervisor about the status change
      const fetchQuery = `
        SELECT 
          ta.assigned_by,
          ta.title,
          ta.priority,
          CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as assignee_name
        FROM task_assignments ta
        LEFT JOIN users u ON ta.assigned_to = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        WHERE ta.assignment_id = ?
      `;
      db.query(fetchQuery, [id], (fetchErr, fetchRows) => {
        if (!fetchErr && fetchRows && fetchRows.length > 0) {
          const { assigned_by, title, priority, assignee_name } = fetchRows[0];
          const statusLabel = status === 'in_progress' ? '🚀 Started' : status === 'completed' ? '✅ Completed' : status.toUpperCase();
          const priorityEmoji = { urgent: '🔴', high: '🟠', medium: '🟡', low: '🟢' }[priority] || '🟡';
          const noteText = completion_note ? `\n\n*Submitted Note:*\n${completion_note}` : '';

          const notifTitle = status === 'completed'
            ? `Task Completed: ${title}`
            : `Task Update: ${title}`;
          const notifMsg =
            `${statusLabel} *${title}*\n` +
            `*By:* ${assignee_name}\n` +
            `*Priority:* ${priorityEmoji} ${(priority || 'medium').toUpperCase()}` +
            noteText +
            `\n\n_View in Sent Tasks Tracker._`;

          NotificationService.createNotification({
            user_id: assigned_by,
            type: 'task_update',
            title: notifTitle,
            message: notifMsg,
            data: {
              assignment_id: parseInt(id),
              task_title: title,
              new_status: status,
              assignee_name,
              completion_note: completion_note || null,
              target_page: 'sent_tasks_tracker'
            },
            priority: status === 'completed' ? 'high' : 'medium'
          }).catch(e => console.error('Status notification failed:', e));
        }
      });

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

      // Notify the assignee that task was confirmed
      const fetchQ = `
        SELECT ta.assigned_to, ta.title,
          CONCAT(COALESCE(es.fname, us.user_name), ' ', COALESCE(es.lname, '')) as supervisor_name
        FROM task_assignments ta
        LEFT JOIN users us ON ta.assigned_by = us.user_id
        LEFT JOIN employees es ON us.employee_id = es.employee_id
        WHERE ta.assignment_id = ?
      `;
      db.query(fetchQ, [id], (fErr, fRows) => {
        if (!fErr && fRows && fRows.length > 0) {
          const { assigned_to, title, supervisor_name } = fRows[0];
          NotificationService.createNotification({
            user_id: assigned_to,
            type: 'task_confirmed',
            title: `✅ Task Confirmed: ${title}`,
            message:
              `🎉 *Your work has been confirmed!*\n\n` +
              `*Task:* ${title}\n` +
              `*Confirmed By:* ${supervisor_name}\n\n` +
              `_Great job! Your task submission has been reviewed and approved._`,
            data: {
              assignment_id: parseInt(id),
              task_title: title,
              confirmed_by_name: supervisor_name,
              target_page: 'my_tasks'
            },
            priority: 'high'
          }).catch(e => console.error('Confirm notification failed:', e));
        }
      });

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
    const reason = rejection_reason || 'Not satisfactory';

    const query = `
      UPDATE task_assignments 
      SET status = 'rejected', rejection_reason = ?, updated_at = NOW()
      WHERE assignment_id = ? AND assigned_by = ?
    `;

    db.query(query, [reason, id, userId], (err, result) => {
      if (err) {
        console.error("Error rejecting task:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }

      // Notify the assignee that task was rejected
      const fetchQ = `
        SELECT ta.assigned_to, ta.title,
          CONCAT(COALESCE(es.fname, us.user_name), ' ', COALESCE(es.lname, '')) as supervisor_name
        FROM task_assignments ta
        LEFT JOIN users us ON ta.assigned_by = us.user_id
        LEFT JOIN employees es ON us.employee_id = es.employee_id
        WHERE ta.assignment_id = ?
      `;
      db.query(fetchQ, [id], (fErr, fRows) => {
        if (!fErr && fRows && fRows.length > 0) {
          const { assigned_to, title, supervisor_name } = fRows[0];
          NotificationService.createNotification({
            user_id: assigned_to,
            type: 'task_rejected',
            title: `❌ Task Needs Revision: ${title}`,
            message:
              `⚠️ *Task submission was not approved.*\n\n` +
              `*Task:* ${title}\n` +
              `*Reviewed By:* ${supervisor_name}\n` +
              `*Reason:* ${reason}\n\n` +
              `_Please review the feedback and resubmit your work._`,
            data: {
              assignment_id: parseInt(id),
              task_title: title,
              rejection_reason: reason,
              reviewed_by: supervisor_name,
              target_page: 'my_tasks'
            },
            priority: 'high'
          }).catch(e => console.error('Reject notification failed:', e));
        }
      });

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

// Get assignment statistics (including action plan breakdown tasks)
exports.getAssignmentStats = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const query = `
      SELECT 
        (
          (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ?) +
          (SELECT COUNT(*) FROM monthly_task_assignees WHERE assigned_by = ?) +
          (SELECT COUNT(*) FROM weekly_task_assignees WHERE assigned_by = ?)
        ) AS total_assigned_by_me,

        (
          (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ?) +
          (SELECT COUNT(*) FROM monthly_task_assignees WHERE user_id = ?) +
          (SELECT COUNT(*) FROM weekly_task_assignees WHERE user_id = ?)
        ) AS total_assigned_to_me,

        (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ? AND status = 'pending') as pending_assigned,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ? AND status = 'completed') as completed_waiting_confirm,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ? AND status = 'confirmed') as confirmed_tasks,

        (
          (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ? AND status IN ('pending', 'in_progress')) +
          (SELECT COUNT(*) FROM monthly_task_assignees mta JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id WHERE mta.user_id = ? AND (mt.progress < 100 OR mt.status != 'completed')) +
          (SELECT COUNT(*) FROM weekly_task_assignees wta JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id WHERE wta.user_id = ? AND (wt.progress < 100 OR wt.status != 'completed'))
        ) AS my_pending_tasks,

        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ? AND status = 'in_progress') as my_inprogress_tasks,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ? AND status = 'completed') as my_completed_tasks,

        (
          (SELECT COUNT(*) FROM task_assignments WHERE (assigned_by = ? OR assigned_to = ?) AND due_date < NOW() AND status NOT IN ('completed','confirmed')) +
          (SELECT COUNT(*) FROM monthly_task_assignees mta JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id WHERE (mta.user_id = ? OR mta.assigned_by = ?) AND mt.progress < 40) +
          (SELECT COUNT(*) FROM weekly_task_assignees wta JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id WHERE (wta.user_id = ? OR wta.assigned_by = ?) AND wt.progress < 40)
        ) AS overdue_tasks
    `;

    const params = [
      userId, userId, userId,
      userId, userId, userId,
      userId,
      userId,
      userId,
      userId, userId, userId,
      userId,
      userId,
      userId, userId, userId, userId, userId, userId
    ];

    db.query(query, params, (err, results) => {
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

// Get all available active users across the organization with recursive subordinate tagging down to lowest level
exports.getAvailableUsers = (req, res) => {
  try {
    const currentUserId = req.user_id || null;

    const query = `
      SELECT 
        u.user_id,
        u.user_name,
        e.employee_id,
        MAX(CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, ''))) as name,
        MAX(COALESCE(os_main.name, pos.title, pos.name, r.role_name, 'Staff')) as position,
        MAX(e.email) as email,
        MAX(COALESCE(d.name, os_main.name, 'General Directorate')) as department_name,
        MAX(u.avatar_url) as avatar_url,
        MAX(e.supervisor_id) as supervisor_id,
        MAX(ep_main.position_id) as position_id,
        MAX(ep_main.org_node_id) as org_node_id
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE COALESCE(u.status, '1') IN ('1', 1, 'active')
      GROUP BY u.user_id
      ORDER BY name ASC, u.user_name ASC
    `;
    db.query(query, [], (err, results) => {
      if (err) {
        console.error("Error in getAvailableUsers query:", err);
        return res.status(500).json({ success: false, message: "Database error", error: err.message });
      }

      const allUsers = results || [];
      if (!currentUserId) {
        return res.json({ success: true, users: allUsers });
      }

      // Check current user's employee_id and resolve multi-level subordinate IDs
      db.query('SELECT employee_id FROM users WHERE user_id = ?', [currentUserId], (errUser, uRows) => {
        const myEmpId = (!errUser && uRows && uRows.length > 0) ? uRows[0].employee_id : null;
        if (!myEmpId) {
          return res.json({ success: true, users: allUsers });
        }

        const hierarchyQuery = `
          SELECT employee_id, supervisor_id, department_id FROM employees;
          SELECT id, parent_id FROM organization_structure;
          SELECT employee_id, org_node_id FROM employee_positions;
        `;
        db.query(hierarchyQuery, (errH, [allEmps, allNodes, allPositions]) => {
          const subordinateEmpIds = new Set();

          if (!errH && allEmps) {
            // BFS 1: supervisor_id down to lowest level
            const queueEmps = [myEmpId];
            const visitedEmps = new Set([myEmpId]);
            while (queueEmps.length > 0) {
              const cur = queueEmps.shift();
              (allEmps || []).filter(e => e.supervisor_id === cur && e.employee_id !== cur).forEach(e => {
                if (!visitedEmps.has(e.employee_id)) {
                  visitedEmps.add(e.employee_id);
                  subordinateEmpIds.add(e.employee_id);
                  queueEmps.push(e.employee_id);
                }
              });
            }

            // BFS 2: organization_structure sub-tree
            const myHeldNodes = (allPositions || [])
              .filter(p => p.employee_id === myEmpId)
              .map(p => p.org_node_id)
              .concat((allEmps || []).filter(e => e.employee_id === myEmpId).map(e => e.department_id))
              .filter(Boolean);

            if (myHeldNodes.length > 0) {
              const descendantNodes = new Set();
              const queueNodes = [...myHeldNodes];
              while (queueNodes.length > 0) {
                const nodeId = queueNodes.shift();
                (allNodes || []).filter(n => n.parent_id === nodeId).forEach(child => {
                  if (!descendantNodes.has(child.id)) {
                    descendantNodes.add(child.id);
                    queueNodes.push(child.id);
                  }
                });
              }

              (allPositions || [])
                .filter(p => (descendantNodes.has(p.org_node_id) || myHeldNodes.includes(p.org_node_id)) && p.employee_id !== myEmpId)
                .forEach(p => subordinateEmpIds.add(p.employee_id));

              (allEmps || [])
                .filter(e => (descendantNodes.has(e.department_id) || myHeldNodes.includes(e.department_id)) && e.employee_id !== myEmpId)
                .forEach(e => subordinateEmpIds.add(e.employee_id));
            }
          }

          const enhancedUsers = allUsers.map(u => ({
            ...u,
            is_direct_subordinate: subordinateEmpIds.has(u.employee_id) || subordinateEmpIds.has(u.supervisor_id) ? 1 : 0
          })).sort((a, b) => b.is_direct_subordinate - a.is_direct_subordinate || (a.name || '').localeCompare(b.name || ''));

          res.json({ success: true, users: enhancedUsers });
        });
      });
    });
  } catch (err) {
    console.error("Server error in getAvailableUsers:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ── Performance Execution Ranking ──
// Returns per-user stats for direct tasks assigned by the current supervisor
exports.getPerformanceRanking = (req, res) => {
  try {
    const userId = req.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const query = `
      SELECT
        u.user_id,
        MAX(CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, ''))) AS full_name,
        MAX(COALESCE(os_main.name, pos.title, r.role_name, 'Staff')) AS position,
        MAX(COALESCE(d.name, 'General')) AS department,
        MAX(u.avatar_url) AS avatar_url,
        COUNT(DISTINCT ta.assignment_id) AS total_assigned,
        SUM(CASE WHEN ta.status IN ('completed','confirmed') THEN 1 ELSE 0 END) AS total_completed,
        SUM(CASE
          WHEN ta.status IN ('completed','confirmed')
            AND ta.due_date IS NOT NULL AND ta.completed_at IS NOT NULL
            AND ta.completed_at <= ta.due_date
          THEN 1 ELSE 0 END) AS completed_on_time,
        SUM(CASE
          WHEN ta.status IN ('completed','confirmed')
            AND ta.due_date IS NOT NULL AND ta.completed_at IS NOT NULL
            AND ta.completed_at > ta.due_date
          THEN 1 ELSE 0 END) AS completed_late,
        SUM(CASE
          WHEN ta.status NOT IN ('completed','confirmed','rejected')
            AND ta.due_date IS NOT NULL AND ta.due_date < NOW()
          THEN 1 ELSE 0 END) AS overdue,
        SUM(CASE WHEN ta.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN ta.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
        SUM(CASE WHEN ta.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
        ROUND(AVG(CASE
          WHEN ta.status IN ('completed','confirmed')
            AND ta.completed_at IS NOT NULL AND ta.created_at IS NOT NULL
          THEN TIMESTAMPDIFF(HOUR, ta.created_at, ta.completed_at) / 24.0
        END), 1) AS avg_completion_days,
        ROUND(
          SUM(CASE WHEN ta.status IN ('completed','confirmed') THEN 1 ELSE 0 END) * 100.0
          / NULLIF(COUNT(DISTINCT ta.assignment_id), 0), 1
        ) AS completion_rate
      FROM task_assignments ta
      JOIN users u ON ta.assigned_to = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE ta.assigned_by = ?
      GROUP BY u.user_id
    `;

    db.query(query, [userId], (err, rows) => {
      if (err) {
        console.error('Error fetching performance ranking:', err);
        return res.status(500).json({ success: false, message: 'Database error', error: err.message });
      }

      const ranked = (rows || []).map(row => ({
        ...row,
        total_assigned: Number(row.total_assigned) || 0,
        total_completed: Number(row.total_completed) || 0,
        completed_on_time: Number(row.completed_on_time) || 0,
        completed_late: Number(row.completed_late) || 0,
        overdue: Number(row.overdue) || 0,
        pending_count: Number(row.pending_count) || 0,
        in_progress_count: Number(row.in_progress_count) || 0,
        rejected_count: Number(row.rejected_count) || 0,
        avg_completion_days: row.avg_completion_days !== null ? Number(row.avg_completion_days) : null,
        completion_rate: row.completion_rate !== null ? Number(row.completion_rate) : 0,
        performance_score: Math.max(0, Math.round(
          (Number(row.completed_on_time) || 0) * 3 +
          (Number(row.completed_late) || 0) * 1 -
          (Number(row.overdue) || 0) * 2 +
          (Number(row.completion_rate) || 0) * 0.5
        ))
      }));

      ranked.sort((a, b) =>
        b.performance_score - a.performance_score ||
        b.completion_rate - a.completion_rate ||
        b.completed_on_time - a.completed_on_time
      );
      ranked.forEach((r, i) => { r.rank = i + 1; });

      res.json({ success: true, ranking: ranked });
    });
  } catch (error) {
    console.error('Error in getPerformanceRanking:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
