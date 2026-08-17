const con = require('../models/db');

async function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(Array.isArray(result) ? result : [result]);
    });
  });
}

async function setup() {
  console.log('🔄 Setting up Menu List & Role Permissions for Plan Pillars & Goal Configuration...');

  // 1. Find or get 'Planning & Strategy' parent menu item
  let parentId = null;
  const parentRes = await q("SELECT id FROM menu_items WHERE name LIKE '%Planning%' OR name LIKE '%Strategy%' AND parent_id IS NULL ORDER BY id ASC LIMIT 1");
  if (parentRes.length > 0) {
    parentId = parentRes[0].id;
    console.log('Found Planning & Strategy parent menu ID:', parentId);
  }

  // 2. Ensure /plan-pillars item exists in menu_items
  let pillarsId;
  const pillarsCheck = await q("SELECT id FROM menu_items WHERE path = '/plan-pillars' LIMIT 1");
  if (pillarsCheck.length > 0) {
    pillarsId = pillarsCheck[0].id;
    await q("UPDATE menu_items SET parent_id = ?, sort_order = 15, icon = 'bi-columns-gap', is_active = 1 WHERE id = ?", [parentId, pillarsId]);
    console.log('✔ Updated /plan-pillars menu item (ID=%d, Parent=%s)', pillarsId, parentId);
  } else {
    const res = await q(
      `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
       VALUES ('Plan Pillars', '/plan-pillars', 'bi-columns-gap', ?, 15, 'PlanPillarsPage.jsx', 1)`,
      [parentId]
    );
    pillarsId = res.insertId;
    console.log('✔ Inserted /plan-pillars menu item (ID=%d)', pillarsId);
  }

  // 3. Ensure /goal-config item exists in menu_items
  let goalConfigId;
  const goalConfigCheck = await q("SELECT id FROM menu_items WHERE path = '/goal-config' LIMIT 1");
  if (goalConfigCheck.length > 0) {
    goalConfigId = goalConfigCheck[0].id;
    await q("UPDATE menu_items SET parent_id = ?, sort_order = 16, icon = 'bi-sliders', is_active = 1 WHERE id = ?", [parentId, goalConfigId]);
    console.log('✔ Updated /goal-config menu item (ID=%d, Parent=%s)', goalConfigId, parentId);
  } else {
    const res = await q(
      `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
       VALUES ('Goal Configuration', '/goal-config', 'bi-sliders', ?, 16, 'GoalConfigPage.jsx', 1)`,
      [parentId]
    );
    goalConfigId = res.insertId;
    console.log('✔ Inserted /goal-config menu item (ID=%d)', goalConfigId);
  }

  // 4. Fetch ALL roles in the database and grant permissions for both new menu items
  const roles = await q("SELECT role_id FROM roles");
  const roleIds = roles.map(r => r.role_id);
  console.log('Assigning menu permissions to roles:', roleIds);

  for (const menuItemId of [pillarsId, goalConfigId]) {
    for (const roleId of roleIds) {
      const existing = await q("SELECT id FROM role_permissions WHERE role_id = ? AND menu_item_id = ? LIMIT 1", [roleId, menuItemId]);
      if (existing.length > 0) {
        await q(
          "UPDATE role_permissions SET can_view = 1, can_create = 1, can_edit = 1, can_delete = 1 WHERE id = ?",
          [existing[0].id]
        );
      } else {
        await q(
          "INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)",
          [roleId, menuItemId]
        );
      }
    }
  }

  console.log('✅ Menu items and Role Permissions successfully configured!');
  process.exit(0);
}

setup().catch(err => {
  console.error('❌ Error updating menu list & permissions:', err);
  process.exit(1);
});
