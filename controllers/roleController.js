const db = require('../models/db');
const { logAudit } = require('../middleware/auditLogger');

// Helper to promisify db.query
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// Get all roles
const getRoles = async (req, res) => {
    try {
        const sql = 'SELECT * FROM roles WHERE status = 1 ORDER BY hierarchy_level ASC, role_name ASC';
        const roles = await query(sql);
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ message: 'Error fetching roles', error: error.message });
    }
};

// Get role hierarchy mapping
// Returns an object with role_id as key and hierarchy_level as value
const getRoleHierarchy = async (req, res) => {
    try {
        const sql = 'SELECT role_id, role_name, hierarchy_level, description FROM roles WHERE status = 1 ORDER BY hierarchy_level ASC';
        const roles = await query(sql);

        // Create hierarchy mapping object
        const hierarchyMap = {};
        roles.forEach(role => {
            hierarchyMap[role.role_id] = role.hierarchy_level;
        });

        res.json({
            hierarchyMap,
            roles: roles.map(r => ({
                role_id: r.role_id,
                role_name: r.role_name,
                hierarchy_level: r.hierarchy_level,
                description: r.description
            }))
        });
    } catch (error) {
        console.error('Error fetching role hierarchy:', error);
        res.status(500).json({ message: 'Error fetching role hierarchy', error: error.message });
    }
};

// Get available supervisors for a given role
// Returns employees who have higher authority (lower hierarchy level)
const getAvailableSupervisors = async (req, res) => {
    try {
        const { roleId, employeeId } = req.query;

        if (!roleId) {
            return res.status(400).json({ message: 'Role ID is required' });
        }

        // Get the hierarchy level of the selected role
        const roleData = await query(
            'SELECT hierarchy_level FROM roles WHERE role_id = ? AND status = 1',
            [roleId]
        );

        if (roleData.length === 0) {
            return res.status(404).json({ message: 'Role not found' });
        }

        const selectedRoleLevel = roleData[0].hierarchy_level;

        // Get all employees with roles that have higher authority (lower hierarchy level)
        // Exclude the current employee if updating
        let sql = `
      SELECT 
        e.employee_id,
        e.name,
        e.fname,
        e.lname,
        e.role_id,
        e.department_id,
        r.role_name,
        r.hierarchy_level,
        d.name as department_name
      FROM employees e
      INNER JOIN roles r ON e.role_id = r.role_id
      LEFT JOIN departments d ON e.department_id = d.department_id
      WHERE r.hierarchy_level < ? 
        AND r.status = 1
    `;

        const params = [selectedRoleLevel];

        // Exclude current employee if updating
        if (employeeId) {
            sql += ' AND e.employee_id != ?';
            params.push(employeeId);
        }

        sql += ' ORDER BY r.hierarchy_level ASC, e.name ASC';

        const supervisors = await query(sql, params);

        res.json(supervisors);
    } catch (error) {
        console.error('Error fetching available supervisors:', error);
        res.status(500).json({ message: 'Error fetching available supervisors', error: error.message });
    }
};

// Create a new role
const createRole = async (req, res) => {
    try {
        const { role_name, hierarchy_level, description } = req.body;

        if (!role_name || !hierarchy_level) {
            return res.status(400).json({ message: 'Role name and hierarchy level are required' });
        }

        const sql = 'INSERT INTO roles (role_name, hierarchy_level, description, status) VALUES (?, ?, ?, 1)';
        const result = await query(sql, [role_name, hierarchy_level, description || null]);

        // Log audit action
        await logAudit(req.user_id, 'CREATE_ROLE', `Created role: ${role_name}`, {
            role_id: result.insertId,
            role_name,
            hierarchy_level,
            description
        });

        res.status(201).json({
            message: 'Role created successfully',
            role_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ message: 'Error creating role', error: error.message });
    }
};

// Update a role
const updateRole = async (req, res) => {
    try {
        const { role_id } = req.params;
        const { role_name, hierarchy_level, description, status } = req.body;

        const sql = `
      UPDATE roles 
      SET role_name = COALESCE(?, role_name),
          hierarchy_level = COALESCE(?, hierarchy_level),
          description = COALESCE(?, description),
          status = COALESCE(?, status)
      WHERE role_id = ?
    `;

        await query(sql, [role_name, hierarchy_level, description, status, role_id]);

        // Log audit action
        await logAudit(req.user_id, 'UPDATE_ROLE', `Updated role: ${role_name || role_id}`, {
            role_id,
            role_name,
            hierarchy_level,
            description,
            status
        });

        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ message: 'Error updating role', error: error.message });
    }
};

// Delete a role (soft delete)
const deleteRole = async (req, res) => {
    try {
        const { role_id } = req.params;

        // Check if role is in use
        const employees = await query('SELECT COUNT(*) as count FROM employees WHERE role_id = ?', [role_id]);

        if (employees[0].count > 0) {
            return res.status(400).json({
                message: 'Cannot delete role that is assigned to employees',
                employeeCount: employees[0].count
            });
        }

        // Soft delete
        await query('UPDATE roles SET status = 0 WHERE role_id = ?', [role_id]);

        // Log audit action
        await logAudit(req.user_id, 'DELETE_ROLE', `Deleted role: ${role_id}`, { role_id });

        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ message: 'Error deleting role', error: error.message });
    }
};

module.exports = {
    getRoles,
    getRoleHierarchy,
    getAvailableSupervisors,
    createRole,
    updateRole,
    deleteRole
};
