-- Create approval workflow history table
CREATE TABLE `approval_workflow_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) NOT NULL,
  `approver_id` int(11) NOT NULL,
  `approver_name` varchar(255) NOT NULL,
  `approver_role` varchar(100) NOT NULL,
  `status` enum('Pending','Approved','Declined') NOT NULL,
  `comment` text DEFAULT NULL,
  `action_date` datetime NOT NULL DEFAULT current_timestamp(),
  `step_number` int(11) NOT NULL,
  `is_current_step` tinyint(1) DEFAULT 0,
  `created_by_user_id` int(11) NOT NULL,
  `created_by_name` varchar(255) NOT NULL,
  PRIMARY KEY (`history_id`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_approver_id` (`approver_id`),
  KEY `idx_created_by_user_id` (`created_by_user_id`),
  KEY `idx_action_date` (`action_date`),
  CONSTRAINT `fk_approval_history_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`plan_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_approval_history_approver` FOREIGN KEY (`approver_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_approval_history_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add indexes for better performance
CREATE INDEX `idx_plan_status` ON `approval_workflow_history` (`plan_id`, `status`);
CREATE INDEX `idx_creator_plan` ON `approval_workflow_history` (`created_by_user_id`, `plan_id`);
