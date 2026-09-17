// employeeController.js
// importing db connection
const con = require("../models/db");
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const util = require("util");
// Function to add a new employee and create a corresponding user

const addEmployee = async (req, res) => {
    const {
        name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex, telegram_username
    } = req.body;

    try {
        // Promisify the query method for easier async handling
        const query = util.promisify(con.query).bind(con);

        // Sync organization structure to departments if needed
        if (department_id) {
            try {
                const deptExists = await query('SELECT 1 FROM departments WHERE department_id = ?', [department_id]);
                if (!deptExists || deptExists.length === 0) {
                    const orgUnit = await query('SELECT name FROM organization_structure WHERE id = ?', [department_id]);
                    if (orgUnit && orgUnit.length > 0) {
                        await query('INSERT INTO departments (department_id, name) VALUES (?, ?)', [department_id, orgUnit[0].name]);
                        console.log(`Synced organization unit ${department_id} (${orgUnit[0].name}) to departments table`);
                    }
                }
            } catch (syncError) {
                console.error("Error syncing department:", syncError);
                // Continue, let the FK constraint fail if it must
            }
        }

        // Insert the new employee into the Employees table
        const employeeResult = await query(
            'INSERT INTO employees (name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex, telegram_username) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, role_id, department_id || null, supervisor_id || null, fname, lname, email, phone, sex, telegram_username || null]
        );

        // Check if the employee insertion was successful
        if (!employeeResult || !employeeResult.insertId) {
            console.error("Employee insertion failed.");
            return res.status(500).json({ message: "Failed to insert employee data into the database." });
        }

        // Get the employee ID of the newly created employee
        const employee_id = employeeResult.insertId;

        // Set up default username and password for the new user
        const defaultUsername = email; // Username set as employee's email
        const defaultPassword = 'itp@123'; // Default password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10); // Hash the password for security

        // Insert the user data into the Users table with role_id included
        const userResult = await query(
            'INSERT INTO users (employee_id, user_name, password, role_id) VALUES (?, ?, ?, ?)',
            [employee_id, defaultUsername, hashedPassword, role_id]
        );

        // Check if the user insertion was successful
        if (!userResult || !userResult.insertId) {
            console.error("User account creation failed.");
            return res.status(500).json({ message: "Failed to create user account for employee." });
        }

        // Respond with success message and employee ID
        res.json({ employee_id, message: 'Employee and user created successfully.' });
    } catch (error) {
        console.error("Error registering employee and user:", error);
        res.status(500).json({ message: "Failed to register employee and create user." });
    }
};


// Function to fetch all departments
const getAllDepartments = (req, res) => {
    con.query('SELECT * FROM departments', (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            return res.status(500).json({ message: 'Error fetching departments' });
        }
        res.json(results);
    });
};

// Function to fetch all roles
const getAllRoles = (req, res) => {
    con.query('SELECT * FROM roles', (err, results) => {
        if (err) {
            console.error('Error fetching roles:', err);
            return res.status(500).json({ message: 'Error fetching roles' });
        }
        res.json(results); // Send role_name and role_name to the frontend
    });
};

// Function to fetch all supervisors
const getAllSupervisors = (req, res) => {
    con.query('SELECT * FROM employees', (err, results) => {
        if (err) {
            console.error('Error fetching supervisors:', err);
            return res.status(500).json({ message: 'Error fetching supervisors' });
        }
        res.json(results);
    });
};

// Function to fetch supervisors with user details for plan referral
const getSupervisorsForReferral = (req, res) => {
    const query = `
        SELECT 
            e.employee_id,
            e.fname as first_name,
            e.lname as last_name,
            e.email,
            e.name as employee_name,
            d.name as department,
            r.role_name,
            u.user_id
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN roles r ON e.role_id = r.role_id
        LEFT JOIN users u ON e.employee_id = u.employee_id
        WHERE u.user_id IS NOT NULL
        AND r.role_name IN ('Admin', 'Deputy CEO', 'General manager', 'deputy manager', 'service head', 'Team leader')
        ORDER BY e.fname, e.lname
    `;

    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching supervisors for referral:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching supervisors'
            });
        }
        res.json({
            success: true,
            supervisors: results
        });
    });
};

