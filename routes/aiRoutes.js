const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const verifyToken = require('../middleware/verifyToken');

router.post('/ai/analyze-reporting', verifyToken, aiController.generateInsights);
router.post('/ai/chat-with-ai', verifyToken, aiController.chatWithAI);

module.exports = router;
