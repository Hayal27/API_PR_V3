const con = require('../models/db');

// Ensure plan_pillars table exists and menu permissions are assigned on load
const initPillarDb = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS plan_pillars (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NULL,
      description TEXT NULL,
      is_active TINYINT(1) DEFAULT 1,
      sort_order INT DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `;
  con.query(sql, (err) => {
    if (err) console.error("Error creating plan_pillars table:", err.message);
  });

  // Ensure goals table has pillar_id
  con.query(`ALTER TABLE goals ADD COLUMN pillar_id INT NULL`, () => {});

  // Find Planning & Strategy parent menu (ID 9) or top level
  con.query("SELECT id FROM menu_items WHERE id = 9 OR (name LIKE '%Planning%' AND parent_id IS NULL) LIMIT 1", (err, parentRes) => {
    const parentId = (parentRes && parentRes.length > 0) ? parentRes[0].id : 9;

    // Register /plan-pillars
    con.query("SELECT id FROM menu_items WHERE path = '/plan-pillars' LIMIT 1", (err, pCheck) => {
      let pillarsMenuId;
      if (pCheck && pCheck.length > 0) {
        pillarsMenuId = pCheck[0].id;
        con.query("UPDATE menu_items SET parent_id = ?, sort_order = 15, is_active = 1 WHERE id = ?", [parentId, pillarsMenuId]);
        grantPermissionsToAllRoles(pillarsMenuId);
      } else {
        con.query(
          "INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active) VALUES ('Plan Pillars', '/plan-pillars', 'bi-columns-gap', ?, 15, 'PlanPillarsPage.jsx', 1)",
          [parentId],
          (err, res) => {
            if (!err && res) grantPermissionsToAllRoles(res.insertId);
          }
        );
      }
    });

    // Register /goal-config
    con.query("SELECT id FROM menu_items WHERE path = '/goal-config' LIMIT 1", (err, gCheck) => {
      let goalConfigMenuId;
      if (gCheck && gCheck.length > 0) {
        goalConfigMenuId = gCheck[0].id;
        con.query("UPDATE menu_items SET parent_id = ?, sort_order = 16, is_active = 1 WHERE id = ?", [parentId, goalConfigMenuId]);
        grantPermissionsToAllRoles(goalConfigMenuId);
      } else {
        con.query(
          "INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active) VALUES ('Goal Configuration', '/goal-config', 'bi-sliders', ?, 16, 'GoalConfigPage.jsx', 1)",
          [parentId],
          (err, res) => {
            if (!err && res) grantPermissionsToAllRoles(res.insertId);
          }
        );
      }
    });
  });
};

// Helper to grant view/create/edit/delete permissions to all system roles
const grantPermissionsToAllRoles = (menuItemId) => {
  con.query("SELECT role_id FROM roles", (err, roles) => {
    if (err || !roles) return;
    roles.forEach(r => {
      const sql = `
        INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
        VALUES (?, ?, 1, 1, 1, 1)
        ON DUPLICATE KEY UPDATE can_view = 1, can_create = 1, can_edit = 1, can_delete = 1
      `;
      con.query(sql, [r.role_id, menuItemId], () => {});
    });
  });
};

initPillarDb();


// 1. Get all pillars with goals count
exports.getAllPillars = (req, res) => {
  const sql = `
    SELECT 
      p.id,
      p.name,
      p.code,
      p.description,
      p.is_active,
      p.sort_order,
      p.created_at,
      COUNT(g.goal_id) AS goals_count
    FROM plan_pillars p
    LEFT JOIN goals g ON g.pillar_id = p.id
    GROUP BY p.id
    ORDER BY p.sort_order ASC, p.id ASC
  `;

  con.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching pillars:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch plan pillars", error: err.message });
    }
    return res.status(200).json({ success: true, data: results });
  });
};

// 2. Create a new pillar
exports.createPillar = (req, res) => {
  const { name, code, description, sort_order, is_active } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Pillar name is required" });
  }

  const sql = `
    INSERT INTO plan_pillars (name, code, description, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    name,
    code || null,
    description || null,
    sort_order ? parseInt(sort_order, 10) : 10,
    is_active !== undefined ? (is_active ? 1 : 0) : 1
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error creating pillar:", err);
      return res.status(500).json({ success: false, message: "Failed to create pillar", error: err.message });
    }
    return res.status(201).json({
      success: true,
      message: "Plan Pillar created successfully",
      pillar_id: result.insertId
    });
  });
};

// 3. Update an existing pillar
exports.updatePillar = (req, res) => {
  const { id } = req.params;
  const { name, code, description, sort_order, is_active } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: "Pillar name is required" });
  }

  const sql = `
    UPDATE plan_pillars
    SET name = ?, code = ?, description = ?, sort_order = ?, is_active = ?
    WHERE id = ?
  `;

  const values = [
    name,
    code || null,
    description || null,
    sort_order ? parseInt(sort_order, 10) : 10,
    is_active !== undefined ? (is_active ? 1 : 0) : 1,
    id
  ];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating pillar:", err);
      return res.status(500).json({ success: false, message: "Failed to update pillar", error: err.message });
    }
    return res.status(200).json({ success: true, message: "Plan Pillar updated successfully" });
  });
};

// 4. Delete a pillar
exports.deletePillar = (req, res) => {
  const { id } = req.params;

  // Unlink goals assigned to this pillar first
  con.query("UPDATE goals SET pillar_id = NULL WHERE pillar_id = ?", [id], (err) => {
    if (err) console.error("Error unlinking goals from deleted pillar:", err.message);

    const sql = "DELETE FROM plan_pillars WHERE id = ?";
    con.query(sql, [id], (err, result) => {
      if (err) {
        console.error("Error deleting pillar:", err);
        return res.status(500).json({ success: false, message: "Failed to delete pillar", error: err.message });
      }
      return res.status(200).json({ success: true, message: "Plan Pillar deleted successfully" });
    });
  });
};

// 5. Assign multiple goals to a pillar
exports.assignGoalsToPillar = (req, res) => {
  const { id } = req.params; // pillar_id
  const { goal_ids } = req.body; // Array of goal_ids

  if (!Array.isArray(goal_ids)) {
    return res.status(400).json({ success: false, message: "goal_ids must be an array" });
  }

  // Clear pillar_id for all goals previously assigned to this pillar if goal_ids is passed
  con.query("UPDATE goals SET pillar_id = NULL WHERE pillar_id = ?", [id], (err) => {
    if (err) {
      console.error("Error resetting pillar_id:", err);
      return res.status(500).json({ success: false, message: "Failed to reassign goals", error: err.message });
    }

    if (goal_ids.length === 0) {
      return res.status(200).json({ success: true, message: "Pillar goals updated (unassigned all)" });
    }

    const sql = `UPDATE goals SET pillar_id = ? WHERE goal_id IN (?)`;
    con.query(sql, [id, goal_ids], (err, result) => {
      if (err) {
        console.error("Error assigning goals to pillar:", err);
        return res.status(500).json({ success: false, message: "Failed to assign goals to pillar", error: err.message });
      }
      return res.status(200).json({
        success: true,
        message: `${result.affectedRows} goals assigned to pillar successfully`
      });
    });
  });
};
