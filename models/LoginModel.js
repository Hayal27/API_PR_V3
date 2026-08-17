
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

    // Updated query: join employees table using employee_id present in users table 
    const query = `
      SELECT u.*, e.*
      FROM users u 
      LEFT JOIN employees e ON u.employee_id = e.employee_id 
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

                // Generate a JWT token with a 400h expiration
                const token = jwt.sign({ user_id: user.user_id, role_id: user.role_id }, JWT_SECRET_KEY, { expiresIn: '400h' });

                // Log successful login
                await logAudit(user.user_id, AUDIT_ACTIONS.LOGIN, `User ${user_name} logged in successfully`, {
                    username: user_name,
                    user_id: user.user_id,
                    role_id: user.role_id,
                    employee_id: user.employee_id,
                    employee_name: user.name || `${user.fname} ${user.lname}`,
                    department_id: user.department_id,
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
