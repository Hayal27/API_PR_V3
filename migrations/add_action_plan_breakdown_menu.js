/**
 * Migration: Insert "Action Plan Breakdown" menu item + grant role permissions
 * Run: node migrations\add_action_plan_breakdown_menu.js
 */
const con = require('../models/db');

async function run() {
  console.log('Starting Action Plan Breakdown menu migration...');

  // 1. Find the parent menu item (My Plan Management) by path pattern
  let parentId = null;
  const parentCandidates = await q(
    "SELECT id, name, path FROM menu_items WHERE path LIKE '%View_myplan%' OR name LIKE '%My Plan%' LIMIT 5"
  );
  if (parentCandidates.length > 0) {
    parentId = parentCandidates[0].id;
    console.log('Found parent menu item: %s (id=%d)', parentCandidates[0].name, parentId);
  } else {
    console.log('No parent "My Plan Management" found — inserting as top-level menu item.');
  }

  // 2. Check if menu item already exists
  const existing = await q("SELECT id FROM menu_items WHERE path = '/plan/action-plan-breakdown' LIMIT 1");
  let menuItemId;

  if (existing.length > 0) {
    menuItemId = existing[0].id;
    console.log('Menu item /plan/action-plan-breakdown already exists (id=%d). Skipping insert.', menuItemId);
  } else {
    // 3. Insert new menu item
    const result = await q(
      `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
       VALUES (?, ?, ?, ?, 55, ?, 1)`,
      ['Action Plan Breakdown', '/plan/action-plan-breakdown', 'bi bi-diagram-3', parentId, 'ActionPlanBreakdownPage.jsx']
    );
    menuItemId = result.insertId;
    console.log('✔ Inserted menu item /plan/action-plan-breakdown with id=%d', menuItemId);
  }

  // 4. Grant permissions to all relevant roles:
  //    Admin(1), CEO(2), Deputy CEO(29), Team Leader(3), Staff(4)
  const roleIds = [1, 2, 3, 4, 29];
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

  console.log('\n✅ Migration complete. The "Action Plan Breakdown" menu item is now available.');
  console.log('   Path: /plan/action-plan-breakdown');
  console.log('   Visible to: Admin, CEO, Deputy CEO, Team Leader, Staff');
  console.log('   Parent: My Plan Management (if found)');
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
