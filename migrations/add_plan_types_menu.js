/**
 * Migration: Insert Plan Types Manager menu item + grant role permissions
 * Run: node migrations\add_plan_types_menu.js
 */
const con = require('../models/db');

async function run() {
  console.log('Starting Plan Types menu migration...');

  // 1. Check if menu item already exists
  const existing = await q("SELECT id FROM menu_items WHERE path = '/plan-types' LIMIT 1");
  let menuItemId;

  if (existing.length > 0) {
    menuItemId = existing[0].id;
    console.log('Menu item /plan-types already exists (id=%d). Skipping insert.', menuItemId);
  } else {
    // 2. Insert new menu item
    const result = await q(
      `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
       VALUES (?, ?, ?, NULL, 90, ?, 1)`,
      ['Plan Types', '/plan-types', 'bi bi-tags', 'PlanTypesManager.jsx']
    );
    menuItemId = result.insertId;
    console.log('✔ Inserted menu item /plan-types with id=%d', menuItemId);
  }

  // 3. Grant permissions to Admin(1), CEO(2), Deputy CEO(29)
  const roleIds = [1, 2, 29];
  for (const roleId of roleIds) {
    const perm = await q(
      'SELECT id FROM role_permissions WHERE role_id = ? AND menu_item_id = ? LIMIT 1',
      [roleId, menuItemId]
    );
    if (perm.length > 0) {
      console.log('  Permission for role_id=%d already exists. Skipping.', roleId);
    } else {
      await q(
        `INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
         VALUES (?, ?, 1, 1, 1, 1)`,
        [roleId, menuItemId]
      );
      console.log('  ✔ Granted full permissions to role_id=%d', roleId);
    }
  }

  console.log('\n✅ Migration complete. The "Plan Types" menu item is now available.');
  console.log('   Path: /plan-types');
  console.log('   Visible to: Admin, CEO, Deputy CEO');
  console.log('   Clear browser localStorage cache to see it in the sidebar immediately.');
  process.exit(0);
}

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(Array.isArray(result) ? result : [result]);
    });
  });
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
