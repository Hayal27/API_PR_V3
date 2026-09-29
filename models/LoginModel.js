
const con = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logAudit, AUDIT_ACTIONS } = require('../middleware/auditLogger');

// Secret key (as specified in your requirements)
const JWT_SECRET_KEY = 'hayaltamrat@27';

// Function to handle login
const getLogin = async (req, res) => {
    const user_name = req.body.user_name || req.body.username;
    const pass = req.body.pass || req.body.password;

    // Validate that pass is provided
    if (!pass) {
        // Log failed login attempt
        await logAudit(null, AUDIT_ACTIONS.LOGIN_FAILED, `Login failed: Password not provided for username ${user_name}`, {
            username: user_name,
            reason: 'missing_password'
        }, req).catch(err => console.error('Audit log error:', err));

        return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Updated query: join employees, roles, branches, and central headquarter org structure
    const query = `
      SELECT 
        u.*, 
        e.fname, e.lname, e.email, e.phone, e.sex, e.position, e.supervisor_id, e.department_id,
        COALESCE(u.branch_id, e.branch_id, 1) AS branch_id,
        r.role_name,
        b.name AS branch_name,
        b.name_amharic AS branch_name_amharic,
        b.code AS branch_code,
        b.tier_level AS branch_tier,
        ep.org_node_id,
        os.level AS org_level,
        os.name AS org_node_name,
        os.type AS org_node_type,
        os.branch_id AS org_branch_id
      FROM users u 
      LEFT JOIN employees e ON u.employee_id = e.employee_id 
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN branches b ON COALESCE(u.branch_id, e.branch_id, 1) = b.branch_id
      LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
      LEFT JOIN organization_structure os ON ep.org_node_id = os.id
      WHERE u.user_name = ?
    `;

    con.query(query, [user_name], async (err, results) => {
        if (err) {
            console.error('Database error:', err);

            // Log system error
            await logAudit(null, AUDIT_ACTIONS.SYSTEM_ERROR, `Database error during login for ${user_name}`, {
                error: err.message,
                username: user_name
            }, req).catch(err => console.error('Audit log error:', err));

            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length === 0) {
            // Log failed login attempt - user not found
            await logAudit(null, AUDIT_ACTIONS.LOGIN_FAILED, `Login failed: User not found - ${user_name}`, {
                username: user_name,
                reason: 'user_not_found'
            }, req).catch(err => console.error('Audit log error:', err));

            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const user = results[0];

        // Validate that user object has the password hash
        if (!user.password) {
            // Log failed login attempt - no password set
            await logAudit(user.user_id, AUDIT_ACTIONS.LOGIN_FAILED, `Login failed: Password not set for user ${user_name}`, {
                username: user_name,
                user_id: user.user_id,
                reason: 'password_not_set'
            }, req).catch(err => console.error('Audit log error:', err));

            return res.status(400).json({ success: false, message: 'User password not set' });
        }

        try {
            const passwordMatch = await bcrypt.compare(pass, user.password);
            if (passwordMatch && user.status === '1') {
                // Update user online status (non-blocking)
                con.query('UPDATE users SET online_flag=? WHERE user_id=?', [1, user.user_id], (error) => {
                    if (error) {
                        console.warn('Notice updating online status:', error.message);
                    }
                });

                const branch_id = Number(user.branch_id) || 1;
                const roleId = Number(user.role_id) || 0;
                const role_name = user.role_name || '';
                const roleLower = role_name.toLowerCase();

                // 1. Super Admin
                const is_super_admin = roleId === 34 || roleId === 1 || roleLower.includes('super admin') || roleLower === 'admin' || roleLower === 'system admin';
                const is_branch_admin = roleId === 35 || roleLower === 'branch admin';

                // 2. 1st two positions on the org structure on the central headquarter (branch_id = 1):
                // Level 1: CEO (org_node_id = 9, role_id = 29)
                // Level 2: Deputy CEO (org_node_id = 10, role_id = 2)
                const is_central_top2 = (
                    [29, 2].includes(roleId) ||
                    roleLower.includes('ceo') ||
                    roleLower.includes('deputy ceo') ||
                    [9, 10].includes(Number(user.org_node_id)) ||
                    (Number(user.org_branch_id || branch_id) === 1 && Number(user.org_level) > 0 && Number(user.org_level) <= 2)
                );

                const can_see_all_branches = is_super_admin || is_central_top2;

                user.branch_id = branch_id;
                user.role_name = role_name;
                user.is_super_admin = is_super_admin;
                user.is_branch_admin = is_branch_admin;
                user.is_central_top2 = is_central_top2;
                user.can_see_all_branches = can_see_all_branches;
                user.can_view_all_branches = can_see_all_branches;

                // Fetch additional assigned branches if user is assigned to multiple branches
                const extraBranches = await new Promise((resolve) => {
                    con.query('SELECT branch_id FROM user_branches WHERE user_id = ?', [user.user_id], (bErr, bRows) => {
                        if (bErr || !Array.isArray(bRows)) return resolve([]);
                        resolve(bRows.map(r => Number(r.branch_id)).filter(Boolean));
                    });
                });

                const assigned_branch_ids = Array.from(new Set([branch_id, ...extraBranches]));
                user.assigned_branch_ids = assigned_branch_ids;

                const branch_name = user.branch_name || (branch_id === 1 ? 'Federal Head Office' : 'Branch Office');
                const employee_fname = user.fname || '';
                const employee_lname = user.lname || '';
                const employee_name = user.name || (employee_fname ? `${employee_fname} ${employee_lname}`.trim() : user.user_name);

                user.branch_name = branch_name;
                user.fname = employee_fname;
                user.lname = employee_lname;
                user.name = employee_name;

                // Generate a JWT token with a 400h expiration
                const token = jwt.sign({ 
                    user_id: user.user_id, 
                    role_id: user.role_id,
                    role_name,
                    fname: employee_fname,
                    lname: employee_lname,
                    name: employee_name,
                    branch_id,
                    assigned_branch_ids,
                    org_node_id: user.org_node_id || null,
                    org_level: user.org_level || 0,
                    org_name: user.org_node_name || '',
                    branch_name,
                    is_super_admin,
                    is_branch_admin,
                    is_central_top2,
                    can_see_all_branches,
                    can_view_all_branches: can_see_all_branches
                }, JWT_SECRET_KEY, { expiresIn: '400h' });

                // Log successful login
                await logAudit(user.user_id, AUDIT_ACTIONS.LOGIN, `User ${user_name} logged in successfully`, {
                    username: user_name,
                    user_id: user.user_id,
                    role_id: user.role_id,
                    employee_id: user.employee_id,
                    employee_name: employee_name,
                    department_id: user.department_id,
                    branch_id,
                    login_time: new Date().toISOString()
                }, req).catch(err => console.error('Audit log error:', err));

                return res.status(200).json({ success: true, token, user });
            } else {
                // Log failed login attempt - invalid credentials or inactive user
                await logAudit(user.user_id, AUDIT_ACTIONS.LOGIN_FAILED, `Login failed: Invalid credentials or inactive account for ${user_name}`, {
                    username: user_name,
                    user_id: user.user_id,
                    reason: passwordMatch ? 'account_inactive' : 'invalid_password',
                    user_status: user.status
                }, req).catch(err => console.error('Audit log error:', err));

                return res.status(401).json({ success: false, message: 'Invalid username or password' });
            }
        } catch (error) {
            console.error('Error comparing passwords:', error);

            // Log system error
            await logAudit(user.user_id, AUDIT_ACTIONS.SYSTEM_ERROR, `Error validating credentials for ${user_name}`, {
                error: error.message,
                username: user_name,
                user_id: user.user_id
            }, req).catch(err => console.error('Audit log error:', err));

            return res.status(500).json({ success: false, message: 'Error validating credentials' });
        }
    });
};

// Function to handle logout
const logout = async (req, res) => {
    const id = req.params.user_id;

    // First, get user information before logging out
    con.query('SELECT u.*, e.name as employee_name FROM users u LEFT JOIN employees e ON u.employee_id = e.employee_id WHERE u.user_id = ?', [id], async (err, userResults) => {
        if (err) {
            console.error('Error fetching user for logout:', err);
        }

        const user = userResults && userResults.length > 0 ? userResults[0] : null;

        // Update user's online_flag to 0 to indicate logout
        con.query('UPDATE users SET online_flag=? WHERE user_id=?', [0, id], async (error, results) => {
            if (error) {
                console.error('Error updating logout status:', error);

                // Log system error
                await logAudit(id, AUDIT_ACTIONS.SYSTEM_ERROR, `Error during logout for user ID ${id}`, {
                    error: error.message,
                    user_id: id
                }, req).catch(err => console.error('Audit log error:', err));

                return res.status(500).send({ message: "Error updating logout status", error: error.message });
            } else {
                console.log('Logout status updated successfully', results);

                // Log successful logout
                await logAudit(id, AUDIT_ACTIONS.LOGOUT, `User ${user ? user.user_name : id} logged out`, {
                    user_id: id,
                    username: user ? user.user_name : 'Unknown',
                    employee_name: user ? user.employee_name : 'Unknown',
                    logout_time: new Date().toISOString()
                }, req).catch(err => console.error('Audit log error:', err));

                return res.status(200).send({ message: 'Logout successful' });
            }
        });
    });
};

module.exports = { getLogin, logout };
