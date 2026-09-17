const { PlanPillars, Goals, MenuItems, RolePermissions, Roles, sequelize } = require('../models/index');
const { QueryTypes, Op } = require('sequelize');

// Ensure plan_pillars table exists and menu permissions are assigned on load
const initPillarDb = async () => {
  try {
    // 1. Check/create plan_pillars table (Sequelize sync or check)
    await sequelize.query(`
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
    `);

    // 2. Ensure goals table has pillar_id
    try {
      await sequelize.query(`ALTER TABLE goals ADD COLUMN pillar_id INT NULL`);
    } catch (_) {
      // Column may already exist
    }

    // 3. Find Planning & Strategy parent menu (ID 9) or top level
    const parentRes = await sequelize.query(
      "SELECT id FROM menu_items WHERE id = 9 OR (name LIKE '%Planning%' AND parent_id IS NULL) LIMIT 1",
      { type: QueryTypes.SELECT }
    );
    const parentId = (parentRes && parentRes.length > 0) ? parentRes[0].id : 9;

    // Helper to grant view/create/edit/delete permissions to all system roles
    const grantPermissionsToAllRoles = async (menuItemId) => {
      const roles = await Roles.findAll({ attributes: ['role_id'], raw: true });
      if (!roles || roles.length === 0) return;

      for (const r of roles) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
          VALUES (:roleId, :menuItemId, 1, 1, 1, 1)
          ON DUPLICATE KEY UPDATE can_view = 1, can_create = 1, can_edit = 1, can_delete = 1
        `, {
          replacements: { roleId: r.role_id, menuItemId }
        });
      }
    };

    // Register /plan-pillars
    const pCheck = await MenuItems.findOne({
      where: { path: '/plan-pillars' },
      attributes: ['id'],
      raw: true
    });

    if (pCheck) {
      await MenuItems.update(
        { parent_id: parentId, sort_order: 15, is_active: 1 },
        { where: { id: pCheck.id } }
      );
      await grantPermissionsToAllRoles(pCheck.id);
    } else {
      const created = await MenuItems.create({
        name: 'Plan Pillars',
        path: '/plan-pillars',
        icon: 'bi-columns-gap',
        parent_id: parentId,
        sort_order: 15,
        file_name: 'PlanPillarsPage.jsx',
        is_active: 1
      });
      await grantPermissionsToAllRoles(created.id);
    }

    // Register /goal-config
    const gCheck = await MenuItems.findOne({
      where: { path: '/goal-config' },
      attributes: ['id'],
      raw: true
    });

    if (gCheck) {
      await MenuItems.update(
        { parent_id: parentId, sort_order: 16, is_active: 1 },
        { where: { id: gCheck.id } }
      );
      await grantPermissionsToAllRoles(gCheck.id);
    } else {
      const created = await MenuItems.create({
        name: 'Goal Configuration',
        path: '/goal-config',
        icon: 'bi-sliders',
        parent_id: parentId,
        sort_order: 16,
        file_name: 'GoalConfigPage.jsx',
        is_active: 1
      });
      await grantPermissionsToAllRoles(created.id);
    }
  } catch (err) {
    console.warn("Notice in initPillarDb:", err.message);
  }
};

initPillarDb();

// 1. Get all pillars with goals count
exports.getAllPillars = async (req, res) => {
  try {
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

    const results = await sequelize.query(sql, { type: QueryTypes.SELECT });
    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error fetching pillars:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch plan pillars", error: err.message });
  }
};

// 2. Create a new pillar
exports.createPillar = async (req, res) => {
  try {
    const { name, code, description, sort_order, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Pillar name is required" });
    }

    const newPillar = await PlanPillars.create({
      name,
      code: code || null,
      description: description || null,
      sort_order: sort_order ? parseInt(sort_order, 10) : 10,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1
    });

    return res.status(201).json({
      success: true,
      message: "Plan Pillar created successfully",
      pillar_id: newPillar.id
    });
  } catch (err) {
    console.error("Error creating pillar:", err);
    return res.status(500).json({ success: false, message: "Failed to create pillar", error: err.message });
  }
};

// 3. Update an existing pillar
exports.updatePillar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, sort_order, is_active } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Pillar name is required" });
    }

    await PlanPillars.update({
      name,
      code: code || null,
      description: description || null,
      sort_order: sort_order ? parseInt(sort_order, 10) : 10,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1
    }, {
      where: { id }
    });

    return res.status(200).json({ success: true, message: "Plan Pillar updated successfully" });
  } catch (err) {
    console.error("Error updating pillar:", err);
    return res.status(500).json({ success: false, message: "Failed to update pillar", error: err.message });
  }
};

// 4. Delete a pillar
exports.deletePillar = async (req, res) => {
  try {
    const { id } = req.params;

    // Unlink goals assigned to this pillar first
    await Goals.update({ pillar_id: null }, { where: { pillar_id: id } });

    // Delete the pillar
    await PlanPillars.destroy({ where: { id } });

    return res.status(200).json({ success: true, message: "Plan Pillar deleted successfully" });
  } catch (err) {
    console.error("Error deleting pillar:", err);
    return res.status(500).json({ success: false, message: "Failed to delete pillar", error: err.message });
  }
};

// 5. Assign multiple goals to a pillar
exports.assignGoalsToPillar = async (req, res) => {
  try {
    const { id } = req.params; // pillar_id
    const { goal_ids } = req.body; // Array of goal_ids

    if (!Array.isArray(goal_ids)) {
      return res.status(400).json({ success: false, message: "goal_ids must be an array" });
    }

    // Clear pillar_id for all goals previously assigned to this pillar
    await Goals.update({ pillar_id: null }, { where: { pillar_id: id } });

    if (goal_ids.length === 0) {
      return res.status(200).json({ success: true, message: "Pillar goals updated (unassigned all)" });
    }

    const [affectedRows] = await Goals.update(
      { pillar_id: id },
      { where: { goal_id: { [Op.in]: goal_ids } } }
    );

    return res.status(200).json({
      success: true,
      message: `${affectedRows} goals assigned to pillar successfully`
    });
  } catch (err) {
    console.error("Error assigning goals to pillar:", err);
    return res.status(500).json({ success: false, message: "Failed to assign goals to pillar", error: err.message });
  }
};
