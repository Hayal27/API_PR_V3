const con = require("../models/db");

// ─── getGoals ────────────────────────────────────────────────────────────────
// Fetch all goals (optionally filtered by year / quarter).
// Note: verifyToken middleware already authenticated the request and set req.user_id.
const getGoals = (req, res) => {
  const { year, quarter } = req.query;

  let query = `
      SELECT goal_id, name, description, year, quarter, created_at, updated_at
      FROM goals
  `;
  const queryParams = [];

  if (year) {
    query += " WHERE year = ?";
    queryParams.push(year);
  }

  if (quarter) {
    query += queryParams.length === 0 ? " WHERE quarter = ?" : " AND quarter = ?";
    queryParams.push(quarter);
  }

  con.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Database Error (getGoals):", err.message);
      return res.status(500).json({ message: "Error fetching goals" });
    }
    res.status(200).json(results);
  });
};

// ─── getObjectivesByGoals ─────────────────────────────────────────────────────
const getObjectivesByGoals = (req, res) => {
  const { goal_id } = req.query;

  if (!goal_id) {
    return res.status(400).json({ message: "Goal ID is required" });
  }

  const query = `
    SELECT
      objective_id,
      goal_id,
      name,
      description
    FROM objectives
    WHERE goal_id = ?
  `;

  con.query(query, [goal_id], (err, results) => {
    if (err) {
      console.error("Database Error (getObjectivesByGoals):", err.message);
      return res.status(500).json({ message: "Error fetching objectives from the database" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No objectives found for the given goal ID." });
    }

    res.status(200).json(results);
  });
};

// ─── getspesificObjectivesByGoals ─────────────────────────────────────────────
const getspesificObjectivesByGoals = (req, res) => {
  const { objective_id } = req.query;

  if (!objective_id) {
    return res.status(400).json({ message: "Objective ID is required" });
  }

  const query = `
    SELECT
      specific_objective_id,
      objective_id,
      specific_objective_name,
      view
    FROM specific_objectives
    WHERE objective_id = ?
  `;

  con.query(query, [objective_id], (err, results) => {
    if (err) {
      console.error("Database Error (getspesificObjectivesByGoals):", err.message);
      return res.status(500).json({ message: "Error fetching objectives from the database" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No specific objectives found for the given objective ID." });
    }

    res.status(200).json(results);
  });
};

// ─── getGoal ──────────────────────────────────────────────────────────────────
const getGoal = (req, res) => {
  const user_id = req.user_id;
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
      console.error("Database Error (getGoal):", err.message);
      return res.status(500).json({ message: "Error fetching goal" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Goal not found." });
    }

    res.status(200).json(results[0]);
  });
};

// ─── getObjectiveById ─────────────────────────────────────────────────────────
const getObjectiveById = (req, res) => {
  const user_id = req.user_id;
  const { objective_id } = req.params;

  const query = `
    SELECT objective_id, name, description, year, quarter, created_at, updated_at
    FROM objectives
    WHERE user_id = ? AND objective_id = ?
  `;

  con.query(query, [user_id, objective_id], (err, results) => {
    if (err) {
      console.error("Database Error (getObjectiveById):", err.message);
      return res.status(500).json({ message: "Error fetching objective" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Objective not found" });
    }

    res.status(200).json(results[0]);
  });
};

// ─── getGoalById ──────────────────────────────────────────────────────────────
const getGoalById = (req, res) => {
  const user_id = req.user_id;
  const { goal_id } = req.params;

  const query = `
    SELECT id, name, description, created_at, updated_at
    FROM goals
    WHERE id = ? AND user_id = ?
  `;

  con.query(query, [goal_id, user_id], (err, results) => {
    if (err) {
      console.error("Database Error (getGoalById):", err.message);
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
};

// ─── getAllObjectives ─────────────────────────────────────────────────────────
const getAllObjectives = (req, res) => {
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
      console.error("Database Error (getAllObjectives):", err.message);
      return res.status(500).json({ message: "Error fetching objectives from the database" });
    }

    console.log("All Objectives retrieved:", results.length);
    res.status(200).json(results);
  });
};

// ─── getAllSpecificObjectives ──────────────────────────────────────────────────
const getAllSpecificObjectives = (req, res) => {
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
      console.error("Database Error (getAllSpecificObjectives):", err.message);
      return res.status(500).json({ message: "Error fetching specific objectives from the database" });
    }

    console.log("All Specific Objectives retrieved:", results.length);
    res.status(200).json(results);
  });
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  getGoalById,
  getObjectiveById,
  getGoals,
  getObjectivesByGoals,
  getspesificObjectivesByGoals,
  getAllObjectives,
  getAllSpecificObjectives,
  getGoal,
  // getPlansBySpecificGoal is referenced in planRoutes.js but was never defined;
  // exporting undefined here avoids a destructuring error on that side.
  getPlansBySpecificGoal: undefined,
};
