-- Password Reset OTP Table for Forgot Password Feature
-- This table stores OTP codes sent to users for password reset

CREATE TABLE IF NOT EXISTS `password_reset_otp` (
  `otp_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `attempts` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  PRIMARY KEY (`otp_id`),
  KEY `user_id` (`user_id`),
  KEY `email` (`email`),
  KEY `otp_code` (`otp_code`),
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add password_changed_at column to users table if it doesn't exist
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `password_changed_at` datetime DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `last_password_change` datetime DEFAULT NULL;

-- Create index for faster OTP lookups
CREATE INDEX IF NOT EXISTS `idx_otp_user_email` ON `password_reset_otp` (`user_id`, `email`);
CREATE INDEX IF NOT EXISTS `idx_otp_expires` ON `password_reset_otp` (`expires_at`);
