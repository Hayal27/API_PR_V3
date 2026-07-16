-- Create audit_logs table for tracking permission changes and system actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Insert some sample audit log entries
INSERT INTO audit_logs (user_id, action, description, metadata, created_at) VALUES
(NULL, 'SYSTEM_START', 'Menu permissions system initialized', '{"version": "1.0.0"}', NOW() - INTERVAL 7 DAY),
(1, 'CREATE_ROLE', 'Created role: Test Manager', '{"role_id": 5, "role_name": "Test Manager"}', NOW() - INTERVAL 5 DAY),
(1, 'UPDATE_ROLE', 'Updated role: Staff', '{"role_id": 2, "role_name": "Staff", "status": 1}', NOW() - INTERVAL 3 DAY),
(1, 'BULK_GRANT', 'Granted all permissions to 2 roles for 5 menu items', '{"roleIds": [1, 2], "menuItemIds": [1, 2, 3, 4, 5]}', NOW() - INTERVAL 2 DAY),
(NULL, 'PERMISSION_UPDATE', 'Updated permissions for role Admin', '{"role_id": 1, "changes": 15}', NOW() - INTERVAL 1 DAY);

-- Create index for better performance on metadata queries
CREATE INDEX idx_audit_metadata ON audit_logs ((JSON_EXTRACT(metadata, '$.role_id')));

-- Show table structure
DESCRIBE audit_logs;
