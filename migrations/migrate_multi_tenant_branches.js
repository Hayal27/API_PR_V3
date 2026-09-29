const con = require('../models/db');
const util = require('util');

const query = util.promisify(con.query).bind(con);

async function migrateMultiTenantBranches() {
    console.log('🚀 [Migration] Starting Multi-Tenant & Multi-Branch Architecture Migration...');

    try {
        // 1. Create `branches` table
        console.log('📦 Step 1: Creating `branches` table...');
        await query(`
            CREATE TABLE IF NOT EXISTS \`branches\` (
                \`branch_id\` INT(11) NOT NULL AUTO_INCREMENT,
                \`code\` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique branch code',
                \`name\` VARCHAR(255) NOT NULL COMMENT 'Branch Name (e.g. Addis Ababa City Administration)',
                \`name_amharic\` VARCHAR(255) NOT NULL COMMENT 'የቅርንጫፍ ስም',
                \`tier_level\` ENUM('federal', 'regional', 'city_admin', 'sub_city', 'zone', 'woreda') NOT NULL DEFAULT 'federal',
                \`parent_branch_id\` INT(11) NULL COMMENT 'Parent branch ID in administrative hierarchy',
                \`head_employee_id\` INT(11) NULL COMMENT 'General Manager / Director of this branch',
                \`region\` VARCHAR(100) NULL,
                \`city\` VARCHAR(100) NULL,
                \`sub_city\` VARCHAR(100) NULL,
                \`woreda\` VARCHAR(100) NULL,
                \`address\` TEXT NULL,
                \`phone\` VARCHAR(50) NULL,
                \`email\` VARCHAR(100) NULL,
                \`is_head_office\` TINYINT(1) NOT NULL DEFAULT 0,
                \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
                \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`branch_id\`),
                INDEX \`idx_branches_tier\` (\`tier_level\`),
                INDEX \`idx_branches_parent\` (\`parent_branch_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('✔ `branches` table created or verified.');

        // 2. Seed Default Federal Head Office (branch_id = 1)
        console.log('🌱 Step 2: Seeding Federal Head Office & sample administrative hierarchy...');
        const existingHq = await query(`SELECT branch_id FROM branches WHERE branch_id = 1 OR code = 'HQ-FED-001' LIMIT 1`);
        if (existingHq.length === 0) {
            await query(`
                INSERT INTO \`branches\` (
                    \`branch_id\`, \`code\`, \`name\`, \`name_amharic\`, 
                    \`tier_level\`, \`parent_branch_id\`, \`region\`, \`city\`, 
                    \`address\`, \`phone\`, \`email\`, \`is_head_office\`, \`status\`
                ) VALUES (
                    1, 'HQ-FED-001', 'Federal Head Office', 'ማዕከላዊ ዋና መስሪያ ቤት',
                    'federal', NULL, 'Federal / Addis Ababa', 'Addis Ababa',
                    'Bole Sub-City, ICT Park Avenue', '+251-116-678-000', 'info@itpc.gov.et', 1, 'active'
                )
            `);
            console.log('✔ Federal Head Office (branch_id = 1) seeded successfully.');
        } else {
            console.log('✔ Federal Head Office already exists.');
        }

        // Seed City Administration & Sub-City branches for demonstration if table has only 1 row
        const branchCount = await query(`SELECT COUNT(*) as cnt FROM branches`);
        if (branchCount[0].cnt <= 1) {
            const sampleBranches = [
                {
                    id: 2, code: 'AAC-001', name: 'Addis Ababa City Administration',
                    name_amharic: 'የአዲስ አበባ ከተማ አስተዳደር', tier_level: 'city_admin',
                    parent: 1, region: 'Addis Ababa', city: 'Addis Ababa', is_hq: 0
                },
                {
                    id: 3, code: 'BOL-SC-001', name: 'Bole Sub-City Branch',
                    name_amharic: 'ቦሌ ክፍለ ከተማ ቅርንጫፍ', tier_level: 'sub_city',
                    parent: 2, region: 'Addis Ababa', city: 'Addis Ababa', sub_city: 'Bole', is_hq: 0
                },
                {
                    id: 4, code: 'KIR-SC-001', name: 'Kirkos Sub-City Branch',
                    name_amharic: 'ቂርቆስ ክፍለ ከተማ ቅርንጫፍ', tier_level: 'sub_city',
                    parent: 2, region: 'Addis Ababa', city: 'Addis Ababa', sub_city: 'Kirkos', is_hq: 0
                },
                {
                    id: 5, code: 'ORM-REG-001', name: 'Oromia Regional Branch',
                    name_amharic: 'የኦሮሚያ ክልል ቅርንጫፍ', tier_level: 'regional',
                    parent: 1, region: 'Oromia', city: 'Finfinne / Sheger', is_hq: 0
                },
                {
                    id: 6, code: 'AMH-REG-001', name: 'Amhara Regional Branch',
                    name_amharic: 'የአማራ ክልል ቅርንጫፍ', tier_level: 'regional',
                    parent: 1, region: 'Amhara', city: 'Bahir Dar', is_hq: 0
                },
                {
                    id: 7, code: 'DD-CA-001', name: 'Dire Dawa City Administration',
                    name_amharic: 'የድሬዳዋ ከተማ አስተዳደር', tier_level: 'city_admin',
                    parent: 1, region: 'Dire Dawa', city: 'Dire Dawa', is_hq: 0
                }
            ];

            for (const b of sampleBranches) {
                await query(`
                    INSERT IGNORE INTO \`branches\` (
                        \`branch_id\`, \`code\`, \`name\`, \`name_amharic\`, 
                        \`tier_level\`, \`parent_branch_id\`, \`region\`, \`city\`, \`sub_city\`, 
                        \`is_head_office\`, \`status\`
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
                `, [b.id, b.code, b.name, b.name_amharic, b.tier_level, b.parent, b.region, b.city, b.sub_city || null, b.is_hq]);
            }
            console.log('✔ Sample regional, city, and sub-city branches seeded.');
        }

        // Helper to check and add column safely
        async function ensureColumn(table, column, definition) {
            const cols = await query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
            `, [table, column]);

            if (cols.length === 0) {
                console.log(`  ➕ Adding column \`${column}\` to \`${table}\`...`);
                await query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
                console.log(`  ✔ Added \`${column}\` to \`${table}\`.`);
            } else {
                console.log(`  ✔ Column \`${column}\` already exists in \`${table}\`.`);
            }
        }

        // 3. Ensure `branch_id` column across key operational tables
        console.log('🔧 Step 3: Upgrading tables with `branch_id`...');
        await ensureColumn('organization_structure', 'branch_id', 'INT(11) NOT NULL DEFAULT 1 AFTER `type`');
        await ensureColumn('employees', 'branch_id', 'INT(11) NOT NULL DEFAULT 1 AFTER `department_id`');
        await ensureColumn('plans', 'branch_id', 'INT(11) NOT NULL DEFAULT 1 AFTER `user_id`');
        await ensureColumn('task_assignments', 'branch_id', 'INT(11) NOT NULL DEFAULT 1 AFTER `assigned_to`');
        await ensureColumn('reports', 'branch_id', 'INT(11) NOT NULL DEFAULT 1 AFTER `user_id`');

        // 4. Backfill any existing records to Federal Head Office (branch_id = 1)
        console.log('🔄 Step 4: Backfilling existing records to Federal Head Office (branch_id = 1)...');
        await query(`UPDATE \`organization_structure\` SET \`branch_id\` = 1 WHERE \`branch_id\` IS NULL OR \`branch_id\` = 0`);
        await query(`UPDATE \`employees\` SET \`branch_id\` = 1 WHERE \`branch_id\` IS NULL OR \`branch_id\` = 0`);
        await query(`UPDATE \`plans\` SET \`branch_id\` = 1 WHERE \`branch_id\` IS NULL OR \`branch_id\` = 0`);
        await query(`UPDATE \`task_assignments\` SET \`branch_id\` = 1 WHERE \`branch_id\` IS NULL OR \`branch_id\` = 0`);
        await query(`UPDATE \`reports\` SET \`branch_id\` = 1 WHERE \`branch_id\` IS NULL OR \`branch_id\` = 0`);
        console.log('✔ Backfilled existing data without any data loss.');

        // 5. Add index on `branch_id` for fast query filtering
        console.log('⚡ Step 5: Adding performance indexes...');
        const tablesToIndex = ['organization_structure', 'employees', 'plans', 'task_assignments', 'reports'];
        for (const tbl of tablesToIndex) {
            try {
                const indexes = await query(`SHOW INDEX FROM \`${tbl}\` WHERE Key_name = 'idx_${tbl}_branch'`);
                if (indexes.length === 0) {
                    await query(`CREATE INDEX \`idx_${tbl}_branch\` ON \`${tbl}\` (\`branch_id\`)`);
                    console.log(`  ✔ Index \`idx_${tbl}_branch\` added on \`${tbl}\`.`);
                }
            } catch (idxErr) {
                console.warn(`Notice indexing ${tbl}:`, idxErr.message);
            }
        }

        // 6. Register "Branches & Multi-Tenancy" menu item in `menu_items`
        console.log('📋 Step 6: Registering "Branches & Multi-Tenancy" navigation menu item...');
        
        // Find parent menu item for system administration
        let adminParent = await query(`SELECT id FROM menu_items WHERE path LIKE '%/admin%' AND parent_id IS NULL LIMIT 1`);
        let parentId = adminParent.length > 0 ? adminParent[0].id : null;

        if (!parentId) {
            // Check if there is an Organization Structure menu item to find its parent
            const orgMenu = await query(`SELECT parent_id FROM menu_items WHERE path = '/admin/org-structure' LIMIT 1`);
            if (orgMenu.length > 0) {
                parentId = orgMenu[0].parent_id;
            }
        }

        const menuPath = '/admin/branches';
        const existingMenu = await query(`SELECT id FROM menu_items WHERE path = ? LIMIT 1`, [menuPath]);

        let branchMenuItemId;
        if (existingMenu.length === 0) {
            const insertMenu = await query(`
                INSERT INTO \`menu_items\` (\`name\`, \`path\`, \`icon\`, \`parent_id\`, \`sort_order\`, \`file_name\`, \`is_active\`)
                VALUES ('Branches & Multi-Tenancy', ?, 'bi bi-buildings', ?, 3, 'BranchManagement.jsx', 1)
            `, [menuPath, parentId]);
            branchMenuItemId = insertMenu.insertId;
            console.log(`✔ Registered new menu item "Branches & Multi-Tenancy" (id=${branchMenuItemId}).`);
        } else {
            branchMenuItemId = existingMenu[0].id;
            await query(`UPDATE \`menu_items\` SET \`name\` = 'Branches & Multi-Tenancy', \`icon\` = 'bi bi-buildings', \`is_active\` = 1 WHERE \`id\` = ?`, [branchMenuItemId]);
            console.log(`✔ Menu item "Branches & Multi-Tenancy" already exists (id=${branchMenuItemId}).`);
        }

        // 7. Grant view permissions to Admin & Executive roles
        console.log('🔐 Step 7: Granting role permissions for branch management...');
        const allRoles = await query(`SELECT role_id FROM roles`);
        for (const r of allRoles) {
            const roleId = r.role_id;
            // Admin (1), Mesob Admin (33), CEO (29), Deputy CEO (2), Advisor (32) get view & edit permission
            const isManagerRole = [1, 33, 29, 2, 32, 5, 30, 31].includes(roleId);
            const canView = 1;
            const canEdit = isManagerRole ? 1 : 0;
            const canDelete = [1, 33].includes(roleId) ? 1 : 0;

            const perm = await query(`SELECT id FROM role_permissions WHERE role_id = ? AND menu_item_id = ?`, [roleId, branchMenuItemId]);
            if (perm.length === 0) {
                await query(`
                    INSERT INTO \`role_permissions\` (\`role_id\`, \`menu_item_id\`, \`can_view\`, \`can_edit\`, \`can_delete\`)
                    VALUES (?, ?, ?, ?, ?)
                `, [roleId, branchMenuItemId, canView, canEdit, canDelete]);
            } else {
                await query(`
                    UPDATE \`role_permissions\`
                    SET \`can_view\` = ?, \`can_edit\` = ?, \`can_delete\` = ?
                    WHERE \`id\` = ?
                `, [canView, canEdit, canDelete, perm[0].id]);
            }
        }
        console.log('✔ Role permissions granted.');

        console.log('\n🎉 [Migration Complete] Phase 1 Database Foundation is 100% SUCCESSFUL!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed with error:', error);
        process.exit(1);
    }
}

migrateMultiTenantBranches();
