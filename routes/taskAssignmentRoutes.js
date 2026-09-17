const express = require("express");
const router = express.Router();
const taskAssignmentController = require("../controllers/taskAssignmentController");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const path = require("path");

// File upload config for task attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// Task Assignment CRUD
router.post("/assign", verifyToken, upload.single('attachment'), taskAssignmentController.assignTask);
router.get("/assigned-by-me", verifyToken, taskAssignmentController.getAssignedByMe);
router.get("/assigned-to-me", verifyToken, taskAssignmentController.getAssignedToMe);
router.get("/available-users", verifyToken, taskAssignmentController.getAvailableUsers);
router.get("/supervised-users", verifyToken, taskAssignmentController.getSupervisedUsers);
router.get("/subordinate-details/:id", verifyToken, taskAssignmentController.getSubordinateDetails);
router.get("/stats", verifyToken, taskAssignmentController.getAssignmentStats);
router.get("/performance-ranking", verifyToken, taskAssignmentController.getPerformanceRanking);
router.get("/hub-alerts", verifyToken, taskAssignmentController.getTaskHubAlerts);

// Status updates
router.put("/:id/status", verifyToken, taskAssignmentController.updateAssignmentStatus);
router.put("/:id/confirm", verifyToken, taskAssignmentController.confirmTask);
router.put("/:id/reject", verifyToken, taskAssignmentController.rejectTask);

// Delete
router.delete("/:id", verifyToken, taskAssignmentController.deleteAssignment);

module.exports = router;
