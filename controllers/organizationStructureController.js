const con = require('../models/db');

// Get all organization structure
const getOrgStructure = (req, res) => {
    let { branch_id } = req.query;

    const roleId = Number(req.role_id || (req.user && req.user.role_id));
    const roleName = String(req.role_name || (req.user && req.user.role_name) || '').toLowerCase();
    const isSuperAdmin = Boolean(req.is_super_admin) || roleId === 34 || roleId === 1 || roleName.includes('super admin') || roleName === 'admin' || roleName === 'system admin';
    const isCentralTop2 = Boolean(req.is_central_top2) || [29, 2].includes(roleId) || roleName.includes('ceo') || roleName.includes('deputy ceo');
    const isPermittedAll = isSuperAdmin || 
        isCentralTop2 ||
        Boolean(req.can_see_all_branches) ||
        [1, 2, 29, 32, 33, 34].includes(roleId) || 
        Boolean(req.user && (req.user.can_view_all_branches || req.user.can_see_all_branches)) ||
        (Array.isArray(req.allowed_branches) && req.allowed_branches.length > 1);

    let whereClause = '';
    let params = [];

    if (!isPermittedAll) {
        if (Array.isArray(req.allowed_branches) && req.allowed_branches.length > 0) {
            const placeholders = req.allowed_branches.map(() => '?').join(',');
            whereClause = `WHERE os.branch_id IN (${placeholders})`;
            params.push(...req.allowed_branches);
        } else {
            whereClause = 'WHERE os.branch_id = ?';
            params.push(req.branch_id || 1);
        }
    } else if (branch_id && branch_id !== 'all') {
        whereClause = 'WHERE os.branch_id = ?';
        params.push(branch_id);
    }

    const query = `
    SELECT 
      os.id,
      os.name,
      os.name_amharic,
      os.type,
      os.branch_id,
      COALESCE(b.name, 'Federal Head Office') AS branch_name,
      COALESCE(b.name_amharic, 'ማዕከላዊ ዋና መስሪያ ቤት') AS branch_name_amharic,
      b.tier_level AS branch_tier,
      b.code AS branch_code,
      os.parent_id,
      p.name AS parent_name,
      p.name_amharic AS parent_name_amharic,
      p.branch_id AS parent_branch_id,
      COALESCE(pb.name, 'Federal Head Office') AS parent_branch_name,
      os.level,
      os.description,
      os.head_employee_id,
      os.status,
      os.created_at,
      os.updated_at
    FROM organization_structure os
    LEFT JOIN branches b ON os.branch_id = b.branch_id
    LEFT JOIN organization_structure p ON os.parent_id = p.id
    LEFT JOIN branches pb ON p.branch_id = pb.branch_id
    ${whereClause}
    ORDER BY os.level ASC, os.name ASC
  `;

    con.query(query, params, (err, results) => {
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
      os.id,
      os.name,
      os.name_amharic,
      os.type,
      os.branch_id,
      COALESCE(b.name, 'Federal Head Office') AS branch_name,
      COALESCE(b.name_amharic, 'ማዕከላዊ ዋና መስሪያ ቤት') AS branch_name_amharic,
      os.parent_id,
      os.level,
      os.description,
      os.head_employee_id,
      os.status,
      os.created_at,
      os.updated_at
    FROM organization_structure os
    LEFT JOIN branches b ON os.branch_id = b.branch_id
    WHERE os.id = ?
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
        branch_id,
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

    const parentIdNum = parent_id !== null && parent_id !== undefined && parent_id !== '' ? Number(parent_id) : null;
    const effectiveBranchId = (req.is_super_admin && branch_id) ? Number(branch_id) : (Number(req.branch_id) || Number(branch_id) || 1);

    const executeInsert = (calculatedLevel) => {
        const query = `
        INSERT INTO organization_structure 
        (name, name_amharic, type, branch_id, parent_id, level, description, head_employee_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const values = [
            name,
            name_amharic,
            type,
            effectiveBranchId,
            parentIdNum,
            calculatedLevel,
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
                    ...req.body,
                    level: calculatedLevel
                }
            });
        });
    };

    if (parentIdNum) {
        con.query('SELECT level FROM organization_structure WHERE id = ?', [parentIdNum], (pErr, pRows) => {
            const parentLevel = (pRows && pRows.length > 0) ? Number(pRows[0].level) : 1;
            executeInsert(parentLevel + 1);
        });
    } else {
        executeInsert(level ? Number(level) : 1);
    }
};

// Helper to recalculate levels for a unit's entire descendant subtree
const recalculateDescendantLevels = (rootId, rootLevel, callback) => {
    con.query('SELECT id, parent_id, level FROM organization_structure', (err, rows) => {
        if (err || !rows) return callback && callback(err);

        const childrenMap = new Map();
        rows.forEach(r => {
            const pid = r.parent_id ? Number(r.parent_id) : null;
            if (pid) {
                if (!childrenMap.has(pid)) childrenMap.set(pid, []);
                childrenMap.get(pid).push(r);
            }
        });

        const updates = [];
        const traverse = (parentId, parentLevel) => {
            const children = childrenMap.get(Number(parentId)) || [];
            children.forEach(child => {
                const expectedLevel = parentLevel + 1;
                if (child.level !== expectedLevel) {
                    updates.push({ id: child.id, level: expectedLevel });
                }
                traverse(child.id, expectedLevel);
            });
        };

        traverse(rootId, rootLevel);

        if (updates.length === 0) {
            return callback && callback(null, 0);
        }

        let done = 0;
        let hasError = null;
        updates.forEach(u => {
            con.query('UPDATE organization_structure SET level = ? WHERE id = ?', [u.level, u.id], (upErr) => {
                if (upErr) hasError = upErr;
                done++;
                if (done === updates.length && callback) {
                    callback(hasError, updates.length);
                }
            });
        });
    });
};

// Update organization unit (with automatic level resolution and cascading)
const updateOrgUnit = (req, res) => {
    const { id } = req.params;
    const {
        name,
        name_amharic,
        type,
        branch_id,
        parent_id,
        level,
        description,
        head_employee_id,
        status
    } = req.body;

    // Check if unit exists
    const checkQuery = 'SELECT id, branch_id FROM organization_structure WHERE id = ?';

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

        const parentIdNum = parent_id !== null && parent_id !== undefined && parent_id !== '' ? Number(parent_id) : null;

        // Prevent circular reference (unit cannot be its own parent)
        if (parentIdNum && parseInt(parentIdNum) === parseInt(id)) {
            return res.status(400).json({
                success: false,
                message: 'A unit cannot be its own parent'
            });
        }

        const finishUpdate = (calculatedLevel) => {
            const updateQuery = `
              UPDATE organization_structure 
              SET 
                name = ?,
                name_amharic = ?,
                type = ?,
                branch_id = COALESCE(?, branch_id),
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
                branch_id || null,
                parentIdNum,
                calculatedLevel,
                description || null,
                head_employee_id || null,
                status,
                id
            ];

            con.query(updateQuery, values, (updateErr, result) => {
                if (updateErr) {
                    console.error('Error updating organization unit:', updateErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to update organization unit'
                    });
                }

                recalculateDescendantLevels(Number(id), calculatedLevel, () => {
                    res.json({
                        success: true,
                        message: 'Organization unit updated successfully'
                    });
                });
            });
        };

        if (parentIdNum) {
            con.query('SELECT level FROM organization_structure WHERE id = ?', [parentIdNum], (pErr, pRows) => {
                const parentLevel = (pRows && pRows.length > 0) ? Number(pRows[0].level) : 1;
                finishUpdate(parentLevel + 1);
            });
        } else {
            finishUpdate(level ? Number(level) : 1);
        }
    });
};

