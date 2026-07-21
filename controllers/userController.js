// controllers/userController.js

const con = require("../models/db"); // Assumes you have a db.js file that exports the database connection
const bcrypt = require('bcryptjs');
const util = require('util');



const updateUser = async (req, res) => {
  const { user_id } = req.params;
  // Expecting role_id from the req.body as a number (or numeric string)
  // Also accepting supervisor_id for optionally updating the supervisor field
  const { fname, lname, user_name, phone, department_id, role_id, supervisor_id } = req.body;

  // Convert role_id to an integer and check validity (if needed)
  const parsedRoleID = parseInt(role_id, 10);
  if (isNaN(parsedRoleID)) {
    console.error("Invalid role_id provided:", role_id);
    return res.status(400).json({ message: "Invalid role_id provided" });
  }

  try {
    // Promisify the query function for async/await usage
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

    // Retrieve the employee_id from the users table
    const usersData = await query("SELECT employee_id FROM users WHERE user_id = ?", [user_id]);
    if (!usersData || usersData.length === 0) {
      console.error("User not found for update, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }
    const employee_id = usersData[0].employee_id;

    // Log for debugging to verify the parsed role id
    const { fname, lname, user_name, phone, supervisor_id, telegram_username } = req.body; // Destructure remaining body fields here

    console.log(`Updating user_id ${user_id} with role_id ${parsedRoleID}`);

    // Update the employees table for personal details, including optional supervisor_id
    if (employee_id) {
      const empResult = await query(
        "UPDATE employees SET fname = ?, lname = ?, phone = ?, department_id = ?, supervisor_id = ?, telegram_username = ? WHERE employee_id = ?",
        [fname, lname, phone, department_id, supervisor_id || null, telegram_username || null, employee_id]
      );
      console.log("Employee update result for employee_id:", employee_id, empResult);
    }

    // Update the users table with account details - updating the role_id.
    const userResult = await query(
      "UPDATE users SET user_name = ?, role_id = ? WHERE user_id = ?",
      [user_name, parsedRoleID, user_id]
    );
    console.log("User update result:", userResult);

    // Check if the role update affected any rows. If not, log and return error message.
    if (userResult.affectedRows === 0) {
      const errorMsg = `No rows were updated for the user_id ${user_id}. This might mean the provided role_id ${parsedRoleID} is invalid or unchanged.`;
      console.error(errorMsg);
      return res.status(400).json({ message: errorMsg });
    }

    console.log("User account updated for user_id:", user_id);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};



// Get all roles
const getAllRoles = (req, res) => {
  con.query("SELECT * FROM role", (err, results) => {
    if (err) {
      console.error("Error retrieving roles:", err);
      return res.status(500).json({ message: "Error retrieving roles", error: err });
    }
    console.log("Fetched roles:", results);
    res.json(results);
  });
};

// Get all departments
const getDepartment = (req, res) => {
  con.query("SELECT * FROM department", (err, results) => {
    if (err) {
      console.error("Error retrieving department:", err);
      return res.status(500).json({ message: "Error retrieving department", error: err });
    }
    console.log("Fetched departments:", results);
    res.json(results);
  });
};

// Get all users (including employee details if available)
// We use LEFT JOIN with employees table so that employee fields (fname, lname, phone) override users fields

const getAllUsers = (req, res) => {
  const query = `
    SELECT u.*, e.*
    FROM users u 
    LEFT JOIN employees e ON u.employee_id = e.employee_id
  `;
  con.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving users:", err);
      return res.status(500).json({ message: "Error retrieving users", error: err });
    }
    console.log("Fetched users:", results);
    res.json(results);
  });
};


// Change user status active (1) or inactive (0)
const changeUserStatus = (req, res) => {
  const { user_id } = req.params;
  const { status } = req.body;

  if (status !== 0 && status !== 1) {
    console.error("Invalid status provided:", status);
    return res.status(400).json({ message: "Invalid status. Use 0 for inactive and 1 for active." });
  }

  con.query("UPDATE users SET status = ? WHERE user_id = ?", [status, user_id], (err, result) => {
    if (err) {
      console.error("Error updating user status:", err);
      return res.status(500).json({ message: "Error updating user status", error: err });
    }

    if (result.affectedRows === 0) {
      console.error("User not found for update, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User status updated successfully for user_id:", user_id, "New status:", status);
    res.json({ message: "User status updated successfully" });
  });
};



// Delete user - using correct table name (users)
const deleteUser = (req, res) => {
  const { user_id } = req.params;

  con.query("DELETE FROM users WHERE user_id = ?", [user_id], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ message: "Error deleting user", error: err });
    }

    if (result.affectedRows === 0) {
      console.error("User not found for deletion, user_id:", user_id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User deleted successfully, user_id:", user_id);
    res.json({ message: "User deleted successfully" });
  });

};


const changeStatus = async (status, user_id) => {
  try {
    const response = await fetch(`https://api.pr.ethiopianitpark.et/api/users/${user_id}/status`, {
      method: "PUT",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await response.json(); // Parse the response
    console.log('API Response:', data); // Log the API response for debugging

    if (response.ok) {
      const action = status === 1 ? 'activated' : 'deactivated';
      setModalMessage(`User has been successfully ${action}.`);
      setShowModal(true);
      fetchUsers(); // Refresh users after status change
    } else {
      setModalMessage(data.message || 'Error changing user status. Please try again.');
      setShowModal(true);
    }
  } catch (error) {
    console.log("Error changing status:", error);
    setModalMessage('Error changing user status. Please try again.');
    setShowModal(true);
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
      WHERE u.user_id = ?
    `;
    con.query(sql, [user_id], (err, results) => {
      if (err) {
        console.error("Database query error for user roles:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        console.error("User role not found for user_id:", user_id);
        return res.status(404).json({ error: "User role not found" });
      }
      console.log("Fetched user role for user_id:", user_id, results[0]);
      res.json(results[0]);
    });
  } catch (error) {
    console.error("Error in getUserRoles:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};




module.exports = {

  getUserRoles,

  getAllRoles,
  getDepartment,
  getAllUsers, // Updated function name here
  changeUserStatus,
  updateUser,
  deleteUser,
  changeUserStatus,
  updateUser
};