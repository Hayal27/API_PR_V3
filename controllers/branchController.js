const con = require('../models/db');
const util = require('util');

const query = util.promisify(con.query).bind(con);

// ── 1. GET ALL BRANCHES (Flat list with metrics & parent info) ────────────────
exports.getAllBranches = async (req, res) => {
    try {
        const { tier, status, parent_id } = req.query;
        let whereClauses = [];
        let params = [];

        if (tier) {
            whereClauses.push('b.tier_level = ?');
            params.push(tier);
        }
        if (status) {
            whereClauses.push('b.status = ?');
            params.push(status);
        }
        if (parent_id) {
            whereClauses.push('b.parent_branch_id = ?');
            params.push(parent_id);
        }

        // Only restrict to own branch if NOT Super Admin and NOT 1st two positions of Central Headquarter (CEO, Deputy CEO)
        const canSeeAll = Boolean(req.can_see_all_branches) || 
                          Boolean(req.is_super_admin) || 
                          [1, 2, 29, 34].includes(Number(req.role_id)) ||
                          String(req.role_name || '').toLowerCase().includes('ceo') ||
                          String(req.role_name || '').toLowerCase().includes('super admin');

        if (!canSeeAll) {
            whereClauses.push('b.branch_id = ?');
            params.push(req.branch_id || 1);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const sql = `
            SELECT 
                b.branch_id,
                b.code,
                b.name,
                b.name_amharic,
                b.tier_level,
                b.parent_branch_id,
                parent.name AS parent_branch_name,
                parent.name_amharic AS parent_branch_name_amharic,
                b.head_employee_id,
                CONCAT(COALESCE(e.fname, e.name, ''), ' ', COALESCE(e.lname, '')) AS head_employee_name,
                b.region,
                b.city,
                b.sub_city,
                b.woreda,
                b.address,
                b.phone,
                b.email,
                b.is_head_office,
                b.status,
                b.created_at,
                b.updated_at,
                (SELECT COUNT(*) FROM employees emp WHERE emp.branch_id = b.branch_id) AS total_employees,
                (SELECT COUNT(*) FROM organization_structure os WHERE os.branch_id = b.branch_id) AS total_departments,
                (SELECT COUNT(*) FROM task_assignments ta WHERE ta.branch_id = b.branch_id AND ta.status IN ('pending', 'in_progress')) AS active_tasks,
                (
                    SELECT CONCAT(COALESCE(e_adm.fname, u_adm.user_name), ' ', COALESCE(e_adm.lname, ''))
                    FROM users u_adm
                    LEFT JOIN employees e_adm ON u_adm.employee_id = e_adm.employee_id
                    WHERE u_adm.branch_id = b.branch_id AND u_adm.role_id = 35
                    LIMIT 1
                ) AS branch_admin_name,
                (
                    SELECT u_adm.user_name
                    FROM users u_adm
                    WHERE u_adm.branch_id = b.branch_id AND u_adm.role_id = 35
                    LIMIT 1
                ) AS branch_admin_username,
                (
                    SELECT u_adm.user_id
                    FROM users u_adm
                    WHERE u_adm.branch_id = b.branch_id AND u_adm.role_id = 35
                    LIMIT 1
                ) AS branch_admin_user_id
            FROM branches b
            LEFT JOIN branches parent ON b.parent_branch_id = parent.branch_id
            LEFT JOIN employees e ON b.head_employee_id = e.employee_id
            ${whereSql}
            ORDER BY 
                CASE 
                    WHEN b.tier_level = 'federal' THEN 1
                    WHEN b.tier_level = 'regional' THEN 2
                    WHEN b.tier_level = 'city_admin' THEN 3
                    WHEN b.tier_level = 'sub_city' THEN 4
                    WHEN b.tier_level = 'zone' THEN 5
                    ELSE 6
                END ASC,
                b.name ASC
        `;

        const branches = await query(sql, params);
        res.status(200).json({
            success: true,
            count: branches.length,
            data: branches,
            branches: branches
        });
    } catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch branches', error: err.message });
    }
};

