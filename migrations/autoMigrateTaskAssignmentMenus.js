const con = require('../models/db');

async function autoMigrateTaskAssignmentMenus() {
  try {
    console.log('🔄 [Auto-Migration] Setting up Task Assignment independent menu items under Task Management...');

    // 1. Find Task Management parent menu item (name='Task Management' or path='#')
    let parentRows = await q("SELECT id FROM menu_items WHERE name = 'Task Management' OR path = '#' AND sort_order = 15 LIMIT 1");
    if (!parentRows.length) {
      parentRows = await q("SELECT id FROM menu_items WHERE id = 70 LIMIT 1");
    }
    const taskManagementId = parentRows.length ? parentRows[0].id : 70;
    console.log(`✔ Found "Task Management" parent (id=${taskManagementId})`);

    // 2. Deactivate the old single "Task Assignment" menu item (id=71) if present
    await q("UPDATE menu_items SET is_active = 0 WHERE path = '/tasks/assignment'");

    // 3. Define the 4 independent child menu items under Task Management
    const childMenus = [
      { name: 'Assign New Task',  path: '/tasks/assignment/assign',       icon: 'bi bi-plus-circle', sort_order: 1 },
      { name: 'Sent Tasks',       path: '/tasks/assignment/sent',         icon: 'bi bi-send',        sort_order: 2 },
      { name: 'Received Tasks',   path: '/tasks/assignment/received',     icon: 'bi bi-inbox',       sort_order: 3 },
      { name: 'Subordinates',     path: '/tasks/assignment/subordinates', icon: 'bi bi-people',      sort_order: 4 },
    ];

    // Get all roles
    const roles = await q('SELECT role_id FROM roles');
    const roleIds = roles.map(r => r.role_id);

    for (const menu of childMenus) {
      let menuItemId;
      const existing = await q('SELECT id FROM menu_items WHERE path = ? LIMIT 1', [menu.path]);

      if (existing.length > 0) {
        menuItemId = existing[0].id;
        await q(
          'UPDATE menu_items SET name = ?, parent_id = ?, icon = ?, sort_order = ?, file_name = ?, is_active = 1 WHERE id = ?',
          [menu.name, taskManagementId, menu.icon, menu.sort_order, 'TaskAssignment.jsx', menuItemId]
        );
        console.log(`  ✔ Updated menu item "${menu.name}" (id=${menuItemId})`);
      } else {
        const result = await q(
          `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
           VALUES (?, ?, ?, ?, ?, 'TaskAssignment.jsx', 1)`,
          [menu.name, menu.path, menu.icon, taskManagementId, menu.sort_order]
        );
        menuItemId = result.insertId;
        console.log(`  ✔ Inserted menu item "${menu.name}" (id=${menuItemId})`);
      }

      // Grant permissions for all roles
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
        } else {
          await q(
            `INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
             VALUES (?, ?, 1, 1, 1, 1)`,
            [roleId, menuItemId]
          );
        }
      }
    }

    console.log('✅ [Auto-Migration] All 4 independent Task menus are registered & permissions granted.');
  } catch (err) {
    console.error('⚠️ [Auto-Migration] Failed:', err.message);
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

module.exports = autoMigrateTaskAssignmentMenus;

if (require.main === module) {
  autoMigrateTaskAssignmentMenus().then(() => {
    console.log('Done executing migration script.');
    process.exit(0);
  }).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}
