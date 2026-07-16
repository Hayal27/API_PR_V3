-- =====================================================
-- CHAT SYSTEM TABLES
-- Enterprise-level messaging and conversation system
-- =====================================================

-- --------------------------------------------------------
-- Table structure for table `conversations`
-- Updated with additional fields for enterprise chat
-- --------------------------------------------------------

ALTER TABLE `conversations` ADD COLUMN IF NOT EXISTS `conversation_type` ENUM('direct', 'group', 'channel') DEFAULT 'direct' AFTER `title`;
ALTER TABLE `conversations` ADD COLUMN IF NOT EXISTS `created_by` INT(11) DEFAULT NULL AFTER `conversation_type`;
ALTER TABLE `conversations` ADD COLUMN IF NOT EXISTS `is_archived` TINYINT(1) DEFAULT 0 AFTER `created_by`;
ALTER TABLE `conversations` ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `is_archived`;

-- --------------------------------------------------------
-- Table structure for table `chat_participants`
-- Tracks users in conversations
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `chat_participants` (
  `participant_id` INT(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_read_at` TIMESTAMP NULL DEFAULT NULL,
  `is_admin` TINYINT(1) DEFAULT 0,
  `is_muted` TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`participant_id`),
  UNIQUE KEY `unique_conversation_user` (`conversation_id`, `user_id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`conversation_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `messages`
-- Updated with additional fields for enterprise messaging
-- --------------------------------------------------------

ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `message_type` ENUM('text', 'image', 'file', 'system', 'plan') DEFAULT 'text' AFTER `content`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `file_path` VARCHAR(500) DEFAULT NULL AFTER `message_type`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `file_name` VARCHAR(255) DEFAULT NULL AFTER `file_path`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `metadata` TEXT DEFAULT NULL AFTER `file_name`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `is_edited` TINYINT(1) DEFAULT 0 AFTER `metadata`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `edited_at` TIMESTAMP NULL DEFAULT NULL AFTER `is_edited`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `is_deleted` TINYINT(1) DEFAULT 0 AFTER `edited_at`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `is_deleted`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `parent_message_id` INT(11) DEFAULT NULL AFTER `deleted_at`;
ALTER TABLE `messages` ADD COLUMN IF NOT EXISTS `reaction_count` INT(11) DEFAULT 0 AFTER `parent_message_id`;

-- --------------------------------------------------------
-- Table structure for table `message_reactions`
-- Emoji reactions on messages
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `message_reactions` (
  `reaction_id` INT(11) NOT NULL AUTO_INCREMENT,
  `message_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `emoji` VARCHAR(10) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reaction_id`),
  UNIQUE KEY `unique_user_message_emoji` (`message_id`, `user_id`, `emoji`),
  FOREIGN KEY (`message_id`) REFERENCES `messages`(`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `message_read_receipts`
-- Track message read status
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `message_read_receipts` (
  `receipt_id` INT(11) NOT NULL AUTO_INCREMENT,
  `message_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`receipt_id`),
  UNIQUE KEY `unique_message_user` (`message_id`, `user_id`),
  FOREIGN KEY (`message_id`) REFERENCES `messages`(`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `chat_settings`
-- User chat preferences
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `chat_settings` (
  `setting_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `notification_enabled` TINYINT(1) DEFAULT 1,
  `sound_enabled` TINYINT(1) DEFAULT 1,
  `desktop_notifications` TINYINT(1) DEFAULT 1,
  `message_preview` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `unique_user` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Indexes for better performance
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS `idx_messages_conversation` ON `messages`(`conversation_id`);
CREATE INDEX IF NOT EXISTS `idx_messages_sender` ON `messages`(`sender_id`);
CREATE INDEX IF NOT EXISTS `idx_messages_sent_at` ON `messages`(`sent_at`);
CREATE INDEX IF NOT EXISTS `idx_chat_participants_user` ON `chat_participants`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_chat_participants_conversation` ON `chat_participants`(`conversation_id`);
CREATE INDEX IF NOT EXISTS `idx_message_reactions_message` ON `message_reactions`(`message_id`);
CREATE INDEX IF NOT EXISTS `idx_message_reactions_user` ON `message_reactions`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_message_read_receipts_message` ON `message_read_receipts`(`message_id`);
CREATE INDEX IF NOT EXISTS `idx_message_read_receipts_user` ON `message_read_receipts`(`user_id`);

-- --------------------------------------------------------
-- Table structure for table `user_presence`
-- Track active users and their online status
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `user_presence` (
  `presence_id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `is_online` TINYINT(1) DEFAULT 0,
  `last_seen` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` ENUM('online', 'away', 'offline', 'do_not_disturb') DEFAULT 'offline',
  PRIMARY KEY (`presence_id`),
  UNIQUE KEY `unique_user_presence` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `message_mentions`
-- Track @mentions in messages
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `message_mentions` (
  `mention_id` INT(11) NOT NULL AUTO_INCREMENT,
  `message_id` INT(11) NOT NULL,
  `mentioned_user_id` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`mention_id`),
  FOREIGN KEY (`message_id`) REFERENCES `messages`(`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`mentioned_user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `message_attachments`
-- Store attachment metadata
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `message_attachments` (
  `attachment_id` INT(11) NOT NULL AUTO_INCREMENT,
  `message_id` INT(11) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_type` VARCHAR(50) NOT NULL,
  `file_size` BIGINT DEFAULT 0,
  `uploaded_by` INT(11) NOT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attachment_id`),
  FOREIGN KEY (`message_id`) REFERENCES `messages`(`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `forwarded_messages`
-- Track forwarded messages
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `forwarded_messages` (
  `forward_id` INT(11) NOT NULL AUTO_INCREMENT,
  `original_message_id` INT(11) NOT NULL,
  `forwarded_message_id` INT(11) NOT NULL,
  `forwarded_by` INT(11) NOT NULL,
  `forwarded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`forward_id`),
  FOREIGN KEY (`original_message_id`) REFERENCES `messages`(`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`forwarded_message_id`) REFERENCES `messages`(`message_id`) ON DELETE CASCADE,
  FOREIGN KEY (`forwarded_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `organization_groups`
-- Organization-based group chats
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `organization_groups` (
  `group_id` INT(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` INT(11) NOT NULL,
  `organization_id` INT(11) DEFAULT NULL,
  `department_id` INT(11) DEFAULT NULL,
  `group_name` VARCHAR(255) NOT NULL,
  `group_description` TEXT,
  `group_icon` VARCHAR(500),
  `created_by` INT(11) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`group_id`),
  UNIQUE KEY `unique_conversation_group` (`conversation_id`),
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`conversation_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Indexes for new tables
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS `idx_user_presence_online` ON `user_presence`(`is_online`);
CREATE INDEX IF NOT EXISTS `idx_user_presence_status` ON `user_presence`(`status`);
CREATE INDEX IF NOT EXISTS `idx_message_mentions_message` ON `message_mentions`(`message_id`);
CREATE INDEX IF NOT EXISTS `idx_message_mentions_user` ON `message_mentions`(`mentioned_user_id`);
CREATE INDEX IF NOT EXISTS `idx_message_attachments_message` ON `message_attachments`(`message_id`);
CREATE INDEX IF NOT EXISTS `idx_forwarded_messages_original` ON `forwarded_messages`(`original_message_id`);
CREATE INDEX IF NOT EXISTS `idx_forwarded_messages_forwarded` ON `forwarded_messages`(`forwarded_message_id`);
CREATE INDEX IF NOT EXISTS `idx_organization_groups_conversation` ON `organization_groups`(`conversation_id`);
