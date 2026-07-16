-- ============================================================================
-- Task Management System Tables
-- Supports: Task Assignment, Task Management, Daily Task Management
-- ============================================================================

-- Table for Task Assignments (between users)
CREATE TABLE IF NOT EXISTS `task_assignments` (
  `assignment_id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `assigned_by` INT(11) NOT NULL COMMENT 'User who assigned the task',
  `assigned_to` INT(11) NOT NULL COMMENT 'User who is assigned the task',
  `priority` ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `status` ENUM('pending','in_progress','completed','confirmed','rejected') NOT NULL DEFAULT 'pending',
  `due_date` DATETIME DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'general',
  `attachment` VARCHAR(255) DEFAULT NULL,
  `completion_note` TEXT DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,
  `confirmed_at` DATETIME DEFAULT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`),
  KEY `idx_assigned_by` (`assigned_by`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_status` (`status`),
  KEY `idx_due_date` (`due_date`),
  CONSTRAINT `fk_assignment_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_assignment_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for Daily Tasks (personal daily office tasks)
CREATE TABLE IF NOT EXISTS `daily_tasks` (
  `daily_task_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `priority` ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  `status` ENUM('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  `task_date` DATE NOT NULL,
  `start_time` TIME DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'general',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`daily_task_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_task_date` (`task_date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_daily_task_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
