const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const taskAssignmentController = require("../controllers/taskAssignmentController");
const taskBreakdownController = require("../controllers/taskBreakdownController");
const verifyToken = require("../middleware/verifyToken");

// Unified Task Hub Alerts (aggregating received + daily + supervisor approvals)
router.get("/tasks/hub-alerts", verifyToken, taskAssignmentController.getTaskHubAlerts);

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

// Task Assignees (Monthly & Weekly breakdown task level)
router.get("/tasks/breakdown/monthly/:taskId/assignees", verifyToken, taskBreakdownController.getMonthlyTaskAssignees);
router.post("/tasks/breakdown/monthly/:taskId/assignees", verifyToken, taskBreakdownController.setMonthlyTaskAssignees);
router.get("/tasks/breakdown/weekly/:taskId/assignees", verifyToken, taskBreakdownController.getWeeklyTaskAssignees);
router.post("/tasks/breakdown/weekly/:taskId/assignees", verifyToken, taskBreakdownController.setWeeklyTaskAssignees);
router.get("/tasks/breakdown/my-received", verifyToken, taskBreakdownController.getMyReceivedBreakdownTasks);

module.exports = router;

