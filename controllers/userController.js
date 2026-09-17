// controllers/userController.js

const { Users, Employees, Departments, OrganizationStructure, Roles, sequelize } = require('../models/index');
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { logAudit, AUDIT_ACTIONS } = require('../middleware/auditLogger');

const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { fname, lname, user_name, phone, department_id, role_id, supervisor_id, telegram_username } = req.body;

  // Convert role_id to an integer and check validity
  const parsedRoleID = parseInt(role_id, 10);
  if (isNaN(parsedRoleID)) {
    console.error("Invalid role_id provided:", role_id);
    return res.status(400).json({ message: "Invalid role_id provided" });
  }

  try {
    // Sync organization structure to departments if needed
    if (department_id) {
      try {
        const deptExists = await Departments.findByPk(department_id, { raw: true });
        if (!deptExists) {
          const orgUnit = await OrganizationStructure.findByPk(department_id, { raw: true });
          if (orgUnit) {
            await Departments.create({ department_id, name: orgUnit.name });
            console.log(`Synced organization unit ${department_id} (${orgUnit.name}) to departments table`);
          }
        }
      } catch (syncError) {
        console.error("Error syncing department:", syncError);
      }
    }

    // Retrieve employee_id from the users table
    const user = await Users.findByPk(user_id, { raw: true });
    if (!user) {
      console.error("User not found for update, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }
    const employee_id = user.employee_id;

    console.log(`Updating user_id ${user_id} with role_id ${parsedRoleID}`);

    // Update the employees table for personal details
    if (employee_id) {
      const empUpdateData = {};
      if (fname !== undefined) empUpdateData.fname = fname;
      if (lname !== undefined) empUpdateData.lname = lname;
      if (phone !== undefined) empUpdateData.phone = phone;
      if (department_id !== undefined) empUpdateData.department_id = department_id;
      if (supervisor_id !== undefined) empUpdateData.supervisor_id = supervisor_id || null;
      if (telegram_username !== undefined) empUpdateData.telegram_username = telegram_username || null;

      const [empResult] = await Employees.update(empUpdateData, {
        where: { employee_id }
      });
      console.log("Employee update result for employee_id:", employee_id, empResult);
    }

    // Update the users table with account details - role_id and user_name
    const userUpdateData = { role_id: parsedRoleID };
    if (user_name !== undefined) userUpdateData.user_name = user_name;

    const [userResult] = await Users.update(userUpdateData, {
      where: { user_id }
    });
    console.log("User update result:", userResult);

    if (userResult === 0 && user.role_id === parsedRoleID && user.user_name === user_name) {
      // Nothing changed, which is fine, or check if row exists
    } else if (userResult === 0 && !user) {
      const errorMsg = `No rows were updated for the user_id ${user_id}. This might mean the provided role_id ${parsedRoleID} is invalid or unchanged.`;
      console.error(errorMsg);
      return res.status(400).json({ message: errorMsg });
    }

    console.log("User account updated for user_id:", user_id);
    logAudit(req.user_id, AUDIT_ACTIONS.USER_UPDATE || 'USER_UPDATE', `Updated user ID ${user_id}: role=${parsedRoleID}, name=${fname} ${lname}`, {
      target_user_id: user_id, role_id: parsedRoleID, fname, lname, user_name, department_id, supervisor_id
    }, req).catch(() => {});

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const results = await Roles.findAll({ raw: true });
    return res.json(results);
  } catch (err) {
    console.error("Error retrieving roles:", err);
    return res.status(500).json({ message: "Error retrieving roles", error: err.message });
  }
};

// Get all departments
const getDepartment = async (req, res) => {
  try {
    const results = await Departments.findAll({ raw: true });
    return res.json(results);
  } catch (err) {
    console.error("Error retrieving department:", err);
    return res.status(500).json({ message: "Error retrieving department", error: err.message });
  }
};

// Get all users (including employee details if available)
const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT
        u.*,
        e.*,
        u.status AS status
      FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
    `;

    const results = await sequelize.query(query, { type: QueryTypes.SELECT });

    // Ensure status is always a proper integer (0 or 1) from users table
    const normalized = results.map(r => ({
      ...r,
      status: r.status !== undefined && r.status !== null ? Number(r.status) : 0
    }));

    return res.json(normalized);
  } catch (err) {
    console.error("Error retrieving users:", err);
    return res.status(500).json({ message: "Error retrieving users", error: err.message });
  }
};

// Change user status active (1) or inactive (0)
const changeUserStatus = async (req, res) => {
  const { user_id } = req.params;
  const { status } = req.body;

  if (status !== 0 && status !== 1) {
    console.error("Invalid status provided:", status);
    return res.status(400).json({ message: "Invalid status. Use 0 for inactive and 1 for active." });
  }

  try {
    const [affectedRows] = await Users.update(
      { status: String(status) },
      { where: { user_id } }
    );

    if (affectedRows === 0) {
      console.error("User not found for update, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User status updated successfully for user_id:", user_id, "New status:", status);
    logAudit(req.user_id, AUDIT_ACTIONS.USER_STATUS_CHANGE || 'USER_STATUS_CHANGE', `Changed status of user ID ${user_id} to ${status === 1 ? 'Active' : 'Inactive'}`, {
      target_user_id: user_id, status, status_label: status === 1 ? 'Active' : 'Inactive'
    }, req).catch(() => {});

    return res.json({ message: "User status updated successfully" });
  } catch (err) {
    console.error("Error updating user status:", err);
    return res.status(500).json({ message: "Error updating user status", error: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const affectedRows = await Users.destroy({
      where: { user_id }
    });

    if (affectedRows === 0) {
      console.error("User not found for deletion, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User deleted successfully, user_id:", user_id);
    logAudit(req.user_id, AUDIT_ACTIONS.USER_DELETE || 'USER_DELETE', `Deleted user ID ${user_id}`, {
      target_user_id: user_id
    }, req).catch(() => {});

    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

const getUserRoles = async (req, res) => {
  try {
    const user_id = req.user_id;
    if (!user_id) {
      console.error("User ID not provided in request.");
      return res.status(400).json({ error: "User ID not provided" });
    }

    const sql = `
      SELECT r.role_name
      FROM roles r
      INNER JOIN users u ON u.role_id = r.role_id
      WHERE u.user_id = :user_id
    `;

    const results = await sequelize.query(sql, {
      replacements: { user_id },
      type: QueryTypes.SELECT
    });

    if (results.length === 0) {
      console.error("User role not found for user_id:", user_id);
      return res.status(404).json({ error: "User role not found" });
    }

    console.log("Fetched user role for user_id:", user_id, results[0]);
    return res.json(results[0]);
  } catch (error) {
    console.error("Error in getUserRoles:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUserRoles,
  getAllRoles,
  getDepartment,
  getAllUsers,
  changeUserStatus,
  updateUser,
  deleteUser
};