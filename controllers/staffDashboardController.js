const con = require("../models/db");

const getAllPlans = async (req, res) => {
    try {
      const user_id = req.user_id; // Access the user_id added by verifyToken
      const getPlansQuery = `
        SELECT 
          
          p.objective AS Objective, 
          p.goal AS Goal, 
          p.row_no AS 'Row No', 
          p.details AS Details, 
          p.measurement AS Measurement, 
          p.baseline AS Baseline, 
          p.plan AS Plan, 
          p.description AS Description, 
          p.status AS Status, 
          p.department_id AS Department_id, 
          p.created_by AS Created_by, 
          p.year AS Year, 
          p.quarter AS Quarter
        FROM plans p
        WHERE p.user_id = ?
      `;
  
      con.query(getPlansQuery, [user_id], (err, results) => {
        if (err) {
          console.error("Error fetching plans:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching plans from the database.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }
  
        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No plans found for the user.",
            error_code: "NO_PLANS_FOUND",
          });
        }
  
        res.status(200).json({
          success: true,
          plans: results,
        });
      });
    } catch (error) {
      console.error("Error in getAllPlans:", error.message);
      res.status(500).json({
        success: false,
        message: `Unknown error occurred. ${error.message}`,
        error_code: "UNKNOWN_ERROR",
      });
    }
  };
  const getAllReports = async (req, res) => {
    try {
      const user_id = req.user_id; // Access the user_id added by verifyToken
      const getReportsQuery = `
        SELECT 
          r.report_id AS ID, 
          r.title AS Title, 
          r.details AS Details, 
          r.status AS Status, 
          r.date_created AS Created_At, 
          r.user_id AS User_id
        FROM reports r
        WHERE r.user_id = ?
      `;
  
      con.query(getReportsQuery, [user_id], (err, results) => {
        if (err) {
          console.error("Error fetching reports:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching reports from the database.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }
  
        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No reports found for the user.",
            error_code: "NO_REPORTS_FOUND",
          });
        }
  
        res.status(200).json({
          success: true,
          reports: results,
        });
      });
    } catch (error) {
      console.error("Error in getAllReports:", error.message);
      res.status(500).json({
        success: false,
        message: `Unknown error occurred. ${error.message}`,
        error_code: "UNKNOWN_ERROR",
      });
    }
  };
  const getAllActivities = async (req, res) => {
    try {
      const user_id = req.user_id; // Access the user_id added by verifyToken
      const getActivitiesQuery = `
        SELECT 
          a.activity_id AS ID, 
          a.name AS Activity, 
          a.status AS Status, 
          a.date_started AS Started_At, 
          a.date_completed AS Completed_At
        FROM activities a
        WHERE a.user_id = ?
      `;
  
      con.query(getActivitiesQuery, [user_id], (err, results) => {
        if (err) {
          console.error("Error fetching activities:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching activities from the database.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }
  
        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No activities found for the user.",
            error_code: "NO_ACTIVITIES_FOUND",
          });
        }
  
        res.status(200).json({
          success: true,
          activities: results,
        });
      });
    } catch (error) {
      console.error("Error in getAllActivities:", error.message);
      res.status(500).json({
        success: false,
        message: `Unknown error occurred. ${error.message}`,
        error_code: "UNKNOWN_ERROR",
      });
    }
  };
  
  const getAllNotifications = async (req, res) => {
    try {
      const user_id = req.user_id; // Access the user_id added by verifyToken
      const getNotificationsQuery = `
        SELECT 
          n.notification_id AS ID, 
          n.message AS Message, 
          n.date_sent AS Sent_At
        FROM notifications n
        WHERE n.user_id = ?
      `;
  
      con.query(getNotificationsQuery, [user_id], (err, results) => {
        if (err) {
          console.error("Error fetching notifications:", err.message);
          return res.status(500).json({
            success: false,
            message: "Error fetching notifications from the database.",
            error_code: "DB_ERROR",
            error: err.message,
          });
        }
  
        if (results.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No notifications found for the user.",
            error_code: "NO_NOTIFICATIONS_FOUND",
          });
        }
  
        res.status(200).json({
          success: true,
          notifications: results,
        });
      });
    } catch (error) {
      console.error("Error in getAllNotifications:", error.message);
      res.status(500).json({
        success: false,
        message: `Unknown error occurred. ${error.message}`,
        error_code: "UNKNOWN_ERROR",
      });
    }
  };
  

  

  
  module.exports = { getAllPlans,getAllReports,getAllActivities,getAllNotifications};

  