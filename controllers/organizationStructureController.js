const con = require('../models/db');

// Get all organization structure
const getOrgStructure = (req, res) => {
    const query = `
    SELECT 
      id,
      name,
      name_amharic,
      type,
      parent_id,
      level,
      description,
      head_employee_id,
      status,
      created_at,
      updated_at
    FROM organization_structure
    ORDER BY level ASC, name ASC
  `;

    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching organization structure:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch organization structure'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};

// Get organization unit by ID
const getOrgUnitById = (req, res) => {
    const { id } = req.params;

    const query = `
    SELECT 
      id,
      name,
      name_amharic,
      type,
      parent_id,
      level,
      description,
      head_employee_id,
      status,
      created_at,
      updated_at
    FROM organization_structure
    WHERE id = ?
  `;

    con.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error fetching organization unit:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch organization unit'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Organization unit not found'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};

// Create organization unit
const createOrgUnit = (req, res) => {
    const {
        name,
        name_amharic,
        type,
        parent_id,
        level,
        description,
        head_employee_id,
        status
    } = req.body;

    // Validation
    if (!name || !name_amharic || !type) {
        return res.status(400).json({
            success: false,
            message: 'Name, Amharic name, and type are required'
        });
    }

    const query = `
    INSERT INTO organization_structure 
    (name, name_amharic, type, parent_id, level, description, head_employee_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

    const values = [
        name,
        name_amharic,
        type,
        parent_id || null,
        level || 1,
        description || null,
        head_employee_id || null,
        status || 'active'
    ];

    con.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating organization unit:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to create organization unit'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Organization unit created successfully',
            data: {
                id: result.insertId,
                ...req.body
            }
        });
    });
};

// Update organization unit
const updateOrgUnit = (req, res) => {
    const { id } = req.params;
    const {
        name,
        name_amharic,
        type,
        parent_id,
        level,
        description,
        head_employee_id,
        status
    } = req.body;

    // Check if unit exists
    const checkQuery = 'SELECT id FROM organization_structure WHERE id = ?';

    con.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Error checking organization unit:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to check organization unit'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Organization unit not found'
            });
        }

        // Prevent circular reference (unit cannot be its own parent)
        if (parent_id && parseInt(parent_id) === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: 'A unit cannot be its own parent'
            });
        }

        const updateQuery = `
      UPDATE organization_structure 
      SET 
        name = ?,
        name_amharic = ?,
        type = ?,
        parent_id = ?,
        level = ?,
        description = ?,
        head_employee_id = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

        const values = [
            name,
            name_amharic,
            type,
            parent_id || null,
            level,
            description || null,
            head_employee_id || null,
            status,
            id
        ];

        con.query(updateQuery, values, (err, result) => {
            if (err) {
                console.error('Error updating organization unit:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update organization unit'
                });
            }

            res.json({
                success: true,
                message: 'Organization unit updated successfully'
            });
        });
    });
};

// Delete organization unit (and all children)
const deleteOrgUnit = (req, res) => {
    const { id } = req.params;

    // First, get all child units recursively
    const getChildrenQuery = `
    WITH RECURSIVE org_tree AS (
      SELECT id FROM organization_structure WHERE id = ?
      UNION ALL
      SELECT os.id FROM organization_structure os
      INNER JOIN org_tree ot ON os.parent_id = ot.id
    )
    SELECT id FROM org_tree
  `;

    con.query(getChildrenQuery, [id], (err, children) => {
        if (err) {
            console.error('Error getting child units:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to get child units'
            });
        }

        if (children.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Organization unit not found'
            });
        }

        const childIds = children.map(child => child.id);

        // Delete all units (parent and children)
        const deleteQuery = 'DELETE FROM organization_structure WHERE id IN (?)';

        con.query(deleteQuery, [childIds], (err, result) => {
            if (err) {
                console.error('Error deleting organization units:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete organization units'
                });
            }

            res.json({
                success: true,
                message: `Successfully deleted ${result.affectedRows} organization unit(s)`
            });
        });
    });
};

// Get organization hierarchy (tree structure)
const getOrgHierarchy = (req, res) => {
    const query = `
    SELECT 
      id,
      name,
      name_amharic,
      type,
      parent_id,
      level,
      description,
      head_employee_id,
      status
    FROM organization_structure
    ORDER BY level ASC, name ASC
  `;

    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching organization hierarchy:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch organization hierarchy'
            });
        }

        // Build hierarchy
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parent_id === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };

        const hierarchy = buildTree(results);

        res.json({
            success: true,
            data: hierarchy
        });
    });
};



// Get all organization types
const getOrgTypes = (req, res) => {
    const query = "SELECT * FROM organization_types ORDER BY level_order ASC";

    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching org types:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching organization types',
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
};

// Create new organization type
const createOrgType = (req, res) => {
    const { name, description, color, level_order } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: 'Type name is required'
        });
    }

    const query = "INSERT INTO organization_types (name, description, color, level_order) VALUES (?, ?, ?, ?)";

    con.query(query, [name, description, color, level_order || 99], (err, result) => {
        if (err) {
            console.error('Error creating org type:', err);
            return res.status(500).json({
                success: false,
                message: 'Error creating organization type',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Organization type created successfully',
            data: { id: result.insertId, ...req.body }
        });
    });
};

// Update organization type
const updateOrgType = (req, res) => {
    const { id } = req.params;
    const { name, description, color, level_order } = req.body;

    const query = "UPDATE organization_types SET name=?, description=?, color=?, level_order=? WHERE id=?";

    con.query(query, [name, description, color, level_order, id], (err, result) => {
        if (err) {
            console.error('Error updating org type:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating organization type',
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Organization type updated successfully'
        });
    });
};

// Delete organization type
const deleteOrgType = (req, res) => {
    const { id } = req.params;

    const query = "DELETE FROM organization_types WHERE id=?";

    con.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting org type:', err);
            return res.status(500).json({
                success: false,
                message: 'Error deleting organization type',
                error: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Organization type deleted successfully'
        });
    });
};

module.exports = {
    getOrgStructure,
    getOrgUnitById,
    createOrgUnit,
    updateOrgUnit,
    deleteOrgUnit,
    getOrgHierarchy,
    getOrgTypes,
    createOrgType,
    updateOrgType,
    deleteOrgType
};
