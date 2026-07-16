-- =====================================================
-- MEETING SCHEDULER TABLES
-- Enterprise-level meeting management system
-- =====================================================

-- --------------------------------------------------------
-- Table structure for table `meetings`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `meetings` (
  `meeting_id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `meeting_type` ENUM('one-on-one', 'team', 'department', 'company-wide', 'client', 'other') DEFAULT 'team',
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `location` VARCHAR(255),
  `meeting_link` VARCHAR(500),
  `status` ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `is_recurring` TINYINT(1) DEFAULT 0,
  `recurrence_pattern` VARCHAR(100),
  `created_by` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reminder_sent` TINYINT(1) DEFAULT 0,
  `agenda` TEXT,
  `notes` TEXT,
  PRIMARY KEY (`meeting_id`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `meeting_participants`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `meeting_participants` (
  `participant_id` INT(11) NOT NULL AUTO_INCREMENT,
  `meeting_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `role` ENUM('organizer', 'required', 'optional') DEFAULT 'required',
  `response_status` ENUM('pending', 'accepted', 'declined', 'tentative') DEFAULT 'pending',
  `attended` TINYINT(1) DEFAULT 0,
  `email_sent` TINYINT(1) DEFAULT 0,
  `reminder_sent` TINYINT(1) DEFAULT 0,
  `joined_at` DATETIME,
  `left_at` DATETIME,
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`participant_id`),
  UNIQUE KEY `unique_meeting_user` (`meeting_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_response_status` (`response_status`),
  FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`meeting_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `meeting_attachments`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `meeting_attachments` (
  `attachment_id` INT(11) NOT NULL AUTO_INCREMENT,
  `meeting_id` INT(11) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_type` VARCHAR(50),
  `file_size` BIGINT,
  `uploaded_by` INT(11) NOT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  KEY `idx_meeting_id` (`meeting_id`),
  FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`meeting_id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `meeting_reminders`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `meeting_reminders` (
  `reminder_id` INT(11) NOT NULL AUTO_INCREMENT,
  `meeting_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `reminder_time` DATETIME NOT NULL,
  `reminder_type` ENUM('email', 'notification', 'both') DEFAULT 'both',
  `sent` TINYINT(1) DEFAULT 0,
  `sent_at` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reminder_id`),
  KEY `idx_meeting_user` (`meeting_id`, `user_id`),
  KEY `idx_reminder_time` (`reminder_time`),
  FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`meeting_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `meeting_minutes`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `meeting_minutes` (
  `minute_id` INT(11) NOT NULL AUTO_INCREMENT,
  `meeting_id` INT(11) NOT NULL,
  `content` TEXT NOT NULL,
  `action_items` TEXT,
  `decisions` TEXT,
  `next_steps` TEXT,
  `recorded_by` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`minute_id`),
  KEY `idx_meeting_id` (`meeting_id`),
  FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`meeting_id`) ON DELETE CASCADE,
  FOREIGN KEY (`recorded_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Indexes for better performance
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS `idx_meetings_date_range` ON `meetings`(`start_time`, `end_time`);
CREATE INDEX IF NOT EXISTS `idx_meetings_created_by_status` ON `meetings`(`created_by`, `status`);
CREATE INDEX IF NOT EXISTS `idx_participants_meeting_response` ON `meeting_participants`(`meeting_id`, `response_status`);
CREATE INDEX IF NOT EXISTS `idx_reminders_pending` ON `meeting_reminders`(`sent`, `reminder_time`);