// ── 2. GET BRANCH HIERARCHY (Nested tree for visual organization) ────────────
exports.getBranchHierarchy = async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.branch_id,
                b.code,
                b.name,
                b.name_amharic,
                b.tier_level,
                b.parent_branch_id,
                b.region,
                b.city,
                b.sub_city,
                b.is_head_office,
                b.status,
                (SELECT COUNT(*) FROM employees emp WHERE emp.branch_id = b.branch_id) AS total_employees
            FROM branches b
            WHERE b.status = 'active'
            ORDER BY b.branch_id ASC
        `;

        const rows = await query(sql);

        // Build nested tree structure
        const branchMap = {};
        rows.forEach(b => {
            branchMap[b.branch_id] = { ...b, children: [] };
        });

        const rootBranches = [];
        rows.forEach(b => {
            if (b.parent_branch_id && branchMap[b.parent_branch_id]) {
                branchMap[b.parent_branch_id].children.push(branchMap[b.branch_id]);
            } else {
                rootBranches.push(branchMap[b.branch_id]);
            }
        });

        res.status(200).json({
            success: true,
            data: rootBranches
        });
    } catch (err) {
        console.error('Error building branch hierarchy:', err);
        res.status(500).json({ success: false, message: 'Failed to build branch tree', error: err.message });
    }
};

// ── 3. GET SINGLE BRANCH DETAILS ─────────────────────────────────────────────
exports.getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT 
                b.*,
                parent.name AS parent_branch_name,
                CONCAT(COALESCE(e.fname, e.name, ''), ' ', COALESCE(e.lname, '')) AS head_employee_name
            FROM branches b
            LEFT JOIN branches parent ON b.parent_branch_id = parent.branch_id
            LEFT JOIN employees e ON b.head_employee_id = e.employee_id
            WHERE b.branch_id = ?
            LIMIT 1
        `;

        const results = await query(sql, [id]);
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        res.status(200).json({ success: true, data: results[0] });
    } catch (err) {
        console.error('Error fetching branch:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ── 4. CREATE NEW BRANCH ─────────────────────────────────────────────────────
exports.createBranch = async (req, res) => {
    try {
        if (!req.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Forbidden: Only Super Admin can create branches.' });
        }

        const {
            code,
            name,
            name_amharic,
            tier_level,
            parent_branch_id,
            head_employee_id,
            region,
            city,
            sub_city,
            woreda,
            address,
            phone,
            email,
            is_head_office,
            status
        } = req.body;

        if (!code || !name || !tier_level) {
            return res.status(400).json({
                success: false,
                message: 'Branch code, name, and administrative tier level are required.'
            });
        }

        // Check if code is already taken
        const existing = await query('SELECT branch_id FROM branches WHERE code = ? LIMIT 1', [code.trim()]);
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Branch code '${code}' already exists. Please choose a unique code.`
            });
        }

        const insertSql = `
            INSERT INTO branches (
                code, name, name_amharic, tier_level, parent_branch_id, 
                head_employee_id, region, city, sub_city, woreda, 
                address, phone, email, is_head_office, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await query(insertSql, [
            code.trim().toUpperCase(),
            name.trim(),
            name_amharic ? name_amharic.trim() : name.trim(),
            tier_level,
            parent_branch_id || null,
            head_employee_id || null,
            region || null,
            city || null,
            sub_city || null,
            woreda || null,
            address || null,
            phone || null,
            email || null,
            is_head_office ? 1 : 0,
            status || 'active'
        ]);

        res.status(201).json({
            success: true,
            message: 'Branch created successfully',
            branch_id: result.insertId
        });
    } catch (err) {
        console.error('Error creating branch:', err);
        res.status(500).json({ success: false, message: 'Failed to create branch', error: err.message });
    }
};

// ── 5. UPDATE EXISTING BRANCH ────────────────────────────────────────────────
exports.updateBranch = async (req, res) => {
    try {
        if (!req.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Forbidden: Only Super Admin can update branches.' });
        }

        const { id } = req.params;
        const {
            code,
            name,
            name_amharic,
            tier_level,
            parent_branch_id,
            head_employee_id,
            region,
            city,
            sub_city,
            woreda,
            address,
            phone,
            email,
            is_head_office,
            status
        } = req.body;

        const branch = await query('SELECT branch_id FROM branches WHERE branch_id = ?', [id]);
        if (branch.length === 0) {
            return res.status(404).json({ success: false, message: 'Branch not found' });
        }

        // Prevent setting a branch as its own parent
        if (parent_branch_id && Number(parent_branch_id) === Number(id)) {
            return res.status(400).json({
                success: false,
                message: 'A branch cannot be its own parent.'
            });
        }

        const updateSql = `
            UPDATE branches SET
                code = COALESCE(?, code),
                name = COALESCE(?, name),
                name_amharic = COALESCE(?, name_amharic),
                tier_level = COALESCE(?, tier_level),
                parent_branch_id = ?,
                head_employee_id = ?,
                region = ?,
                city = ?,
                sub_city = ?,
                woreda = ?,
                address = ?,
                phone = ?,
                email = ?,
                is_head_office = ?,
                status = COALESCE(?, status)
            WHERE branch_id = ?
        `;

        await query(updateSql, [
            code ? code.trim().toUpperCase() : null,
            name ? name.trim() : null,
            name_amharic ? name_amharic.trim() : null,
            tier_level || null,
            parent_branch_id || null,
            head_employee_id || null,
            region || null,
            city || null,
            sub_city || null,
            woreda || null,
            address || null,
            phone || null,
            email || null,
            is_head_office ? 1 : 0,
            status || null,
            id
        ]);

        res.status(200).json({
            success: true,
            message: 'Branch updated successfully'
        });
    } catch (err) {
        console.error('Error updating branch:', err);
        res.status(500).json({ success: false, message: 'Failed to update branch', error: err.message });
    }
};

// ── 6. DELETE BRANCH (Safe archive) ──────────────────────────────────────────
exports.deleteBranch = async (req, res) => {
    try {
        if (!req.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Forbidden: Only Super Admin can delete branches.' });
        }

        const { id } = req.params;

        if (Number(id) === 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the Federal Head Office master record.'
            });
        }

        // Check if there are active employees in this branch
        const employeeCount = await query('SELECT COUNT(*) as cnt FROM employees WHERE branch_id = ?', [id]);
        if (employeeCount[0].cnt > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete branch with ${employeeCount[0].cnt} assigned employees. Please reassign staff first or set status to inactive.`
            });
        }

        // Check if there are child branches
        const childCount = await query('SELECT COUNT(*) as cnt FROM branches WHERE parent_branch_id = ?', [id]);
        if (childCount[0].cnt > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete branch with ${childCount[0].cnt} subordinate branches. Please reassign child branches first.`
            });
        }

        await query('DELETE FROM branches WHERE branch_id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Branch removed successfully.'
        });
    } catch (err) {
        console.error('Error deleting branch:', err);
        res.status(500).json({ success: false, message: 'Failed to delete branch', error: err.message });
    }
};

