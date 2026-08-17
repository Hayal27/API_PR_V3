/**
 * Migration: Create plan_pillars & goal_quarter_activations tables, add pillar_id & duration to goals, register menu items
 * Run: node backend/migrations/create_pillars_and_goal_config.js
 */
const con = require('../models/db');

async function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(Array.isArray(result) ? result : [result]);
    });
  });
}

async function run() {
  console.log('🚀 Starting Plan Pillars & Goal Configuration Migration...');

  // 1. Create plan_pillars table
  try {
    await q(`
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
    console.log('✔ Table `plan_pillars` created/ready.');
  } catch (err) {
    console.error('Error creating plan_pillars:', err.message);
  }

  // 2. Add pillar_id, start_year, end_year, is_active to goals table
  const columns = [
    { name: 'pillar_id', type: 'INT NULL' },
    { name: 'start_year', type: 'INT NULL' },
    { name: 'end_year', type: 'INT NULL' },
    { name: 'is_active', type: 'TINYINT(1) DEFAULT 1' }
  ];

  for (const col of columns) {
    try {
      await q(`ALTER TABLE goals ADD COLUMN ${col.name} ${col.type}`);
      console.log(`✔ Added column \`${col.name}\` to goals table.`);
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log(`→ Column \`${col.name}\` already exists in goals table.`);
      } else {
        console.error(`Error adding \`${col.name}\` to goals:`, err.message);
      }
    }
  }

  // 3. Create goal_quarter_activations table
  try {
    await q(`
      CREATE TABLE IF NOT EXISTS goal_quarter_activations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        goal_id INT NOT NULL,
        year INT NOT NULL,
        quarter VARCHAR(10) NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_goal_year_quarter (goal_id, year, quarter),
        FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    console.log('✔ Table `goal_quarter_activations` created/ready.');
  } catch (err) {
    console.error('Error creating goal_quarter_activations:', err.message);
  }

  // 4. Register Menu Items & Role Permissions
  // A. Plan Pillars Menu (/plan-pillars)
  let pillarsMenuItemId;
  const existingPillars = await q("SELECT id FROM menu_items WHERE path = '/plan-pillars' LIMIT 1");
  if (existingPillars.length > 0) {
    pillarsMenuItemId = existingPillars[0].id;
    console.log('→ Menu item /plan-pillars already exists (id=%d)', pillarsMenuItemId);
  } else {
    const res = await q(
      `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
       VALUES (?, ?, ?, NULL, 80, ?, 1)`,
      ['Plan Pillars', '/plan-pillars', 'bi bi-columns-gap', 'PlanPillarsPage.jsx']
    );
    pillarsMenuItemId = res.insertId;
    console.log('✔ Inserted menu item /plan-pillars (id=%d)', pillarsMenuItemId);
  }

  // B. Goal Configuration Menu (/goal-config)
  let goalConfigMenuItemId;
  const existingGoalConfig = await q("SELECT id FROM menu_items WHERE path = '/goal-config' LIMIT 1");
  if (existingGoalConfig.length > 0) {
    goalConfigMenuItemId = existingGoalConfig[0].id;
    console.log('→ Menu item /goal-config already exists (id=%d)', goalConfigMenuItemId);
  } else {
    const res = await q(
      `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
       VALUES (?, ?, ?, NULL, 85, ?, 1)`,
      ['Goal Configuration', '/goal-config', 'bi bi-sliders', 'GoalConfigPage.jsx']
    );
    goalConfigMenuItemId = res.insertId;
    console.log('✔ Inserted menu item /goal-config (id=%d)', goalConfigMenuItemId);
  }

  // Grant Permissions to Admin(1), CEO(2), Deputy CEO(3), Director(4), Team Leader(5), Executive Planning(29)
  const roleIds = [1, 2, 3, 4, 5, 29];
  for (const menuItemId of [pillarsMenuItemId, goalConfigMenuItemId]) {
    for (const roleId of roleIds) {
      const existingPerm = await q(
        'SELECT id FROM role_permissions WHERE role_id = ? AND menu_item_id = ? LIMIT 1',
        [roleId, menuItemId]
      );
      if (existingPerm.length === 0) {
        await q(
          `INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
           VALUES (?, ?, 1, 1, 1, 1)`,
          [roleId, menuItemId]
        );
        console.log(`  ✔ Granted permission for role_id=${roleId} on menu_item_id=${menuItemId}`);
      }
    }
  }

  console.log('\n✅ Plan Pillars & Goal Configuration Migration finished successfully.');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});
