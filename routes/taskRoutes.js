const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const verifyToken = require("../middleware/verifyToken");

// Get all tasks for user
router.get("/tasks", verifyToken, taskController.getUserTasks);

// Get task statistics
router.get("/tasks/stats", verifyToken, taskController.getTaskStats);

// Create new task
router.post("/tasks", verifyToken, taskController.createTask);

// Update task
router.put("/tasks/:taskId", verifyToken, taskController.updateTask);

// Delete task
router.delete("/tasks/:taskId", verifyToken, taskController.deleteTask);

// Add task reminder
router.post("/tasks/:taskId/reminders", verifyToken, taskController.addTaskReminder);

// Get task reminders
router.get("/tasks/reminders", verifyToken, taskController.getTaskReminders);

// Get task notifications (overdue, urgent, remaining)
router.get("/tasks/notifications", verifyToken, taskController.getTaskNotifications);

// Breakdown Supervisors APIs
router.get("/tasks/breakdown/:detailId/supervisors", verifyToken, taskController.getBreakdownSupervisors);
router.post("/tasks/breakdown/:detailId/supervisors", verifyToken, taskController.addBreakdownSupervisor);
router.delete("/tasks/breakdown/:detailId/supervisors/:supervisorId", verifyToken, taskController.removeBreakdownSupervisor);

module.exports = router;
