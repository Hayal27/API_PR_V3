const con = require("../models/db");

// Utility function to format database rows to camelCase
const formatResponse = (row) => {
  return {
    id: row.id || null,
    description: row.description || null,
    objectiveId: row.objective_id || null,
    specificGoalsName: row.specific_goals_name || null,
    details: row.details || null,
    baseline: row.baseline || null,
    plan: row.plan || null,
    measurement: row.measurement || null,
    deadline: row.deadline || null,
    priority: row.priority || null,
    year: row.year || null,
    month: row.month || null,
    day: row.day || null,
  };
};

// Function to fetch an objective by ID
const getObjective = (req, res) => {
  console.log("Fetching objective with request params:", req.params, "and user data:", req.user);

  const { user_id } = req.user || {}; // Ensure user is authenticated
  if (!user_id) {
    console.error("User authentication failed: user_id is missing.");
    return res.status(401).json({ message: "User not authenticated." });
  }

  const { objectiveId } = req.params;
  if (!objectiveId) {
    console.error("Objective ID is required but not provided.");
    return res.status(400).json({ message: "Objective ID is required." });
  }

  const query = "SELECT objective_id AS objective_id, description FROM objectives WHERE objective_id = ? AND user_id = ?";
  console.log("Executing query:", query, "with parameters:", [objectiveId, user_id]);

  if (!con) {
    console.error("Database connection is not initialized.");
    return res.status(500).json({ message: "Database connection error." });
  }

  con.query(query, [objectiveId, user_id], (err, result) => {
    if (err) {
      console.error("Database error while fetching objective:", err.message);
      return res.status(500).json({ message: "Error fetching objective. Please try again." });
    }

    if (result.length === 0) {
      console.warn("Objective not found for ID:", objectiveId);
      return res.status(404).json({ message: "Objective not found." });
    }

    console.log("Objective fetched successfully:", result[0]);
    res.status(200).json(formatResponse(result[0]));
  });
};

// Function to fetch a goal by ID
const getGoals = (req, res) => {
  console.log("Fetching goal with request params:", req.params);

  const { goalId } = req.params;
  if (!goalId) {
    console.error("Goal ID is required but not provided.");
    return res.status(400).json({ message: "Goal ID is required." });
  }

  const query = "SELECT id, description FROM goals WHERE id = ?";
  console.log("Executing query:", query, "with parameters:", [goalId]);

  if (!con) {
    console.error("Database connection is not initialized.");
    return res.status(500).json({ message: "Database connection error." });
  }

  con.query(query, [goalId], (err, result) => {
    if (err) {
      console.error("Database error while fetching goal:", err.message);
      return res.status(500).json({ message: "Error fetching goal. Please try again." });
    }

    if (result.length === 0) {
      console.warn("Goal not found for ID:", goalId);
      return res.status(404).json({ message: "Goal not found." });
    }

    console.log("Goal fetched successfully:", result[0]);
    res.status(200).json(formatResponse(result[0]));
  });
};

// Function to fetch a specific goal by ID
const getSpecificGoal = (req, res) => {
  console.log("Fetching specific goal with request params:", req.params);

  const { specificGoalId } = req.params;
  if (!specificGoalId) {
    console.error("Specific Goal ID is required but not provided.");
    return res.status(400).json({ message: "Specific Goal ID is required." });
  }

  const query = "SELECT id,specific_goals_name,details,baseline,plan,measurement, specific_goalsFROM specific_goals WHERE id = ?";
  console.log("Executing query:", query, "with parameters:", [specificGoalId]);

  if (!con) {
    console.error("Database connection is not initialized.");
    return res.status(500).json({ message: "Database connection error." });
  }

  con.query(query, [specificGoalId], (err, result) => {
    if (err) {
      console.error("Database error while fetching specific goal:", err.message);
      return res.status(500).json({ message: "Error fetching specific goal. Please try again." });
    }

    if (result.length === 0) {
      console.warn("Specific goal not found for ID:", specificGoalId);
      return res.status(404).json({ message: "Specific Goal not found." });
    }

    console.log("Specific goal fetched successfully:", result[0]);
    res.status(200).json(formatResponse(result[0]));
  });
};

// get spesific objectives function
const getSpesificObjectives = async (req, res) => {
  try {
    const sql = "SELECT specific_objective_name FROM specific_objectives";
    con.query(sql, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      // Send result as JSON.
      res.json(results);
    });
  } catch (error) {
    console.error("Error in getSpesificObjectives:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get department

const getdepartment = async (req, res) => {
  try {
    const sql = "SELECT name FROM departmens";
    con.query(sql, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      // Send result as JSON.
      res.json(results);
    });
  } catch (error) {
    console.error("Error in getdepartment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserRoles = async (req, res) => {
  try {
    // Assuming that the current user's ID is available in req.user_id from verifyToken middleware
    const user_id = req.user_id;
    if (!user_id) {
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
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User role not found" });
      }
      res.json(results[0]);
    });
  } catch (error) {
    console.error("Error in getUserRole:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
// const getProfilePic = async (req, res) => {
//   try {
//     // Assuming that the current user's ID is available in req.user_id from verifyToken middleware
//     const user_id = req.user_id;
//     if (!user_id) {
//       return res.status(400).json({ error: "User ID not provided" });
//     }
//     const sql = `
//       SELECT avatar_url
//       FROM users
//       WHERE user_id = ?
//     `;
//     con.query(sql, [user_id], (err, results) => {
//       if (err) {
//         console.error("Database query error:", err);
//         return res.status(500).json({ error: "Internal server error" });
//       }
//       if (results.length === 0) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       res.json(results[0]);
//     });
//   } catch (error) {
//     console.error("Error in getProfilePic:", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// Exporting all functions
module.exports = {

  getUserRoles,
  getObjective,
  getGoals,
  getSpecificGoal,
  getSpesificObjectives,
  getdepartment
};

