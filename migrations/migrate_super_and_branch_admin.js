// backend/migrations/migrate_super_and_branch_admin.js
const con = require('../models/db');

console.log('🚀 Starting Multi-Branch Independent Planning & Role Migration...');

const runQuery = (sql, params = []) => new Promise((resolve, reject) => {
  con.query(sql, params, (err, res) => {
    if (err) return reject(err);
    resolve(res);
  });
});

async function migrate() {
  try {
    // 1. Ensure 'Super Admin' role exists
    const [superAdminRole] = await runQuery("SELECT * FROM roles WHERE role_name = 'Super Admin' OR role_name = 'super admin'");
    let superAdminRoleId;
    if (!superAdminRole) {
      const res = await runQuery(
        "INSERT INTO roles (role_name, hierarchy_level, description, status) VALUES ('Super Admin', 0, 'Central / Head Office Super Administrator - Full Global Access', 1)"
      );
      superAdminRoleId = res.insertId;
      console.log(`✅ Created 'Super Admin' role with ID ${superAdminRoleId}`);
    } else {
      superAdminRoleId = superAdminRole.role_id;
      console.log(`ℹ️ 'Super Admin' role already exists with ID ${superAdminRoleId}`);
    }

    // 2. Ensure 'Branch Admin' role exists
    const [branchAdminRole] = await runQuery("SELECT * FROM roles WHERE role_name = 'Branch Admin' OR role_name = 'branch admin'");
    let branchAdminRoleId;
    if (!branchAdminRole) {
      const res = await runQuery(
        "INSERT INTO roles (role_name, hierarchy_level, description, status) VALUES ('Branch Admin', 5, 'Branch Administrator - Full management of branch org structure, employees, plans, and tasks', 1)"
      );
      branchAdminRoleId = res.insertId;
      console.log(`✅ Created 'Branch Admin' role with ID ${branchAdminRoleId}`);
    } else {
      branchAdminRoleId = branchAdminRole.role_id;
      console.log(`ℹ️ 'Branch Admin' role already exists with ID ${branchAdminRoleId}`);
    }

    // 3. Add branch_id to users if not present
    const userCols = await runQuery("SHOW COLUMNS FROM users LIKE 'branch_id'");
    if (userCols.length === 0) {
      await runQuery("ALTER TABLE users ADD COLUMN branch_id INT NULL DEFAULT 1 AFTER employee_id");
      console.log("✅ Added branch_id column to users table");
    } else {
      console.log("ℹ️ branch_id column already exists in users table");
    }

    // Backfill user branch_id from employees table where available
    await runQuery(`
      UPDATE users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      SET u.branch_id = COALESCE(e.branch_id, 1)
      WHERE u.branch_id IS NULL OR u.branch_id = 0
    `);
    console.log("✅ Backfilled users.branch_id from employees table");

    // 4. Add branch_id to goals if not present
    const goalCols = await runQuery("SHOW COLUMNS FROM goals LIKE 'branch_id'");
    if (goalCols.length === 0) {
      await runQuery("ALTER TABLE goals ADD COLUMN branch_id INT NULL DEFAULT 1");
      console.log("✅ Added branch_id column to goals table");
    } else {
      console.log("ℹ️ branch_id column already exists in goals table");
    }

    // 5. Add branch_id to objectives if not present
    const objCols = await runQuery("SHOW COLUMNS FROM objectives LIKE 'branch_id'");
    if (objCols.length === 0) {
      await runQuery("ALTER TABLE objectives ADD COLUMN branch_id INT NULL DEFAULT 1");
      console.log("✅ Added branch_id column to objectives table");
    } else {
      console.log("ℹ️ branch_id column already exists in objectives table");
    }

    // 6. Add branch_id to specific_objectives if not present
    const specCols = await runQuery("SHOW COLUMNS FROM specific_objectives LIKE 'branch_id'");
    if (specCols.length === 0) {
      await runQuery("ALTER TABLE specific_objectives ADD COLUMN branch_id INT NULL DEFAULT 1");
      console.log("✅ Added branch_id column to specific_objectives table");
    } else {
      console.log("ℹ️ branch_id column already exists in specific_objectives table");
    }

    // 7. Add branch_id to plan_pillars if not present
    const pillarCols = await runQuery("SHOW COLUMNS FROM plan_pillars LIKE 'branch_id'");
    if (pillarCols.length === 0) {
      await runQuery("ALTER TABLE plan_pillars ADD COLUMN branch_id INT NULL DEFAULT 1");
      console.log("✅ Added branch_id column to plan_pillars table");
    } else {
      console.log("ℹ️ branch_id column already exists in plan_pillars table");
    }

    // 8. Backfill branch_id in goals, objectives, and specific_objectives from user's branch
    await runQuery(`
      UPDATE goals g
      LEFT JOIN users u ON g.user_id = u.user_id
      SET g.branch_id = COALESCE(u.branch_id, 1)
      WHERE g.branch_id IS NULL OR g.branch_id = 0
    `);
    await runQuery(`
      UPDATE objectives o
      LEFT JOIN goals g ON o.goal_id = g.goal_id
      SET o.branch_id = COALESCE(g.branch_id, 1)
      WHERE o.branch_id IS NULL OR o.branch_id = 0
    `);
    await runQuery(`
      UPDATE specific_objectives so
      LEFT JOIN objectives o ON so.objective_id = o.objective_id
      SET so.branch_id = COALESCE(o.branch_id, 1)
      WHERE so.branch_id IS NULL OR so.branch_id = 0
    `);
    console.log("✅ Backfilled existing planning steps with branch_id");

    // 9. Grant role permissions to Super Admin and Branch Admin
    const menuItems = await runQuery("SELECT id, path FROM menu_items WHERE is_active = 1");
    if (menuItems.length > 0) {
      // Super Admin gets all menu items
      for (const mi of menuItems) {
        await runQuery(`
          INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
          VALUES (?, ?, 1, 1, 1, 1)
          ON DUPLICATE KEY UPDATE can_view = 1, can_create = 1, can_edit = 1, can_delete = 1
        `, [superAdminRoleId, mi.id]);
      }
      console.log(`✅ Granted all permissions to Super Admin (role_id: ${superAdminRoleId})`);

      // Branch Admin gets operational menu items (excludes global branch creation if separate)
      for (const mi of menuItems) {
        const isBranchSpecific = !['/admin/branches', '/admin/system-settings', '/admin/logs'].includes(mi.path);
        await runQuery(`
          INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE can_view = VALUES(can_view), can_create = VALUES(can_create), can_edit = VALUES(can_edit), can_delete = VALUES(can_delete)
        `, [branchAdminRoleId, mi.id, 1, isBranchSpecific ? 1 : 0, isBranchSpecific ? 1 : 0, isBranchSpecific ? 1 : 0]);
      }
      console.log(`✅ Granted operational permissions to Branch Admin (role_id: ${branchAdminRoleId})`);
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
