/**
 * Migration: Insert "Executive Report" menu item + grant role permissions
 * Run: node migrations/add_executive_report_menu.js
 */
const con = require('../models/db');

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function run() {
  console.log('Starting Executive Report menu migration...');

  try {
    // 1. Check if menu item already exists
    const existing = await q("SELECT id FROM menu_items WHERE path = '/reports/executive' LIMIT 1");
    let menuItemId;

    if (existing.length > 0) {
      menuItemId = existing[0].id;
      console.log('Menu item /reports/executive already exists (id=%d). Skipping insert.', menuItemId);
    } else {
      // 2. Insert new menu item
      const result = await q(
        `INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active)
         VALUES (?, ?, ?, NULL, 65, ?, 1)`,
        ['Executive Report', '/reports/executive', 'bi bi-bar-chart-steps', 'ExecutiveReportPage.jsx']
      );
      menuItemId = result.insertId;
      console.log('✔ Inserted menu item /reports/executive with id=%d', menuItemId);
    }

    // 3. Grant permissions to relevant roles:
    // Admin(1), CEO(2), Deputy CEO(3), Director(4), Team Leader(5), Executive Planning(29)
    const roleIds = [1, 2, 3, 4, 5, 29];
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

    console.log('\n✅ Migration complete. The "Executive Report" menu item and permissions are now configured.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    process.exit(0);
  }
}

run();
