const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); 
const { getAllPlans,getAllReports,getAllActivities,getAllNotifications } = require('../controllers/staffDashboardController');
const { getDashboardStats, getDashboardActivityChart, getDashboardPillars, getDashboardTodayOverview } = require('../controllers/dashboardSelfService');

router.get("/summary-stats", verifyToken, getDashboardStats);
router.get("/activity-chart", verifyToken, getDashboardActivityChart);
router.get("/pillars", verifyToken, getDashboardPillars);
router.get("/today-overview", verifyToken, getDashboardTodayOverview);
router.get("/pland", verifyToken, getAllPlans);
router.get("/reportsd", verifyToken, getAllReports);
router.get("/activitiesd", verifyToken, getAllActivities);
router.get("/notificationsd", verifyToken, getAllNotifications);

module.exports = router;