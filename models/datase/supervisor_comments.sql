-- Create supervisor comments table for plan supervision and collaboration
CREATE TABLE `supervisor_comments` (
  `comment_id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_comment_id` int(11) DEFAULT NULL,
  `comment_text` text NOT NULL,
  `comment_type` enum('comment', 'reply') NOT NULL DEFAULT 'comment',
  `is_edited` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`comment_id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_comment_id` (`parent_comment_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `supervisor_comments_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`) ON DELETE CASCADE,
  CONSTRAINT `supervisor_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `supervisor_comments_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `supervisor_comments` (`comment_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add indexes for better performance
CREATE INDEX `idx_plan_user` ON `supervisor_comments` (`plan_id`, `user_id`);
CREATE INDEX `idx_comment_type` ON `supervisor_comments` (`comment_type`);