// Map or re-link an organization unit's parent (supports cross-branch linking)
const mapOrgUnitParent = (req, res) => {
    const { id } = req.params;
    const { parent_id } = req.body;

    const unitId = Number(id);
    const targetParentId = parent_id !== null && parent_id !== undefined && parent_id !== '' ? Number(parent_id) : null;

    if (!unitId) {
        return res.status(400).json({ success: false, message: 'Invalid unit ID' });
    }

    // Check unit exists
    con.query('SELECT id, name, name_amharic, branch_id, level, parent_id FROM organization_structure WHERE id = ?', [unitId], (err, unitRows) => {
        if (err) {
            console.error('Error finding unit to map:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (unitRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Organization unit not found' });
        }

        const unit = unitRows[0];

        // If targetParentId is null, make it a root unit (level 1)
        if (targetParentId === null) {
            const updateSql = 'UPDATE organization_structure SET parent_id = NULL, level = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
            con.query(updateSql, [unitId], (upErr) => {
                if (upErr) {
                    console.error('Error unlinking unit:', upErr);
                    return res.status(500).json({ success: false, message: 'Failed to unlink unit' });
                }
                recalculateDescendantLevels(unitId, 1, () => {
                    return res.json({
                        success: true,
                        message: `"${unit.name_amharic || unit.name}" is now set as an independent Root Unit (Level 1)`,
                        data: { id: unitId, parent_id: null, level: 1 }
                    });
                });
            });
            return;
        }

        // Circular check 1: cannot be its own parent
        if (targetParentId === unitId) {
            return res.status(400).json({ success: false, message: 'A unit cannot be its own parent' });
        }

        // Fetch all units to check circularity and parent level
        con.query('SELECT id, name, name_amharic, level, parent_id, branch_id FROM organization_structure', (allErr, allUnits) => {
            if (allErr) {
                return res.status(500).json({ success: false, message: 'Failed to verify hierarchy' });
            }

            const parentUnit = allUnits.find(u => u.id === targetParentId);
            if (!parentUnit) {
                return res.status(404).json({ success: false, message: 'Target parent unit not found' });
            }

            // Circular check 2: targetParent cannot be a descendant of unitId
            const descendants = new Set();
            const queue = [unitId];
            while (queue.length > 0) {
                const cur = queue.shift();
                allUnits.forEach(u => {
                    if (Number(u.parent_id) === cur && !descendants.has(u.id)) {
                        descendants.add(u.id);
                        queue.push(u.id);
                    }
                });
            }

            if (descendants.has(targetParentId)) {
                return res.status(400).json({
                    success: false,
                    message: `Circular hierarchy detected: "${parentUnit.name_amharic || parentUnit.name}" is already a subordinate under this unit`
                });
            }

            const newLevel = (Number(parentUnit.level) || 1) + 1;
            const updateSql = 'UPDATE organization_structure SET parent_id = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';

            con.query(updateSql, [targetParentId, newLevel, unitId], (saveErr) => {
                if (saveErr) {
                    console.error('Error mapping unit parent:', saveErr);
                    return res.status(500).json({ success: false, message: 'Failed to map parent' });
                }

                recalculateDescendantLevels(unitId, newLevel, (subErr, updatedCount) => {
                    return res.json({
                        success: true,
                        message: `Successfully linked "${unit.name_amharic || unit.name}" under "${parentUnit.name_amharic || parentUnit.name}" (Level ${newLevel})`,
                        data: {
                            id: unitId,
                            parent_id: targetParentId,
                            level: newLevel,
                            descendantsUpdated: updatedCount || 0
                        }
                    });
                });
            });
        });
    });
};

