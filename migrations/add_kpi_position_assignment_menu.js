/**
 * Migration: Insert "KPI Position Assignment" menu item + grant role permissions to all roles
 * Run: node migrations\add_kpi_position_assignment_menu.js
 */
const con = require('../models/db');

async function run() {
  console.log('🔄 [Migration] Starting KPI Position Assignment menu migration...');

  try {
    // 1. Find parent menu item (Planning & Strategy id=9 or My Plan Management id=45)
    let parentId = null;
    const parentCandidates = await q(
      "SELECT id, name FROM menu_items WHERE name LIKE '%Planning%' OR name LIKE '%My Plan%' LIMIT 1"
    );
    if (parentCandidates.length > 0) {
      parentId = parentCandidates[0].id;
      console.log(`✔ Found parent menu item: "${parentCandidates[0].name}" (id=${parentId})`);
    }

    // 2. Define the menu properties
    const menuName = 'KPI Position Assignment';
    const menuPath = '/kpi/my-assigned';
    const menuIcon = 'bi bi-award-fill';
    const fileName = 'KPIAssignmentPage.jsx';

    // Check if menu item already exists
    const existing = await q('SELECT id FROM menu_items WHERE path = ? LIMIT 1', [menuPath]);
    let menuItemId;

    if (existing.length > 0) {
      menuItemId = existing[0].id;
      await q(
        'UPDATE menu_items SET name = ?, parent_id = ?, icon = ?, sort_order = 18, file_name = ?, is_active = 1 WHERE id = ?',
        [menuName, parentId, menuIcon, fileName, menuItemId]
      );
      console.log(`  ✔ Updated menu item "${menuName}" (id=${menuItemId})`);
    } else {
      const result = await q(
        `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
         VALUES (?, ?, ?, ?, 18, ?, 1)`,
        [menuName, menuPath, menuIcon, parentId, fileName]
      );
      menuItemId = result.insertId;
      console.log(`  ✔ Inserted new menu item "${menuName}" (id=${menuItemId})`);
    }

    // 3. Grant full permissions (can_view=1, can_create=1, can_edit=1, can_delete=1) to ALL roles in roles table
    const roles = await q('SELECT role_id FROM roles');
    const roleIds = roles.map(r => r.role_id);
    console.log(`Found ${roleIds.length} roles: [${roleIds.join(', ')}]`);

    for (const roleId of roleIds) {
      const perm = await q(
        'SELECT id FROM role_permissions WHERE role_id = ? AND menu_item_id = ? LIMIT 1',
        [roleId, menuItemId]
      );
      if (perm.length > 0) {
        await q(
          'UPDATE role_permissions SET can_view=1, can_create=1, can_edit=1, can_delete=1 WHERE role_id=? AND menu_item_id=?',
          [roleId, menuItemId]
        );
        console.log(`  ✔ Updated permissions for role_id=${roleId}`);
      } else {
        await q(
          `INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
           VALUES (?, ?, 1, 1, 1, 1)`,
          [roleId, menuItemId]
        );
        console.log(`  ✔ Granted full permissions to role_id=${roleId}`);
      }
    }

    console.log('\n✅ Migration complete! The "KPI Position Assignment" menu item & permissions are ready.');
    return menuItemId;
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  }
}

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(Array.isArray(result) ? result : [result]);
    });
  });
}

module.exports = run;

if (require.main === module) {
  run().then(() => {
    console.log('Script execution finished.');
    process.exit(0);
  }).catch(() => process.exit(1));
}
