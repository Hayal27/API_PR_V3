// const jwt = require("jsonwebtoken");
// const con = require("../models/db");

// const addReport = (req, res) => {
//   const { outcome } = req.body;
//   const { plan_id } = req.params; // Retrieve plan_id from the URL

//   if (!outcome) {
//     return res.status(400).json({ message: "Outcome is required" });
//   }

//   if (!plan_id) {
//     return res.status(400).json({ message: "Plan ID is required" });
//   }

//   const token = req.headers["authorization"]?.split(" ")[1];
//   if (!token) {
//     return res.status(401).json({ message: "Authorization token is required" });
//   }

//   jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
//     if (err) {
//       console.error("JWT Error:", err);
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }

//     const user_id = decoded.user_id;
//     console.log("user_id from token:", user_id);

//     // Fetch the associated plan details
//     con.query(
//       "SELECT * FROM plans WHERE plan_id = ?",
//       [plan_id],
//       (err, result) => {
//         if (err) {
//           console.error("Database Error during plan lookup:", err);
//           return res.status(500).json({ message: "Error finding plan" });
//         }

//         if (result.length === 0) {
//           return res.status(404).json({ message: "Plan not found" });
//         }

//         const plan = result[0];
//         console.log("Associated Plan Details:", plan);

//         // Calculate execution percentage
//         const { baseline, plan: planValue } = plan;
//         const execution_percentage = ((outcome - baseline) / (planValue - baseline)) * 100;

//         // Insert report based on the plan and user-provided outcome
//         const query = `
//           INSERT INTO reports (
//             plan_id, user_id, objective, goal, row_no, details, measurement, baseline, 
//             plan, outcome, execution_percentage, description, year, quarter, created_at
//           ) 
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
//         `;

//         const values = [
//           plan_id,
//           user_id,
//           plan.objective,
//           plan.goal,
//           plan.row_no,
//           plan.details,
//           plan.measurement,
//           plan.baseline,
//           plan.plan,
//           outcome,
//           execution_percentage,
//           plan.description,
//           plan.year,
//           plan.quarter,
//         ];

//         con.query(query, values, (err, result) => {
//           if (err) {
//             console.error("Error adding report:", err);
//             return res.status(500).json({ message: "Error adding report" });
//           }

//           console.log("Report added successfully:", result.insertId);
//           res.status(201).json({
//             message: "Report added successfully",
//             report_id: result.insertId,
//           });
//         });
//       }
//     );
//   });
// };

// module.exports = {
//   addReport,
// };