// Batch map multiple organization units under a parent (e.g. Map Regional Roots under Federal CEO)
const batchMapOrgUnits = (req, res) => {
    const { unit_ids, parent_id } = req.body;

    if (!Array.isArray(unit_ids) || unit_ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Please provide an array of unit IDs to map' });
    }

    const targetParentId = parent_id !== null && parent_id !== undefined && parent_id !== '' ? Number(parent_id) : null;

    if (targetParentId === null) {
        // Unlink all specified units
        con.query('UPDATE organization_structure SET parent_id = NULL, level = 1, updated_at = CURRENT_TIMESTAMP WHERE id IN (?)', [unit_ids], (err, result) => {
            if (err) {
                console.error('Error batch unlinking:', err);
                return res.status(500).json({ success: false, message: 'Failed to batch unlink units' });
            }

            let processed = 0;
            unit_ids.forEach(uid => {
                recalculateDescendantLevels(Number(uid), 1, () => {
                    processed++;
                    if (processed === unit_ids.length) {
                        return res.json({
                            success: true,
                            message: `Successfully unlinked ${unit_ids.length} units to Root Level (Level 1)`
                        });
                    }
                });
            });
        });
        return;
    }

    // Check parent exists
    con.query('SELECT id, name, name_amharic, level FROM organization_structure WHERE id = ?', [targetParentId], (err, pRows) => {
        if (err || pRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Target parent unit not found' });
        }

        const parentUnit = pRows[0];
        const newLevel = (Number(parentUnit.level) || 1) + 1;

        // Filter out any unit_id that equals targetParentId
        const validUnitIds = unit_ids.filter(id => Number(id) !== targetParentId);
        if (validUnitIds.length === 0) {
            return res.status(400).json({ success: false, message: 'Cannot set unit as its own parent' });
        }

        con.query('UPDATE organization_structure SET parent_id = ?, level = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (?)', [targetParentId, newLevel, validUnitIds], (upErr, result) => {
            if (upErr) {
                console.error('Error batch mapping:', upErr);
                return res.status(500).json({ success: false, message: 'Failed to batch map units' });
            }

            let processed = 0;
            validUnitIds.forEach(uid => {
                recalculateDescendantLevels(Number(uid), newLevel, () => {
                    processed++;
                    if (processed === validUnitIds.length) {
                        return res.json({
                            success: true,
                            message: `Successfully mapped ${validUnitIds.length} units under "${parentUnit.name_amharic || parentUnit.name}" (Level ${newLevel})`,
                            data: {
                                parent_id: targetParentId,
                                parent_name: parentUnit.name_amharic || parentUnit.name,
                                mapped_count: validUnitIds.length,
                                level: newLevel
                            }
                        });
                    }
                });
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

// Helper for async con.query
const queryAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        con.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Bulk Import Organization Units (Roots and hierarchical sub-units)
const bulkImportOrgUnits = async (req, res) => {
    try {
        const units = Array.isArray(req.body.units) ? req.body.units : (Array.isArray(req.body) ? req.body : []);
        const requestedBranchId = req.body.branch_id || req.query.branch_id;
        const effectiveBranchId = (req.is_super_admin && requestedBranchId)
            ? Number(requestedBranchId)
            : (Number(req.branch_id) || Number(requestedBranchId) || 1);

        if (!units || units.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No organization units provided for import'
            });
        }

        // 1. Ensure types exist or create them
        const distinctTypes = [...new Set(units.map(u => (u.type || '').trim()).filter(Boolean))];
        for (const tName of distinctTypes) {
            await queryAsync(
                `INSERT IGNORE INTO organization_types (name, description, level_order) VALUES (?, ?, 5)`,
                [tName, `${tName} organization unit`]
            );
        }

        // 2. Fetch existing units for this branch
        const existingUnits = await queryAsync(
            `SELECT id, name, name_amharic, parent_id, level FROM organization_structure WHERE branch_id = ?`,
            [effectiveBranchId]
        );

        // Build name/amharic/id to id lookup
        const lookup = new Map();
        existingUnits.forEach(u => {
            if (u.id) lookup.set(String(u.id), u.id);
            if (u.name) lookup.set(u.name.trim().toLowerCase(), u.id);
            if (u.name_amharic) lookup.set(u.name_amharic.trim().toLowerCase(), u.id);
        });

        // 3. Process units iteratively so parents are resolved before children
        const pending = units.map(u => ({
            name: (u.name || u.name_amharic || '').trim(),
            name_amharic: (u.name_amharic || u.name || '').trim(),
            type: (u.type || 'Unit').trim(),
            parent_name: (u.parent_name || '').trim(),
            parent_id: u.parent_id ? Number(u.parent_id) : null,
            level: u.level ? Number(u.level) : 1,
            description: u.description || null,
            head_employee_id: u.head_employee_id || null,
            status: u.status && ['active', 'inactive'].includes(u.status.toLowerCase()) ? u.status.toLowerCase() : 'active'
        })).filter(u => u.name || u.name_amharic);

        let insertedCount = 0;
        let updatedCount = 0;
        const maxPasses = 10;
        let pass = 0;
        let remaining = [...pending];

        while (remaining.length > 0 && pass < maxPasses) {
            pass++;
            const unhandled = [];
            let progressInThisPass = false;

            for (const item of remaining) {
                // Determine parent ID:
                let resolvedParentId = null;

                // If explicit parent_id provided and exists
                if (item.parent_id && lookup.has(String(item.parent_id))) {
                    resolvedParentId = lookup.get(String(item.parent_id));
                } else if (item.parent_name) {
                    const pKey = item.parent_name.toLowerCase();
                    if (lookup.has(pKey)) {
                        resolvedParentId = lookup.get(pKey);
                    }
                }

                // If parent reference was given but not yet resolved, defer to next pass
                const hasParentRef = Boolean(item.parent_name || item.parent_id);
                if (hasParentRef && resolvedParentId === null) {
                    unhandled.push(item);
                    continue;
                }

                // Resolve level: parent level + 1 if parent exists
                let calcLevel = item.level || 1;
                if (resolvedParentId) {
                    const parentUnit = existingUnits.find(eu => eu.id === resolvedParentId);
                    calcLevel = parentUnit ? (parentUnit.level || 1) + 1 : (calcLevel > 1 ? calcLevel : 2);
                } else {
                    calcLevel = 1; // root unit
                }

                // Check if unit already exists by English or Amharic name in this branch
                const matchId = lookup.get(item.name.toLowerCase()) || lookup.get(item.name_amharic.toLowerCase());

                if (matchId) {
                    // Update existing unit
                    await queryAsync(`
                        UPDATE organization_structure
                        SET name = ?, name_amharic = ?, type = ?, parent_id = ?, level = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ? AND branch_id = ?
                    `, [item.name, item.name_amharic, item.type, resolvedParentId, calcLevel, item.description, item.status, matchId, effectiveBranchId]);

                    lookup.set(item.name.toLowerCase(), matchId);
                    lookup.set(item.name_amharic.toLowerCase(), matchId);
                    lookup.set(String(matchId), matchId);
                    updatedCount++;
                } else {
                    // Insert new unit
                    const insertRes = await queryAsync(`
                        INSERT INTO organization_structure (name, name_amharic, type, branch_id, parent_id, level, description, head_employee_id, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [item.name, item.name_amharic, item.type, effectiveBranchId, resolvedParentId, calcLevel, item.description, item.head_employee_id, item.status]);

                    const newId = insertRes.insertId;
                    lookup.set(item.name.toLowerCase(), newId);
                    lookup.set(item.name_amharic.toLowerCase(), newId);
                    lookup.set(String(newId), newId);
                    existingUnits.push({ id: newId, name: item.name, name_amharic: item.name_amharic, level: calcLevel });
                    insertedCount++;
                }

                progressInThisPass = true;
            }

            // If no progress made, insert remaining items as unlinked roots
            if (!progressInThisPass && unhandled.length > 0) {
                for (const item of unhandled) {
                    const insertRes = await queryAsync(`
                        INSERT INTO organization_structure (name, name_amharic, type, branch_id, parent_id, level, description, head_employee_id, status)
                        VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?)
                    `, [item.name, item.name_amharic, item.type, effectiveBranchId, item.level || 1, item.description, item.head_employee_id, item.status]);
                    const newId = insertRes.insertId;
                    lookup.set(item.name.toLowerCase(), newId);
                    lookup.set(item.name_amharic.toLowerCase(), newId);
                    insertedCount++;
                }
                break;
            }

            remaining = unhandled;
        }

        res.status(200).json({
            success: true,
            message: `Import completed: ${insertedCount} created, ${updatedCount} updated.`,
            insertedCount,
            updatedCount,
            totalProcessed: insertedCount + updatedCount
        });
    } catch (error) {
        console.error('Error in bulkImportOrgUnits:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import organization units',
            error: error.message
        });
    }
};

// Bulk Import Organization Types
const bulkImportOrgTypes = async (req, res) => {
    try {
        const types = Array.isArray(req.body.types) ? req.body.types : (Array.isArray(req.body) ? req.body : []);

        if (!types || types.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No organization types provided for import'
            });
        }

        let savedCount = 0;
        for (const t of types) {
            const name = (t.name || '').trim();
            if (!name) continue;
            const description = t.description || `${name} organization type`;
            const color = t.color || 'from-gray-600 to-gray-700';
            const level_order = t.level_order !== undefined && t.level_order !== '' ? parseInt(t.level_order, 10) : 5;

            await queryAsync(`
                INSERT INTO organization_types (name, description, color, level_order)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    description = VALUES(description),
                    color = VALUES(color),
                    level_order = VALUES(level_order)
            `, [name, description, color, level_order]);

            savedCount++;
        }

        res.status(200).json({
            success: true,
            message: `Successfully imported ${savedCount} organization types`,
            count: savedCount
        });
    } catch (error) {
        console.error('Error in bulkImportOrgTypes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to import organization types',
            error: error.message
        });
    }
};

module.exports = {
    getOrgStructure,
    getOrgUnitById,
    createOrgUnit,
    updateOrgUnit,
    deleteOrgUnit,
    mapOrgUnitParent,
    batchMapOrgUnits,
    getOrgHierarchy,
    getOrgTypes,
    createOrgType,
    updateOrgType,
    deleteOrgType,
    bulkImportOrgUnits,
    bulkImportOrgTypes
};

