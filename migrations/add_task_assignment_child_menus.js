/**
 * Migration: Add child menu items under "Task Assignment" for each tab
 * Tabs: Assign New Task, Sent Tasks, Received Tasks, Subordinates
 * Run: node migrations\add_task_assignment_child_menus.js
 */
const con = require('../models/db');

async function run() {
  console.log('Starting Task Assignment child menus migration...');

  // 1. Find the parent Task Assignment menu item
  const parentRows = await q("SELECT id, name FROM menu_items WHERE path = '/tasks/assignment' LIMIT 1");
  if (!parentRows.length) {
    console.error('❌ Could not find /tasks/assignment parent menu item. Aborting.');
    process.exit(1);
  }
  const parentId = parentRows[0].id;
  console.log(`✔ Found parent "Task Assignment" (id=${parentId})`);

  // 2. Define the child menu items
  const childMenus = [
    { name: 'Assign New Task',  path: '/tasks/assignment/assign',   icon: 'bi bi-plus-circle',    sort_order: 1, file_name: 'TaskAssignmentPage.jsx' },
    { name: 'Sent Tasks',       path: '/tasks/assignment/sent',     icon: 'bi bi-send',            sort_order: 2, file_name: 'TaskAssignmentPage.jsx' },
    { name: 'Received Tasks',   path: '/tasks/assignment/received', icon: 'bi bi-inbox',           sort_order: 3, file_name: 'TaskAssignmentPage.jsx' },
    { name: 'Subordinates',     path: '/tasks/assignment/subordinates', icon: 'bi bi-people',      sort_order: 4, file_name: 'TaskAssignmentPage.jsx' },
  ];

  // 3. Get all roles
  const roles = await q('SELECT role_id FROM roles');
  const roleIds = roles.map(r => r.role_id);
  console.log(`Found ${roleIds.length} roles: [${roleIds.join(', ')}]`);

  for (const menu of childMenus) {
    // Check if it already exists
    const existing = await q('SELECT id FROM menu_items WHERE path = ? LIMIT 1', [menu.path]);
    let menuItemId;

    if (existing.length > 0) {
      menuItemId = existing[0].id;
      console.log(`  ↩ "${menu.name}" already exists (id=${menuItemId}). Skipping insert.`);
    } else {
      const result = await q(
        `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [menu.name, menu.path, menu.icon, parentId, menu.sort_order, menu.file_name]
      );
      menuItemId = result.insertId;
      console.log(`  ✔ Inserted "${menu.name}" (id=${menuItemId}, path=${menu.path})`);
    }

    // Grant permissions to ALL roles
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
        console.log(`    ↩ Updated permissions for role_id=${roleId}`);
      } else {
        await q(
          `INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
           VALUES (?, ?, 1, 1, 1, 1)`,
          [roleId, menuItemId]
        );
        console.log(`    ✔ Granted full permissions to role_id=${roleId}`);
      }
    }
  }

  console.log('\n✅ Migration complete!');
  console.log('   Child menus added under "Task Assignment":');
  childMenus.forEach(m => console.log(`   - ${m.name} → ${m.path}`));
  console.log('   All roles have been granted full permissions.');
  console.log('   Clear browser localStorage/cache to see changes immediately.');
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
