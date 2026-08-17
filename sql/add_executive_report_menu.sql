-- Migration Script: Add Executive Report Menu Item and Role Permissions
-- Description: Registers "/reports/executive" into `menu_items` and assigns full view/manage permissions to privileged roles.

-- 1. Insert Menu Item into `menu_items` table if it doesn't already exist
INSERT INTO `menu_items` (`name`, `path`, `icon`, `parent_id`, `sort_order`, `file_name`, `is_active`)
SELECT 'Executive Report', '/reports/executive', 'bi bi-bar-chart-steps', NULL, 65, 'ExecutiveReportPage.jsx', 1
WHERE NOT EXISTS (
    SELECT 1 FROM `menu_items` WHERE `path` = '/reports/executive'
);

-- 2. Grant permissions to privileged roles (1: Admin, 2: CEO, 3: Deputy CEO, 4: Director, 5: Team Leader, 29: Executive Planning)
INSERT INTO `role_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT r.role_id, m.id, 1, 1, 1, 1
FROM (SELECT id FROM `menu_items` WHERE `path` = '/reports/executive' LIMIT 1) m
CROSS JOIN (
    SELECT 1 AS role_id UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 29
) r
WHERE NOT EXISTS (
    SELECT 1 FROM `role_permissions` rp WHERE rp.role_id = r.role_id AND rp.menu_item_id = m.id
);

SELECT 'Executive Report menu item and permissions successfully migrated!' AS status;
