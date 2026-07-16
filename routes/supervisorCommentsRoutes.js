const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getCommentsByPlan,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/supervisorCommentsController');

// All routes require authentication
router.use(verifyToken);

// Get all comments for a specific plan
router.get('/plan/:planId', getCommentsByPlan);

// Add a new comment or reply to a plan
router.post('/plan/:planId', addComment);

// Update a comment (only by comment owner)
router.put('/:commentId', updateComment);

// Delete a comment (only by comment owner)
router.delete('/:commentId', deleteComment);

module.exports = router;
