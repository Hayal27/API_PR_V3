-- Add hierarchy_level column to roles table
-- This allows dynamic role hierarchy management

ALTER TABLE `roles` 
ADD COLUMN `hierarchy_level` INT(11) DEFAULT NULL AFTER `role_name`,
ADD COLUMN `description` VARCHAR(255) DEFAULT NULL AFTER `hierarchy_level`;

-- Update existing roles with hierarchy levels
-- Lower number = higher authority
UPDATE `roles` SET `hierarchy_level` = 1, `description` = 'System Administrator' WHERE `role_id` = 1;
UPDATE `roles` SET `hierarchy_level` = 2, `description` = 'Chief Executive Officer' WHERE `role_id` = 29;
UPDATE `roles` SET `hierarchy_level` = 3, `description` = 'Deputy Chief Executive Officer' WHERE `role_id` = 2;
UPDATE `roles` SET `hierarchy_level` = 4, `description` = 'Strategic Advisory Role' WHERE `role_id` = 32;
UPDATE `roles` SET `hierarchy_level` = 5, `description` = 'General Management' WHERE `role_id` = 3;
UPDATE `roles` SET `hierarchy_level` = 6, `description` = 'Information Technology Directorate' WHERE `role_id` = 5;
UPDATE `roles` SET `hierarchy_level` = 6, `description` = 'Construction Directorate' WHERE `role_id` = 30;
UPDATE `roles` SET `hierarchy_level` = 6, `description` = 'Corporation Directorate' WHERE `role_id` = 31;
UPDATE `roles` SET `hierarchy_level` = 7, `description` = 'Department Head' WHERE `role_id` = 6;
UPDATE `roles` SET `hierarchy_level` = 8, `description` = 'Section Head' WHERE `role_id` = 7;
UPDATE `roles` SET `hierarchy_level` = 9, `description` = 'Senior Expert' WHERE `role_id` = 28;
UPDATE `roles` SET `hierarchy_level` = 10, `description` = 'Expert' WHERE `role_id` = 8;
UPDATE `roles` SET `hierarchy_level` = 11, `description` = 'Planning and Reporting' WHERE `role_id` = 9;

-- Create index for better query performance
CREATE INDEX `idx_hierarchy_level` ON `roles` (`hierarchy_level`);
