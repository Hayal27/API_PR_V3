const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken'); 
const { getAllPlans,getAllReports,getAllActivities,getAllNotifications } = require('../controllers/staffDashboardController');


router.get("/pland", verifyToken, getAllPlans);
router.get("/reportsd", verifyToken, getAllReports);
router.get("/activitiesd", verifyToken, getAllActivities);
router.get("/notificationsd", verifyToken, getAllNotifications);

module.exports = router;