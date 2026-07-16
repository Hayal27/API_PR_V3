const con = require("../models/db");


// Get Objectives with Filtering by Year and Quarter
const jwt = require("jsonwebtoken");


const getGoals = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // You no longer need user_id, as we will fetch all objectives
    console.log("Decoded user_id from token:", decoded.user_id);

    const { year, quarter } = req.query; // Extract year and quarter from query parameters

    // Base query to fetch all goals
    let query = `
        SELECT goal_id, name, description, year, quarter, created_at, updated_at
        FROM goals
    `;

    const queryParams = [];

    // Add filters for year and quarter if provided
    if (year) {
      query += " WHERE year = ?";
      queryParams.push(year);
    }

    if (quarter) {
      if (queryParams.length === 0) {
        query += " WHERE quarter = ?";
      } else {
        query += " AND quarter = ?";
      }
      queryParams.push(quarter);
    }

    // Execute query
    con.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "Error fetching goals" });
      }

      res.status(200).json(results);
    });
  });
};




// Get Goals by Objective
const getObjectivesByGoals = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  // Verify the JWT token
  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    console.log("Decoded user_id from token:", user_id);

    // Extract and validate the goal_id from the query parameters
    const { goal_id } = req.query;
    if (!goal_id) {
      return res.status(400).json({ message: "Goal ID is required" });
    }

    // Construct the SQL query
    const query = `
    SELECT 
      objective_id,    -- Update to the correct column name
      goal_id, 
      name, 
      description 
    FROM objectives
    WHERE goal_id = ? 
  `;

    // Execute the query
    con.query(query, [goal_id, user_id], (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "Error fetching objectives from the database" });
      }

      // Handle the case where no results are found
      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No objectives found for the given goal ID." });
      }

      console.log("Objectives retrieved:", results);

      // Respond with the results
      res.status(200).json(results);
    });
  });
};



const getspesificObjectivesByGoals = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  // Verify the JWT token
  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    console.log("Decoded user_id from token:", user_id);

    // Extract and validate the objective_id from the query parameters
    const { objective_id } = req.query;
    if (!objective_id) {
      return res.status(400).json({ message: "Goal ID is required" });
    }

    // Construct the SQL query
    const query = `
    SELECT 
      specific_objective_id,    -- Update to the correct column name
      objective_id, 
      specific_objective_name, view
    FROM specific_objectives
    WHERE objective_id = ? 
  `;

    // Execute the query
    con.query(query, [objective_id, user_id], (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "Error fetching objectives from the database" });
      }

      // Handle the case where no results are found
      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No specific objectives found for the given goal ID." });
      }

      console.log("Specific Objectives retrieved:", results);

      // Respond with the results
      res.status(200).json(results);
    });
  });
};


// // Get Specific Goals by Goal
// const getSpecificGoalsByGoal = (req, res) => {
//   const { goalId } = req.params;
//   const { user_id } = req.user;

//   const query = `
//     SELECT id, specific_goals_name, details, baseline, plan, created_at, updated_at
//     FROM specific_goals
//     WHERE goal_id = ? AND user_id = ?
//   `;

//   con.query(query, [goalId, user_id], (err, results) => {
//     if (err) {
//       console.error("Database Error:", err.message);
//       return res.status(500).json({ message: "Error fetching specific goals" });
//     }

//     res.status(200).json(results);
//   });
// };


// Get Goal by ID
const getGoal = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    console.log("user_id from token:", user_id);

    const { goal_id } = req.query;
    if (!goal_id) {
      return res.status(400).json({ message: "Goal ID is required" });
    }

    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM goals
      WHERE id = ? AND user_id = ?
    `;

    con.query(query, [goal_id, user_id], (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "Error fetching goal" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Goal not found." });
      }

      res.status(200).json(results[0]); // Send the first result as JSON
    });
  });
};




const getObjectiveById = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    console.log("user_id from token:", user_id);

    const { objective_id } = req.params;

    let query = `
      SELECT objective_id, name, description, year, quarter, created_at, updated_at
      FROM objectives
      WHERE user_id = ? AND objective_id = ?
    `;

    const queryParams = [user_id, objective_id];

    con.query(query, queryParams, (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "Error fetching objective" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Objective not found" });
      }

      res.status(200).json(results[0]);
    });
  });
};


// Function to fetch a single goal by goal_id
const getGoalById = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user_id = decoded.user_id;
    console.log("user_id from token:", user_id);

    const { goal_id } = req.params;

    const query = `
      SELECT id, name, description, created_at, updated_at
      FROM goals
      WHERE id = ? AND user_id = ?
    `;

    con.query(query, [goal_id, user_id], (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "Error fetching goal" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Goal not found" });
      }

      res.status(200).json({
        message: "Goal fetched successfully",
        goal: results[0],
      });
    });
  });
};



// Get ALL Objectives (for overview page)
const getAllObjectives = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const query = `
      SELECT 
        objective_id,
        goal_id, 
        name, 
        description,
        year,
        quarter,
        created_at,
        updated_at
      FROM objectives
      ORDER BY updated_at DESC, created_at DESC
    `;

    con.query(query, (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "Error fetching objectives from the database" });
      }

      console.log("All Objectives retrieved:", results.length);
      res.status(200).json(results);
    });
  });
};

// Get ALL Specific Objectives (for overview page)
const getAllSpecificObjectives = (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      console.error("JWT Error:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const query = `
      SELECT 
        specific_objective_id,
        objective_id, 
        specific_objective_name,
        view,
        created_at,
        updated_at
      FROM specific_objectives
      ORDER BY updated_at DESC, created_at DESC
    `;

    con.query(query, (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).json({ message: "Error fetching specific objectives from the database" });
      }

      console.log("All Specific Objectives retrieved:", results.length);
      res.status(200).json(results);
    });
  });
};


// Exporting all functions
module.exports = {
  getGoalById,
  getObjectiveById,
  getGoals,
  getObjectivesByGoals,
  getspesificObjectivesByGoals,
  getAllObjectives,
  getAllSpecificObjectives,
  // getSpecificGoalsByGoal,
  getGoal
};