// ── 7. GET BRANCH COMPARATIVE PERFORMANCE SCORECARD ──────────────────────────
exports.getBranchPerformanceScorecard = async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.branch_id,
                b.code,
                b.name,
                b.name_amharic,
                b.tier_level,
                b.is_head_office,
                (SELECT COUNT(*) FROM employees e WHERE e.branch_id = b.branch_id) AS total_staff,
                (SELECT COUNT(*) FROM task_assignments ta WHERE ta.branch_id = b.branch_id) AS total_tasks,
                (SELECT COUNT(*) FROM task_assignments ta WHERE ta.branch_id = b.branch_id AND ta.status = 'completed') AS completed_tasks,
                (SELECT COUNT(*) FROM task_assignments ta WHERE ta.branch_id = b.branch_id AND ta.status IN ('pending', 'in_progress') AND ta.due_date < CURDATE()) AS overdue_tasks,
                (SELECT COUNT(*) FROM plans p WHERE p.branch_id = b.branch_id) AS total_plans,
                (SELECT COUNT(*) FROM reports r WHERE r.branch_id = b.branch_id) AS total_reports
            FROM branches b
            WHERE b.status = 'active'
            ORDER BY total_staff DESC
        `;

        const metrics = await query(sql);

        const scored = metrics.map(b => {
            const completionRate = b.total_tasks > 0 
                ? Math.round((b.completed_tasks / b.total_tasks) * 100) 
                : 100;
            return {
                ...b,
                completion_rate: completionRate,
                health_status: b.overdue_tasks > 5 ? 'at_risk' : (b.overdue_tasks > 0 ? 'warning' : 'healthy')
            };
        });

        res.status(200).json({
            success: true,
            data: scored
        });
    } catch (err) {
        console.error('Error calculating branch scorecards:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

// ── 8. GET ALL BRANCH ADMINS ────────────────────────────────────────────────
exports.getBranchAdmins = async (req, res) => {
    try {
        if (!req.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Forbidden: Only Super Admin can view branch administrators.' });
        }

        const sql = `
            SELECT 
                u.user_id,
                u.user_name,
                u.branch_id,
                b.name AS branch_name,
                b.code AS branch_code,
                b.tier_level AS branch_tier,
                e.employee_id,
                CONCAT(COALESCE(e.fname, u.user_name), ' ', COALESCE(e.lname, '')) AS full_name,
                e.email AS employee_email,
                e.phone,
                r.role_name
            FROM users u
            JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN branches b ON u.branch_id = b.branch_id
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            WHERE u.role_id = 35 OR LOWER(r.role_name) = 'branch admin'
            ORDER BY b.name ASC, u.user_name ASC
        `;
        const admins = await query(sql);
        res.status(200).json({ success: true, count: admins.length, data: admins });
    } catch (err) {
        console.error('Error fetching branch admins:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch branch admins', error: err.message });
    }
};

// ── 9. ASSIGN OR CREATE BRANCH ADMIN ─────────────────────────────────────────
exports.assignBranchAdmin = async (req, res) => {
    try {
        const { id } = req.params; // branch_id
        const { user_id, user_name, fname, lname, email, phone, password } = req.body;

        // Check if caller is super admin
        if (!req.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Only Super Admin can assign or create Branch Admins.' });
        }

        const branchRows = await query('SELECT * FROM branches WHERE branch_id = ?', [id]);
        if (!branchRows || branchRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Target branch does not exist.' });
        }
        const branch = branchRows[0];

        // Case A: Promoting an existing user
        if (user_id) {
            await query('UPDATE users SET role_id = 35, branch_id = ? WHERE user_id = ?', [id, user_id]);
            const userRow = await query('SELECT employee_id FROM users WHERE user_id = ?', [user_id]);
            if (userRow.length > 0 && userRow[0].employee_id) {
                await query('UPDATE employees SET branch_id = ?, role_id = 35 WHERE employee_id = ?', [id, userRow[0].employee_id]);
            }
            return res.status(200).json({
                success: true,
                message: `User successfully appointed as Branch Admin for ${branch.name}.`
            });
        }

        // Case B: Creating a new user/employee as Branch Admin
        if (!user_name || !email) {
            return res.status(400).json({ success: false, message: 'Username and Email are required.' });
        }

        const bcrypt = require('bcryptjs');
        const defaultPassword = password || 'Branch@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const fullName = `${fname || ''} ${lname || ''}`.trim() || user_name;

        // Create employee record
        const empResult = await query(
            'INSERT INTO employees (name, fname, lname, email, phone, branch_id, role_id, sex) VALUES (?, ?, ?, ?, ?, ?, 35, ?)',
            [fullName, fname || '', lname || '', email, phone || '', id, 'M']
        );
        const employee_id = empResult.insertId;

        // Create user record
        await query(
            'INSERT INTO users (employee_id, user_name, password, role_id, branch_id, status) VALUES (?, ?, ?, 35, ?, 1)',
            [employee_id, user_name, hashedPassword, id]
        );

        res.status(201).json({
            success: true,
            message: `Branch Admin ${user_name} created successfully for ${branch.name}. Default password is: ${defaultPassword}`
        });
    } catch (err) {
        console.error('Error assigning branch admin:', err);
        res.status(500).json({ success: false, message: 'Failed to assign branch admin', error: err.message });
    }
};

// ── 10. GET ALL ASSIGNED BRANCHES FOR A USER ─────────────────────────────────
exports.getUserBranches = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Fetch user's primary branch
        const userRow = await query('SELECT branch_id FROM users WHERE user_id = ?', [user_id]);
        if (!userRow || userRow.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const primaryBranchId = userRow[0].branch_id || 1;

        // Fetch extra branches from user_branches
        const extraRows = await query(`
            SELECT b.branch_id, b.name, b.name_amharic, b.code, b.tier_level, 0 AS is_primary
            FROM user_branches ub
            JOIN branches b ON ub.branch_id = b.branch_id
            WHERE ub.user_id = ?
        `, [user_id]);

        // Fetch primary branch details
        const primaryBranch = await query(`
            SELECT branch_id, name, name_amharic, code, tier_level, 1 AS is_primary
            FROM branches
            WHERE branch_id = ?
        `, [primaryBranchId]);

        const allAssigned = [...primaryBranch, ...extraRows.filter(r => r.branch_id !== primaryBranchId)];

        res.status(200).json({ success: true, data: allAssigned });
    } catch (err) {
        console.error('Error fetching user branches:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch user branches', error: err.message });
    }
};

// ── 11. ASSIGN USER TO AN ADDITIONAL BRANCH ──────────────────────────────────
exports.assignUserToBranch = async (req, res) => {
    try {
        if (!req.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Forbidden: Only Super Admin can assign users to multiple branches.' });
        }

        const { user_id } = req.params;
        const { branch_id } = req.body;

        if (!branch_id) {
            return res.status(400).json({ success: false, message: 'branch_id is required' });
        }

        await query(`
            INSERT INTO user_branches (user_id, branch_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE branch_id = VALUES(branch_id)
        `, [user_id, branch_id]);

        res.status(200).json({ success: true, message: 'User successfully assigned to additional branch.' });
    } catch (err) {
        console.error('Error assigning user to branch:', err);
        res.status(500).json({ success: false, message: 'Failed to assign user to branch', error: err.message });
    }
};

// ── 12. REMOVE USER FROM AN ADDITIONAL BRANCH ────────────────────────────────
exports.removeUserFromBranch = async (req, res) => {
    try {
        if (!req.is_super_admin) {
            return res.status(403).json({ success: false, message: 'Forbidden: Only Super Admin can modify branch assignments.' });
        }

        const { user_id, branch_id } = req.params;

        await query('DELETE FROM user_branches WHERE user_id = ? AND branch_id = ?', [user_id, branch_id]);

        res.status(200).json({ success: true, message: 'User removed from branch successfully.' });
    } catch (err) {
        console.error('Error removing user from branch:', err);
        res.status(500).json({ success: false, message: 'Failed to remove user from branch', error: err.message });
    }
};

