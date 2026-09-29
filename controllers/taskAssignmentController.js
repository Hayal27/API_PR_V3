const isPastDeadline = (deadlineStr) => {
    if (!deadlineStr) return false;
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return false;
    const str = String(deadlineStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        d.setHours(23, 59, 59, 999);
    }
    return d.getTime() < Date.now();
};

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

        const branchIdToSave = req.body.branch_id || req.branch_id || 1;
        const insertQuery = `
          INSERT INTO task_assignments (title, description, assigned_by, assigned_to, priority, due_date, category, attachment, branch_id, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `;

        db.query(insertQuery, [
          title,
          finalDescription.trim() || null,
          assignedBy,
          targetUserId,
          priority || 'medium',
          due_date || null,
          category || 'general',
          attachment,
          branchIdToSave
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
        COALESCE(d_by.name, os_by.name, 'General Directorate') as assigned_by_department,
        -- Strategic Hierarchy details for delegated or linked tasks
        COALESCE(g.name, 'Corporate Operational Task') AS Goal,
        g.goal_id,
        g.name AS goal_name,
        g.year AS goal_year,
        g.quarter AS goal_quarter,
        g.weight AS goal_weight,
        g.description AS goal_description,
        COALESCE(o.name, 'Strategic Alignment') AS Objective,
        o.objective_id,
        o.name AS objective_name,
        o.weight AS objective_weight,
        COALESCE(so.specific_objective_name, so.name, 'Direct Task') AS SpecificObjective,
        so.specific_objective_id,
        COALESCE(so.specific_objective_name, so.name) AS kpi_name,
        so.weight AS kpi_weight,
        so.measurement AS kpi_measurement,
        COALESCE(sod.specific_objective_detailname, sod.name, sod.details, ta.title) AS action_plan_name,
        sod.details AS action_plan_details,
        sod.plan_type,
        sod.cost_type,
        sod.income_plan_type,
        sod.income_exchange,
        sod.CIplan,
        sod.CIbaseline,
        sod.plan,
        sod.baseline,
        sod.weight AS action_plan_weight,
        sod.measurement AS plan_measurement
      FROM task_assignments ta
      LEFT JOIN users u_by ON ta.assigned_by = u_by.user_id
      LEFT JOIN employees e_by ON u_by.employee_id = e_by.employee_id
      LEFT JOIN departments d_by ON e_by.department_id = d_by.department_id
      LEFT JOIN employee_positions ep_by ON e_by.employee_id = ep_by.employee_id AND ep_by.is_primary = 1
      LEFT JOIN organization_structure os_by ON ep_by.org_node_id = os_by.id
      LEFT JOIN specific_objective_details sod ON (ta.category LIKE 'action_plan_breakdown:%' AND sod.specific_objective_detail_id = CAST(SUBSTRING_INDEX(ta.category, ':', -1) AS UNSIGNED))
      LEFT JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
      LEFT JOIN objectives o ON so.objective_id = o.objective_id
      LEFT JOIN goals g ON (sod.goal_id = g.goal_id OR o.goal_id = g.goal_id)
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

    const { branch_id } = req.query;
    const roleId = Number(req.role_id || (req.user && req.user.role_id) || 0);
    const roleName = String(req.role_name || (req.user && req.user.role_name) || '').toLowerCase();
    const isSuperAdmin = Boolean(req.is_super_admin) || 
                         [1, 34].includes(roleId) || 
                         roleName.includes('super admin') || 
                         roleName === 'admin' || 
                         roleName === 'system admin';

    const isCentralTop2Positions = (
      [29, 2].includes(roleId) ||
      roleName === 'ceo' ||
      roleName === 'deputy ceo' ||
      roleName.includes('ceo') ||
      roleName.includes('deputy')
    );

    const canSeeAllBranches = isSuperAdmin || 
                              isCentralTop2Positions || 
                              Boolean(req.can_see_all_branches) || 
                              Boolean(req.user?.can_view_all_branches) ||
                              (Array.isArray(req.allowed_branches) && req.allowed_branches.length > 1);

    const branchToFilter = canSeeAllBranches 
      ? (branch_id && branch_id !== 'all' ? branch_id : null) 
      : (req.branch_id || 1);

    let branchWhere = '';
    const queryParams = [];
    if (branchToFilter) {
      branchWhere = ' AND (COALESCE(e.branch_id, u.branch_id, 1) = ?)';
      queryParams.push(branchToFilter);
    }

    const allUsersQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        e.employee_id,
        COALESCE(e.branch_id, u.branch_id, 1) as branch_id,
        COALESCE(b.name, 'Federal Head Office') as branch_name,
        COALESCE(b.code, 'HQ-FED-001') as branch_code,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as name,
        COALESCE(os_main.name, pos.title, pos.name, r.role_name, 'Staff') as position,
        e.email as email,
        COALESCE(d.name, os_main.name, 'General Directorate') as department_name,
        u.avatar_url,
        e.supervisor_id,
        (SELECT CONCAT(e2.fname, ' ', e2.lname) FROM employees e2 WHERE e2.employee_id = e.supervisor_id) as supervisor_name,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status = 'pending') as pending_tasks,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = u.user_id AND status IN ('completed', 'confirmed')) as completed_tasks,
        (SELECT COUNT(*) FROM daily_tasks dt WHERE dt.user_id = u.user_id) as daily_total,
        (SELECT COUNT(*) FROM daily_tasks dt WHERE dt.user_id = u.user_id AND dt.status IN ('done', 'completed')) as daily_completed,
        (SELECT COUNT(*) FROM task_assignments ta_cr WHERE ta_cr.assigned_by = u.user_id) as delegated_total,
        (SELECT COUNT(*) FROM task_assignments ta_cr WHERE ta_cr.assigned_by = u.user_id AND ta_cr.status IN ('completed', 'confirmed')) as delegated_completed,
        (SELECT COUNT(*) FROM task_assignments ta_rc WHERE ta_rc.assigned_to = u.user_id) as received_total,
        (SELECT COUNT(*) FROM task_assignments ta_rc WHERE ta_rc.assigned_to = u.user_id AND ta_rc.due_date IS NOT NULL AND ta_rc.due_date < NOW() AND ta_rc.status NOT IN ('completed', 'confirmed')) as received_overdue
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      LEFT JOIN branches b ON COALESCE(e.branch_id, u.branch_id, 1) = b.branch_id
      WHERE u.status = '1'
      ${branchWhere}
      ORDER BY e.fname ASC, u.user_name ASC
    `;

    db.query(allUsersQuery, queryParams, (err, results) => {
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
          -- 1. Monthly tasks explicitly assigned
          SELECT 
            mta.user_id, 
            mt.monthly_task_id AS task_id, 
            COALESCE(mt.name, 'Monthly Task') AS name, 
            COALESCE(mt.progress, 0) AS progress, 
            mt.weight, 
            COALESCE(mt.plan_amount, 0) AS target_amount,
            COALESCE(mt.actual_amount, 0) AS actual_amount,
            COALESCE(sod.measurement, '') AS unit,
            COALESCE(mt.status, 'pending') AS status,
            COALESCE(mt.description, '') AS notes,
            COALESCE(mt.start_date, mt.created_at) AS start_date,
            COALESCE(mt.deadline, sod.deadline) AS deadline,
            COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
            NULL AS parent_task_name,
            'monthly' AS type
          FROM monthly_task_assignees mta
          JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
          LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
          WHERE mta.user_id IN (?)
          
          UNION ALL
          
          -- 2. Weekly tasks explicitly assigned
          SELECT 
            wta.user_id, 
            wt.weekly_task_id AS task_id, 
            COALESCE(wt.name, 'Weekly Task') AS name, 
            COALESCE(wt.progress, 0) AS progress, 
            wt.weight, 
            COALESCE(wt.plan_amount, 0) AS target_amount,
            COALESCE(wt.actual_amount, 0) AS actual_amount,
            COALESCE(sod.measurement, '') AS unit,
            COALESCE(wt.status, 'pending') AS status,
            COALESCE(wt.description, '') AS notes,
            COALESCE(wt.start_date, wt.created_at) AS start_date,
            COALESCE(wt.deadline, mt.deadline, sod.deadline) AS deadline,
            COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
            mt.name AS parent_task_name,
            'weekly' AS type
          FROM weekly_task_assignees wta
          JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id
          LEFT JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
          LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
          WHERE wta.user_id IN (?)
          
          UNION ALL
          
          -- 3. Monthly tasks on action plans owned by user (where no separate assignees exist)
          SELECT 
            sod.user_id, 
            mt.monthly_task_id AS task_id, 
            COALESCE(mt.name, 'Monthly Task') AS name, 
            COALESCE(mt.progress, 0) AS progress, 
            mt.weight, 
            COALESCE(mt.plan_amount, 0) AS target_amount,
            COALESCE(mt.actual_amount, 0) AS actual_amount,
            COALESCE(sod.measurement, '') AS unit,
            COALESCE(mt.status, 'pending') AS status,
            COALESCE(mt.description, '') AS notes,
            COALESCE(mt.start_date, mt.created_at) AS start_date,
            COALESCE(mt.deadline, sod.deadline) AS deadline,
            COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
            NULL AS parent_task_name,
            'monthly' AS type
          FROM monthly_tasks mt
          JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
          LEFT JOIN monthly_task_assignees mta ON mt.monthly_task_id = mta.monthly_task_id
          WHERE mta.id IS NULL AND sod.user_id IN (?)

          UNION ALL

          -- 4. Action plan breakdowns delegated via task_assignments
          SELECT 
            ta.assigned_to AS user_id, 
            ta.assignment_id AS task_id, 
            ta.title AS name, 
            CASE 
              WHEN ta.status IN ('completed', 'confirmed') THEN 100 
              WHEN ta.status = 'in_progress' THEN 50 
              ELSE 0 
            END AS progress, 
            0 AS weight, 
            0 AS target_amount, 
            0 AS actual_amount, 
            COALESCE(sod.measurement, '') AS unit, 
            ta.status AS status, 
            COALESCE(ta.description, '') AS notes, 
            ta.created_at AS start_date, 
            COALESCE(ta.due_date, sod.deadline) AS deadline, 
            COALESCE(sod.specific_objective_detailname, sod.name, 'Delegated Action Plan') AS action_plan_name, 
            NULL AS parent_task_name, 
            'delegated_breakdown' AS type
          FROM task_assignments ta
          LEFT JOIN specific_objective_details sod 
            ON SUBSTRING_INDEX(ta.category, ':', -1) = sod.specific_objective_detail_id
          WHERE ta.category LIKE 'action_plan_breakdown:%' AND ta.assigned_to IN (?)
        `;

        db.query(breakdownQuery, [userIds, userIds, userIds, userIds], (errB, bTasks) => {
          if (errB) {
            console.error("Error in getSupervisedUsers breakdown query:", errB);
          }
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
            const recTotal = Number(u.received_total) || 0;
            const recComp = Number(u.completed_tasks) || 0;
            const totalAllTasks = totalBTasks + recTotal;

            let totalProg = 0;
            let overdueCount = 0;
            let earliestStart = null;
            let latestDeadline = null;

            tasks.forEach(t => {
              const prog = parseFloat(t.progress) || 0;
              totalProg += prog;
              const isOverdue = t.deadline && new Date(t.deadline) < new Date() && prog < 100;
              if (isOverdue) overdueCount++;

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

            // Also check operational tasks overdue
            const recOverdue = Number(u.received_overdue) || 0;
            overdueCount += recOverdue;

            // Calculate progress
            const bAvgProg = totalBTasks > 0 ? Math.round(totalProg / totalBTasks) : 0;
            const recRate = recTotal > 0 ? Math.round((recComp / recTotal) * 100) : 0;
            
            let effectiveAvgProg = 0;
            if (totalBTasks > 0 && recTotal > 0) {
              effectiveAvgProg = Math.round((bAvgProg + recRate) / 2);
            } else if (totalBTasks > 0) {
              effectiveAvgProg = bAvgProg;
            } else if (recTotal > 0) {
              effectiveAvgProg = recRate;
            }

            let health = 'no_tasks';
            if (totalAllTasks > 0) {
              if (overdueCount > 0 || effectiveAvgProg < 40) health = 'overdue';
              else if (effectiveAvgProg < 75) health = 'behind';
              else health = 'on_track';
            }

            u.breakdown_tasks_count = totalBTasks;
            u.operational_tasks_count = recTotal;
            u.total_tasks_count = totalAllTasks;
            u.breakdown_avg_progress = effectiveAvgProg;
            u.breakdown_overdue_count = overdueCount;
            u.health_status = health;
            u.start_date = earliestStart;
            u.deadline = latestDeadline;
            u.breakdown_tasks = tasks;

            // Subordinate performance score calculation
            const dTotal = Number(u.daily_total) || 0;
            const dComp = Number(u.daily_completed) || 0;
            const dRate = dTotal > 0 ? Math.round((dComp / dTotal) * 100) : 0;

            const delTotal = Number(u.delegated_total) || 0;
            const delComp = Number(u.delegated_completed) || 0;
            const delRate = delTotal > 0 ? Math.round((delComp / delTotal) * 100) : 0;

            let sumW = 0, sumScores = 0;
            if (dTotal > 0) { sumScores += dRate * 0.35; sumW += 0.35; }
            if (recTotal > 0) { sumScores += recRate * 0.35; sumW += 0.35; }
            if (delTotal > 0) { sumScores += delRate * 0.15; sumW += 0.15; }
            if (totalBTasks > 0) { sumScores += bAvgProg * 0.15; sumW += 0.15; }

            const perfScore = sumW > 0 ? Math.round(sumScores / sumW) : null;
            u.performance_score = perfScore;
            u.daily_rate = dRate;
            u.delegated_rate = delRate;
            u.received_rate = recRate;
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

// Get comprehensive operational dossier & performance for a subordinate user
exports.getSubordinateDetails = async (req, res) => {
  try {
    const supervisorUserId = req.user_id;
    const subordinateUserId = Number(req.params.id);

    if (!supervisorUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!subordinateUserId) {
      return res.status(400).json({ success: false, message: "Subordinate ID is required" });
    }

    // 1. Get subordinate user & employee details
    const userQuery = `
      SELECT 
        u.user_id,
        u.user_name,
        e.employee_id,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as name,
        COALESCE(os_main.name, pos.title, pos.name, r.role_name, 'Staff') as position,
        e.email,
        COALESCE(d.name, os_main.name, 'General Directorate') as department_name,
        u.avatar_url,
        e.supervisor_id,
        (SELECT CONCAT(e2.fname, ' ', e2.lname) FROM employees e2 WHERE e2.employee_id = e.supervisor_id) as supervisor_name
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE u.user_id = ?
    `;

    // 2. Query Daily Tasks logged by this subordinate
    const dailyTasksQuery = `
      SELECT 
        daily_task_id,
        title,
        description,
        priority,
        status,
        task_date,
        start_time,
        end_time,
        category,
        notes,
        created_at
      FROM daily_tasks
      WHERE user_id = ?
      ORDER BY COALESCE(task_date, created_at) DESC, created_at DESC
      LIMIT 100
    `;

    // 3. Query Tasks Created by this subordinate and assigned to their team members (Delegated Tasks)
    const delegatedTasksQuery = `
      SELECT 
        ta.assignment_id,
        ta.title,
        ta.description,
        ta.priority,
        ta.category,
        ta.status,
        ta.due_date,
        ta.created_at,
        ta.completed_at,
        ta.confirmed_at,
        ta.completion_note,
        ta.assigned_to,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as assignee_name,
        COALESCE(os_main.name, pos.title, pos.name, 'Staff') as assignee_position,
        COALESCE(d.name, 'General Directorate') as assignee_department,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() AND ta.status NOT IN ('completed', 'confirmed') THEN 1 
          ELSE 0 
        END as is_overdue,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() AND ta.status NOT IN ('completed', 'confirmed') THEN DATEDIFF(NOW(), ta.due_date)
          ELSE 0 
        END as days_overdue
      FROM task_assignments ta
      JOIN users u ON ta.assigned_to = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE ta.assigned_by = ?
      ORDER BY ta.created_at DESC
      LIMIT 100
    `;

    // 4. Query Tasks Assigned to this subordinate (Received Tasks)
    const receivedTasksQuery = `
      SELECT 
        ta.assignment_id,
        ta.title,
        ta.description,
        ta.priority,
        ta.category,
        ta.status,
        ta.due_date,
        ta.created_at,
        ta.completed_at,
        ta.confirmed_at,
        ta.completion_note,
        ta.assigned_by,
        CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) as assigner_name,
        COALESCE(os_main.name, pos.title, pos.name, 'Supervisor') as assigner_position,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() AND ta.status NOT IN ('completed', 'confirmed') THEN 1 
          ELSE 0 
        END as is_overdue,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() AND ta.status NOT IN ('completed', 'confirmed') THEN DATEDIFF(NOW(), ta.due_date)
          ELSE 0 
        END as days_overdue
      FROM task_assignments ta
      LEFT JOIN users u ON ta.assigned_by = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN employee_positions ep_main ON e.employee_id = ep_main.employee_id AND ep_main.is_primary = 1
      LEFT JOIN organization_structure os_main ON ep_main.org_node_id = os_main.id
      LEFT JOIN positions pos ON ep_main.position_id = pos.position_id
      WHERE ta.assigned_to = ?
      ORDER BY ta.created_at DESC
      LIMIT 100
    `;

    // 5. Query Work Breakdowns (Monthly, Weekly, Plan Owner, and Delegated Breakdown Tasks)
    const breakdownQuery = `
      -- 1. Monthly tasks explicitly assigned
      SELECT 
        mt.monthly_task_id AS task_id, 
        COALESCE(mt.name, 'Monthly Task') AS name, 
        COALESCE(mt.progress, 0) AS progress, 
        mt.weight, 
        COALESCE(mt.plan_amount, 0) AS target_amount,
        COALESCE(mt.actual_amount, 0) AS actual_amount,
        COALESCE(sod.measurement, '') AS unit,
        COALESCE(mt.status, 'pending') AS status,
        COALESCE(mt.description, '') AS notes,
        COALESCE(mt.start_date, mt.created_at) AS start_date,
        COALESCE(mt.deadline, sod.deadline) AS deadline,
        COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
        NULL AS parent_task_name,
        'monthly' AS type
      FROM monthly_task_assignees mta
      JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
      LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE mta.user_id = ?
      
      UNION ALL
      
      -- 2. Weekly tasks explicitly assigned
      SELECT 
        wt.weekly_task_id AS task_id, 
        COALESCE(wt.name, 'Weekly Task') AS name, 
        COALESCE(wt.progress, 0) AS progress, 
        wt.weight, 
        COALESCE(wt.plan_amount, 0) AS target_amount,
        COALESCE(wt.actual_amount, 0) AS actual_amount,
        COALESCE(sod.measurement, '') AS unit,
        COALESCE(wt.status, 'pending') AS status,
        COALESCE(wt.description, '') AS notes,
        COALESCE(wt.start_date, wt.created_at) AS start_date,
        COALESCE(wt.deadline, mt.deadline, sod.deadline) AS deadline,
        COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
        mt.name AS parent_task_name,
        'weekly' AS type
      FROM weekly_task_assignees wta
      JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id
      LEFT JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
      LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
      WHERE wta.user_id = ?

      UNION ALL

      -- 3. Monthly tasks on action plans owned by user (where no separate assignees exist)
      SELECT 
        mt.monthly_task_id AS task_id, 
        COALESCE(mt.name, 'Monthly Task') AS name, 
        COALESCE(mt.progress, 0) AS progress, 
        mt.weight, 
        COALESCE(mt.plan_amount, 0) AS target_amount,
        COALESCE(mt.actual_amount, 0) AS actual_amount,
        COALESCE(sod.measurement, '') AS unit,
        COALESCE(mt.status, 'pending') AS status,
        COALESCE(mt.description, '') AS notes,
        COALESCE(mt.start_date, mt.created_at) AS start_date,
        COALESCE(mt.deadline, sod.deadline) AS deadline,
        COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS action_plan_name,
        NULL AS parent_task_name,
        'monthly' AS type
      FROM monthly_tasks mt
      JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
      LEFT JOIN monthly_task_assignees mta ON mt.monthly_task_id = mta.monthly_task_id
      WHERE mta.id IS NULL AND sod.user_id = ?

      UNION ALL

      -- 4. Action plan breakdowns delegated via task_assignments
      SELECT 
        ta.assignment_id AS task_id, 
        ta.title AS name, 
        CASE 
          WHEN ta.status IN ('completed', 'confirmed') THEN 100 
          WHEN ta.status = 'in_progress' THEN 50 
          ELSE 0 
        END AS progress, 
        0 AS weight, 
        0 AS target_amount, 
        0 AS actual_amount, 
        COALESCE(sod.measurement, '') AS unit, 
        ta.status AS status, 
        COALESCE(ta.description, '') AS notes, 
        ta.created_at AS start_date, 
        COALESCE(ta.due_date, sod.deadline) AS deadline, 
        COALESCE(sod.specific_objective_detailname, sod.name, 'Delegated Action Plan') AS action_plan_name, 
        NULL AS parent_task_name, 
        'delegated_breakdown' AS type
      FROM task_assignments ta
      LEFT JOIN specific_objective_details sod 
        ON SUBSTRING_INDEX(ta.category, ':', -1) = sod.specific_objective_detail_id
      WHERE ta.category LIKE 'action_plan_breakdown:%' AND ta.assigned_to = ?
    `;

    const [userRows, dailyTasks, delegatedTasks, receivedTasks, breakdownTasks] = await Promise.all([
      new Promise((resolve, reject) => db.query(userQuery, [subordinateUserId], (err, res) => err ? reject(err) : resolve(res || []))),
      new Promise((resolve, reject) => db.query(dailyTasksQuery, [subordinateUserId], (err, res) => err ? reject(err) : resolve(res || []))),
      new Promise((resolve, reject) => db.query(delegatedTasksQuery, [subordinateUserId], (err, res) => err ? reject(err) : resolve(res || []))),
      new Promise((resolve, reject) => db.query(receivedTasksQuery, [subordinateUserId], (err, res) => err ? reject(err) : resolve(res || []))),
      new Promise((resolve, reject) => db.query(breakdownQuery, [subordinateUserId, subordinateUserId, subordinateUserId, subordinateUserId], (err, res) => err ? reject(err) : resolve(res || [])))
    ]);

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ success: false, message: "Subordinate not found" });
    }

    const subordinateUser = userRows[0];

    // Compute Metrics & Performance KPIs
    // 1. Daily Metrics
    const dailyTotal = dailyTasks.length;
    const dailyDone = dailyTasks.filter(t => t.status === 'done' || t.status === 'completed').length;
    const dailyInProgress = dailyTasks.filter(t => t.status === 'in_progress').length;
    const dailyTodo = dailyTasks.filter(t => t.status === 'todo').length;
    const dailyRate = dailyTotal > 0 ? Math.round((dailyDone / dailyTotal) * 100) : 0;

    // 2. Delegated Tasks Metrics (Created by subordinate)
    const delegatedTotal = delegatedTasks.length;
    const delegatedCompleted = delegatedTasks.filter(t => ['completed', 'confirmed'].includes(t.status)).length;
    const delegatedInProgress = delegatedTasks.filter(t => t.status === 'in_progress').length;
    const delegatedPending = delegatedTasks.filter(t => t.status === 'pending').length;
    const delegatedOverdue = delegatedTasks.filter(t => t.is_overdue === 1).length;
    const delegatedRate = delegatedTotal > 0 ? Math.round((delegatedCompleted / delegatedTotal) * 100) : 0;

    // 3. Received Tasks Metrics (Assigned to subordinate)
    const receivedTotal = receivedTasks.length;
    const receivedCompleted = receivedTasks.filter(t => ['completed', 'confirmed'].includes(t.status)).length;
    const receivedInProgress = receivedTasks.filter(t => t.status === 'in_progress').length;
    const receivedPending = receivedTasks.filter(t => t.status === 'pending').length;
    const receivedOverdue = receivedTasks.filter(t => t.is_overdue === 1).length;
    const receivedRate = receivedTotal > 0 ? Math.round((receivedCompleted / receivedTotal) * 100) : 0;

    // 4. Breakdown Metrics
    const breakdownTotal = breakdownTasks.length;
    let sumProgress = 0;
    breakdownTasks.forEach(bt => { sumProgress += parseFloat(bt.progress) || 0; });
    const breakdownAvg = breakdownTotal > 0 ? Math.round(sumProgress / breakdownTotal) : 0;

    // 5. Composite Performance Score (0-100)
    let weights = [];
    if (dailyTotal > 0) weights.push({ val: dailyRate, weight: 0.35 });
    if (receivedTotal > 0) weights.push({ val: receivedRate, weight: 0.35 });
    if (delegatedTotal > 0) weights.push({ val: delegatedRate, weight: 0.15 });
    if (breakdownTotal > 0) weights.push({ val: breakdownAvg, weight: 0.15 });

    let compositeScore = 0;
    if (weights.length > 0) {
      const totalW = weights.reduce((acc, w) => acc + w.weight, 0);
      const weightedSum = weights.reduce((acc, w) => acc + (w.val * w.weight), 0);
      compositeScore = Math.round(weightedSum / totalW);
    } else {
      compositeScore = 100;
    }

    let performanceGrade = 'Outstanding (A+)';
    let performanceColor = 'emerald';
    if (compositeScore < 50 || receivedOverdue > 1) {
      performanceGrade = 'Critical / Needs Attention (D)';
      performanceColor = 'rose';
    } else if (compositeScore < 70) {
      performanceGrade = 'Fair / Moderate (C)';
      performanceColor = 'amber';
    } else if (compositeScore < 85) {
      performanceGrade = 'Good Performance (B)';
      performanceColor = 'blue';
    }

    res.json({
      success: true,
      user: subordinateUser,
      daily_tasks: dailyTasks,
      delegated_tasks: delegatedTasks,
      received_tasks: receivedTasks,
      breakdown_tasks: breakdownTasks,
      metrics: {
        daily: { total: dailyTotal, completed: dailyDone, in_progress: dailyInProgress, todo: dailyTodo, rate: dailyRate },
        delegated: { total: delegatedTotal, completed: delegatedCompleted, in_progress: delegatedInProgress, pending: delegatedPending, overdue: delegatedOverdue, rate: delegatedRate },
        received: { total: receivedTotal, completed: receivedCompleted, in_progress: receivedInProgress, pending: receivedPending, overdue: receivedOverdue, rate: receivedRate },
        breakdown: { total: breakdownTotal, avg_progress: breakdownAvg },
        composite_score: compositeScore,
        grade: performanceGrade,
        color: performanceColor
      }
    });

  } catch (error) {
    console.error("Error in getSubordinateDetails:", error);
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

    // Check if task deadline has passed
    db.query('SELECT due_date, status FROM task_assignments WHERE assignment_id = ? AND assigned_to = ?', [id, userId], (checkErr, checkRows) => {
      if (checkErr) {
        return res.status(500).json({ success: false, message: "Database error", error: checkErr.message });
      }
      if (!checkRows || checkRows.length === 0) {
        return res.status(404).json({ success: false, message: "Assignment not found" });
      }
      const taskItem = checkRows[0];
      if (taskItem.due_date && isPastDeadline(taskItem.due_date)) {
        return res.status(400).json({
          success: false,
          message: "Cannot submit report: The deadline for this task has passed."
        });
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
    const { branch_id } = req.query;
    const roleId = Number(req.role_id || (req.user && req.user.role_id));
    const roleName = String(req.role_name || (req.user && req.user.role_name) || '').toLowerCase();
    const isSuperAdmin = Boolean(req.is_super_admin) || roleId === 34 || roleName === 'super admin';
    const isTopManagement = isSuperAdmin ||
      [1, 2, 29, 31, 32, 33, 34].includes(roleId) ||
      roleName === 'admin' ||
      roleName === 'system admin' ||
      roleName.includes('ceo') ||
      roleName.includes('deputy') ||
      roleName.includes('central') ||
      roleName.includes('corporation directorate') ||
      roleName.includes('strategic advisor') ||
      Boolean(req.user?.can_view_all_branches) ||
      (Array.isArray(req.allowed_branches) && req.allowed_branches.length > 1);

    const branchToFilter = isTopManagement 
      ? (branch_id && branch_id !== 'all' ? branch_id : null) 
      : (req.branch_id || 1);

    let branchWhere = '';
    const queryParams = [];
    if (branchToFilter) {
      branchWhere = ' AND (COALESCE(e.branch_id, u.branch_id, 1) = ?)';
      queryParams.push(branchToFilter);
    }

    const query = `
      SELECT 
        u.user_id,
        u.user_name,
        e.employee_id,
        COALESCE(e.branch_id, u.branch_id, 1) as branch_id,
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
      ${branchWhere}
      GROUP BY u.user_id
      ORDER BY name ASC, u.user_name ASC
    `;
    db.query(query, queryParams, (err, results) => {
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

// =========================================================================
// UNIFIED TASK MANAGEMENT HUB ALERTS (Received + Daily + Supervisor Confirm)
// GET /api/task-assignments/hub-alerts
// =========================================================================
exports.getTaskHubAlerts = async (req, res) => {
  try {
    const userId = req.user_id || req.user?.id || req.user?.user_id || req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 1. Query actionable received tasks assigned to current user
    const receivedTasksQuery = `
      SELECT 
        ta.assignment_id,
        ta.title,
        ta.description,
        ta.priority,
        ta.status,
        ta.due_date,
        ta.created_at,
        COALESCE(e.name, u.user_name, 'Supervisor') AS assigned_by_name,
        CASE 
          WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() THEN 1 
          ELSE 0 
        END AS is_overdue
      FROM task_assignments ta
      LEFT JOIN users u ON ta.assigned_by = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE ta.assigned_to = ? 
        AND ta.status IN ('pending', 'in_progress')
      ORDER BY 
        CASE WHEN ta.due_date IS NOT NULL AND ta.due_date < NOW() THEN 0 ELSE 1 END,
        CASE WHEN ta.priority = 'urgent' THEN 0 WHEN ta.priority = 'high' THEN 1 ELSE 2 END,
        ta.due_date ASC,
        ta.created_at DESC
      LIMIT 8
    `;

    // 2. Query today's daily tasks for current user
    const dailyTasksQuery = `
      SELECT 
        daily_task_id,
        title,
        priority,
        status,
        start_time,
        end_time,
        task_date
      FROM daily_tasks
      WHERE user_id = ? 
        AND (DATE(task_date) = CURDATE() OR (status NOT IN ('done', 'completed') AND task_date <= CURDATE()))
      ORDER BY 
        CASE WHEN status IN ('done', 'completed') THEN 1 ELSE 0 END,
        start_time ASC,
        created_at DESC
      LIMIT 8
    `;

    // 3. Query supervisor confirmations: tasks assigned by current user where subordinate completed work
    const supervisorQuery = `
      SELECT 
        ta.assignment_id,
        ta.title,
        ta.priority,
        ta.status,
        ta.completed_at,
        ta.completion_note,
        COALESCE(e.name, u.user_name, 'Team Member') AS assigned_to_name
      FROM task_assignments ta
      LEFT JOIN users u ON ta.assigned_to = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE ta.assigned_by = ? 
        AND ta.status = 'completed'
      ORDER BY ta.completed_at DESC, ta.updated_at DESC
      LIMIT 8
    `;

    // 4. Overall counts
    const countsQuery = `
      SELECT
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ? AND status IN ('pending', 'in_progress')) AS received_pending,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_to = ? AND status IN ('pending', 'in_progress') AND due_date IS NOT NULL AND due_date < NOW()) AS received_overdue,
        (SELECT COUNT(*) FROM task_assignments WHERE assigned_by = ? AND status = 'completed') AS supervisor_pending_confirm,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = CURDATE()) AS daily_today_total,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND DATE(task_date) = CURDATE() AND status IN ('done', 'completed')) AS daily_today_completed,
        (SELECT COUNT(*) FROM daily_tasks WHERE user_id = ? AND (DATE(task_date) = CURDATE() OR (status NOT IN ('done', 'completed') AND task_date <= CURDATE())) AND status NOT IN ('done', 'completed')) AS daily_pending
    `;

    const [receivedRows, dailyRows, supervisorRows, countRows] = await Promise.all([
      new Promise((resolve) => db.query(receivedTasksQuery, [userId], (e, r) => resolve(r || []))),
      new Promise((resolve) => db.query(dailyTasksQuery, [userId], (e, r) => resolve(r || []))),
      new Promise((resolve) => db.query(supervisorQuery, [userId], (e, r) => resolve(r || []))),
      new Promise((resolve) => db.query(countsQuery, [userId, userId, userId, userId, userId, userId], (e, r) => resolve(r && r[0] ? r[0] : {})))
    ]);

    const received_pending = Number(countRows.received_pending || 0);
    const received_overdue = Number(countRows.received_overdue || 0);
    const supervisor_pending_confirm = Number(countRows.supervisor_pending_confirm || 0);
    const daily_today_total = Number(countRows.daily_today_total || 0);
    const daily_today_completed = Number(countRows.daily_today_completed || 0);
    const daily_pending = Number(countRows.daily_pending || 0);

    const total_alerts = received_pending + supervisor_pending_confirm + daily_pending;

    res.json({
      success: true,
      summary: {
        total_alerts,
        received_count: received_pending,
        received_overdue,
        supervisor_count: supervisor_pending_confirm,
        daily_total: daily_today_total,
        daily_completed: daily_today_completed,
        daily_pending
      },
      received_tasks: receivedRows,
      daily_tasks: dailyRows,
      supervisor_confirmations: supervisorRows
    });
  } catch (error) {
    console.error("Error in getTaskHubAlerts:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
