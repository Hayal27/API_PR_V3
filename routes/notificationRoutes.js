const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// All routes require authentication
router.use(verifyToken);

// Get notifications for authenticated user
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark specific notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Delete specific notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;