// Function to fetch all employees with detailed information
const getAllEmployees = (req, res) => {
    const query = `
        SELECT
            e.*,
            r.role_name,
            d.name as department_name,
            supervisor.fname as supervisor_fname,
            supervisor.lname as supervisor_lname,
            u.status as user_status,
            u.created_at as user_created_at
        FROM employees e
        LEFT JOIN roles r ON e.role_id = r.role_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN employees supervisor ON e.supervisor_id = supervisor.employee_id
        LEFT JOIN users u ON e.employee_id = u.employee_id
        ORDER BY e.employee_id DESC
    `;

    con.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return res.status(500).json({ message: 'Error fetching employees' });
        }
        res.json(results);
    });
};

// Function to get employee statistics for dashboard
const getEmployeeStatistics = async (req, res) => {
    try {
        const query = util.promisify(con.query).bind(con);

        // Get total employees
        const totalEmployeesResult = await query('SELECT COUNT(*) as total FROM employees');
        const totalEmployees = totalEmployeesResult[0].total;

        // Get active users (employees with active user accounts)
        const activeUsersResult = await query(`
            SELECT COUNT(*) as active
            FROM employees e
            INNER JOIN users u ON e.employee_id = u.employee_id
            WHERE u.status = '1'
        `);
        const activeUsers = activeUsersResult[0].active;

        // 1. Fetch organization structure nodes for hierarchical rollup
        const orgNodes = await query(`
            SELECT id, name, name_amharic, type, parent_id, level
            FROM organization_structure
        `);
        const orgMap = {};
        (orgNodes || []).forEach(n => { orgMap[n.id] = n; });

        // Map legacy departments table IDs to canonical org_structure IDs
        const legacyMap = {
            1: 32, // 'አካውንቲንግ እና ፋይናንስ' -> Finance Dept
            2: 11, // 'ኢንፎርሜሽን ቴክኖሎጂ ልማት' -> IT Directorate
            3: 12, // 'ኮንስትራክሽን' -> Construction Sector
            4: 43, // 'ኦዲት' -> Internal Audit Service
            5: 27, // 'ቢዝነስ ዴቨሎፕመንት' -> Marketing & Business Dev
            6: 44, // 'ህግ' -> Law Department
            10: 10, // Deputy CEO
            11: 11, // IT Sector
            12: 12, // Construction Sector
            14: 14, // Digital Service
            15: 15, // Research Section
            16: 16, // Incubation Section
            17: 17, // Network & Infra
            18: 18, // Software development
            27: 27, // Marketing
            37: 37, // Procurement
            45: 45, // Strategic Advisor
            50: 50, // Plan and followup
            52: 52  // Specialist
        };

        // Helper to resolve an employee's org position up to their parent Directorate / Department
        const resolveOrgUnit = (nodeId) => {
            if (!nodeId || !orgMap[nodeId]) return null;
            let curr = orgMap[nodeId];
            let path = [curr];
            while (curr.parent_id && orgMap[curr.parent_id]) {
                curr = orgMap[curr.parent_id];
                path.unshift(curr);
            }

            // Find Directorate / Sector level
            let directorate = path.find(n =>
                n.type === 'Directorate' ||
                n.type === 'Sector' ||
                (n.name || '').toLowerCase().includes('directorate') ||
                (n.name || '').toLowerCase().includes('sector')
            );
            if (!directorate) {
                directorate = path.find(n => n.id !== 9 && n.id !== 10 && (n.level === 2 || n.level === 3));
            }
            if (!directorate && path.some(n => n.id === 9 || n.id === 10 || n.id === 45)) {
                directorate = {
                    id: 9,
                    name: 'Executive Office (ዋና ሥራ አስፈፃሚ ጽ/ቤት)',
                    name_amharic: 'ዋና ሥራ አስፈፃሚ ጽ/ቤት',
                    type: 'Executive'
                };
            }

            // Find Department level
            let department = path.find(n => n.type === 'Department' || (n.name || '').toLowerCase().includes('department'));
            if (!department) {
                department = directorate || path[path.length - 1];
            }

            return {
                directorate: directorate || path[path.length - 1],
                department
            };
        };

        // Fetch all employees with their employee_positions and fallback department_id
        const empOrgRows = await query(`
            SELECT
                e.employee_id,
                e.department_id,
                ep.org_node_id
            FROM employees e
            LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
        `);

        const dirCounts = {};
        const deptCounts = {};

        empOrgRows.forEach(emp => {
            const targetNodeId = emp.org_node_id || legacyMap[emp.department_id] || emp.department_id;
            const resolved = resolveOrgUnit(targetNodeId);

            if (resolved) {
                const dirName = (resolved.directorate.name_amharic || resolved.directorate.name || 'General Operations').trim();
                dirCounts[dirName] = (dirCounts[dirName] || 0) + 1;

                const deptName = (resolved.department.name_amharic || resolved.department.name || dirName).trim();
                deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
            } else {
                dirCounts['ያልተመደበ (Unassigned)'] = (dirCounts['ያልተመደበ (Unassigned)'] || 0) + 1;
                deptCounts['ያልተመደበ (Unassigned)'] = (deptCounts['ያልተመደበ (Unassigned)'] || 0) + 1;
            }
        });

        // Sorted arrays for directorates and sub-departments
        const directorateStatsResult = Object.entries(dirCounts).map(([name, count]) => ({
            department_name: name,
            employee_count: count,
            unit_type: 'Directorate'
        })).sort((a, b) => b.employee_count - a.employee_count);

        const subDeptStatsResult = Object.entries(deptCounts).map(([name, count]) => ({
            department_name: name,
            employee_count: count,
            unit_type: 'Department'
        })).sort((a, b) => b.employee_count - a.employee_count);

        // Get employees by role
        const roleStatsResult = await query(`
            SELECT
                r.role_name,
                COUNT(e.employee_id) as employee_count
            FROM roles r
            LEFT JOIN employees e ON r.role_id = e.role_id
            GROUP BY r.role_id, r.role_name
            ORDER BY employee_count DESC
        `);

        // Get recent registrations (last 30 days)
        const recentRegistrationsResult = await query(`
            SELECT COUNT(*) as recent
            FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        const recentRegistrations = recentRegistrationsResult[0].recent;

        // Get gender distribution
        const genderStatsResult = await query(`
            SELECT
                sex,
                COUNT(*) as count
            FROM employees
            WHERE sex IS NOT NULL
            GROUP BY sex
        `);

        res.json({
            totalEmployees,
            activeUsers,
            inactiveUsers: totalEmployees - activeUsers,
            recentRegistrations,
            departmentStats: directorateStatsResult,
            subDepartmentStats: subDeptStatsResult,
            roleStats: roleStatsResult,
            genderStats: genderStatsResult
        });

    } catch (error) {
        console.error('Error fetching employee statistics:', error);
        res.status(500).json({ message: 'Error fetching employee statistics' });
    }
};

// Function to get recent employee activities
const getRecentActivities = async (req, res) => {
    try {
        const query = util.promisify(con.query).bind(con);

        const recentActivitiesResult = await query(`
            SELECT
                e.fname,
                e.lname,
                e.email,
                u.created_at,
                u.status,
                'registration' as activity_type
            FROM employees e
            INNER JOIN users u ON e.employee_id = u.employee_id
            ORDER BY u.created_at DESC
            LIMIT 10
        `);

        res.json(recentActivitiesResult);

    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({ message: 'Error fetching recent activities' });
    }
};

// Function to update employee information
const updateEmployee = async (req, res) => {
    const { employee_id } = req.params;
    const { name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex, telegram_username } = req.body;

    try {
        const query = util.promisify(con.query).bind(con);

        const updateResult = await query(
            'UPDATE employees SET name = ?, role_id = ?, department_id = ?, supervisor_id = ?, fname = ?, lname = ?, email = ?, phone = ?, sex = ?, telegram_username = ? WHERE employee_id = ?',
            [name, role_id, department_id || null, supervisor_id || null, fname, lname, email, phone, sex, telegram_username || null, employee_id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({ message: 'Employee updated successfully' });

    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Error updating employee' });
    }
};

// Function to delete employee
const deleteEmployee = async (req, res) => {
    const { employee_id } = req.params;

    try {
        const query = util.promisify(con.query).bind(con);

        // First delete the user account
        await query('DELETE FROM users WHERE employee_id = ?', [employee_id]);

        // Then delete the employee
        const deleteResult = await query('DELETE FROM employees WHERE employee_id = ?', [employee_id]);

        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json({ message: 'Employee deleted successfully' });

    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Error deleting employee' });
    }
};

// --- Position Management ---

// Get positions for an employee
const getEmployeePositions = async (req, res) => {
    const { employee_id } = req.params;
    try {
        const query = util.promisify(con.query).bind(con);
        const results = await query(`
            SELECT ep.*, o.name as org_node_name, o.type as org_node_type 
            FROM employee_positions ep
            JOIN organization_structure o ON ep.org_node_id = o.id
            WHERE ep.employee_id = ?
            ORDER BY ep.is_primary DESC, ep.created_at ASC
        `, [employee_id]);
        res.json({ success: true, positions: results });
    } catch (error) {
        console.error("Error fetching employee positions:", error);
        res.status(500).json({ success: false, message: "Error fetching employee positions" });
    }
};

// Add position to an employee
const addEmployeePosition = async (req, res) => {
    const { employee_id } = req.params;
    const { org_node_id, is_primary, is_delegation } = req.body;
    try {
        const query = util.promisify(con.query).bind(con);
        
        // If making primary, un-primary others
        if (is_primary) {
            await query('UPDATE employee_positions SET is_primary = 0 WHERE employee_id = ?', [employee_id]);
        }

        // Check for duplicate
        const exist = await query('SELECT id FROM employee_positions WHERE employee_id = ? AND org_node_id = ?', [employee_id, org_node_id]);
        if (exist.length > 0) {
            return res.status(400).json({ success: false, message: 'Employee already assigned to this position' });
        }

        const result = await query(
            'INSERT INTO employee_positions (employee_id, org_node_id, is_primary, is_delegation) VALUES (?, ?, ?, ?)',
            [employee_id, org_node_id, is_primary ? 1 : 0, is_delegation ? 1 : 0]
        );
        res.json({ success: true, message: 'Position added successfully', id: result.insertId });
    } catch (error) {
        console.error("Error adding employee position:", error);
        res.status(500).json({ success: false, message: "Error adding position" });
    }
};

// Update an employee position (e.g. toggle primary/delegation)
const updateEmployeePosition = async (req, res) => {
    const { employee_id, position_id } = req.params;
    const { is_primary, is_delegation } = req.body;
    try {
        const query = util.promisify(con.query).bind(con);
        
        if (is_primary) {
            await query('UPDATE employee_positions SET is_primary = 0 WHERE employee_id = ?', [employee_id]);
        }
        
        await query(
            'UPDATE employee_positions SET is_primary = ?, is_delegation = ? WHERE id = ? AND employee_id = ?',
            [is_primary ? 1 : 0, is_delegation ? 1 : 0, position_id, employee_id]
        );
        res.json({ success: true, message: 'Position updated successfully' });
    } catch (error) {
        console.error("Error updating employee position:", error);
        res.status(500).json({ success: false, message: "Error updating position" });
    }
};

// Remove position from an employee
const removeEmployeePosition = async (req, res) => {
    const { employee_id, position_id } = req.params;
    try {
        const query = util.promisify(con.query).bind(con);
        await query('DELETE FROM employee_positions WHERE id = ? AND employee_id = ?', [position_id, employee_id]);
        res.json({ success: true, message: 'Position removed successfully' });
    } catch (error) {
        console.error("Error removing employee position:", error);
        res.status(500).json({ success: false, message: "Error removing position" });
    }
};

// Exporting the functions for use in routes
module.exports = {
    getAllDepartments,
    getAllRoles,
    getAllSupervisors,
    getSupervisorsForReferral,
    addEmployee,
    getAllEmployees,
    getEmployeeStatistics,
    getRecentActivities,
    updateEmployee,
    deleteEmployee,
    getEmployeePositions,
    addEmployeePosition,
    updateEmployeePosition,
    removeEmployeePosition
};
