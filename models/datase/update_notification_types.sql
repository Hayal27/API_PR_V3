-- Add 'meeting' and 'task' types to notifications enum
ALTER TABLE `notifications` 
MODIFY COLUMN `type` ENUM('comment', 'reply', 'status_change', 'deadline_alert', 'plan_update', 'meeting', 'task', 'message') NOT NULL;
