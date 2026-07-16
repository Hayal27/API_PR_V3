const express = require("express");
const router = express.Router();
const dailyTaskController = require("../controllers/dailyTaskController");
const verifyToken = require("../middleware/verifyToken");

// Daily Task CRUD
router.post("/", verifyToken, dailyTaskController.createDailyTask);
router.get("/", verifyToken, dailyTaskController.getDailyTasks);
router.get("/stats", verifyToken, dailyTaskController.getDailyTaskStats);
router.put("/:id", verifyToken, dailyTaskController.updateDailyTask);
router.delete("/:id", verifyToken, dailyTaskController.deleteDailyTask);

module.exports = router;
