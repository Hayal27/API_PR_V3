-- 1. Insert Parent Menu: Task Management
INSERT INTO menu_items (name, path, icon, parent_id, sort_order, is_active)
VALUES ('Task Management', '#', 'bi-list-check', NULL, 15, 1);

-- Get the inserted parent ID
SET @task_parent_id = LAST_INSERT_ID();

-- 2. Insert Child Menus
INSERT INTO menu_items (name, path, icon, parent_id, sort_order, is_active)
VALUES ('Task Assignment', '/tasks/assignment', 'bi-person-plus', @task_parent_id, 1, 1);
SET @assignment_id = LAST_INSERT_ID();

INSERT INTO menu_items (name, path, icon, parent_id, sort_order, is_active)
VALUES ('My Tasks', '/tasks/management', 'bi-journal-check', @task_parent_id, 2, 1);
SET @management_id = LAST_INSERT_ID();

INSERT INTO menu_items (name, path, icon, parent_id, sort_order, is_active)
VALUES ('Daily Planner', '/tasks/daily', 'bi-calendar-event', @task_parent_id, 3, 1);
SET @daily_id = LAST_INSERT_ID();

-- 3. Grant Permissions to all Active Roles
-- We will grant view, create, edit, delete (1,1,1,1) for simplicity to all active roles for these 4 new menu items

-- For Parent Menu
INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
SELECT role_id, @task_parent_id, 1, 1, 1, 1 FROM roles WHERE status = 1;

-- For Task Assignment
INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
SELECT role_id, @assignment_id, 1, 1, 1, 1 FROM roles WHERE status = 1;

-- For My Tasks
INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
SELECT role_id, @management_id, 1, 1, 1, 1 FROM roles WHERE status = 1;

-- For Daily Planner
INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
SELECT role_id, @daily_id, 1, 1, 1, 1 FROM roles WHERE status = 1;
