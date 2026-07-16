const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { upload } = require('../middleware/upload');
const {
  getConversations,
  createConversation,
  getConversationDetails,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  getOrCreateDirectMessage,
  getActiveUsers,
  getAllUsers,
  updatePresence,
  searchUsers,
  addAttachment,
  addMention,
  forwardMessage,
  createOrganizationGroup,
  getOrganizationGroups,
  addParticipantToGroup,
  removeParticipantFromGroup,
  getGroupParticipants,
  addParticipantToGroupChat,
  removeParticipantFromGroupChat,
  updateGroupSettings,
  makeGroupAdmin,
  uploadFile,
  addReaction,
  removeReaction
} = require('../controllers/chatController');

// =====================================================
// CONVERSATION ROUTES
// =====================================================

// Get all conversations for current user
router.get('/conversations', verifyToken, getConversations);

// Create a new conversation
router.post('/conversations', verifyToken, createConversation);

// Get conversation details with participants
router.get('/conversations/:conversationId', verifyToken, getConversationDetails);

// =====================================================
// MESSAGE ROUTES
// =====================================================

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', verifyToken, getMessages);

// Send a message
router.post('/conversations/:conversationId/messages', verifyToken, sendMessage);

// Edit a message
router.put('/messages/:messageId', verifyToken, editMessage);

// Delete a message
router.delete('/messages/:messageId', verifyToken, deleteMessage);

// =====================================================
// DIRECT MESSAGE ROUTES
// =====================================================

// Get or create a direct message conversation
router.post('/direct-message', verifyToken, getOrCreateDirectMessage);

// =====================================================
// PRESENCE & STATUS ROUTES
// =====================================================

// Get active users
router.get('/active-users', verifyToken, getActiveUsers);

// Get all users
router.get('/all-users', verifyToken, getAllUsers);

// Update user presence/status
router.put('/presence', verifyToken, updatePresence);

// =====================================================
// USER SEARCH ROUTES
// =====================================================

// Search users
router.get('/search-users', verifyToken, searchUsers);

// =====================================================
// MESSAGE ATTACHMENT ROUTES
// =====================================================

// Upload file
router.post('/upload', verifyToken, upload.array('files'), uploadFile);

// Add attachment to message
router.post('/messages/:messageId/attachments', verifyToken, addAttachment);

// =====================================================
// MESSAGE MENTION ROUTES
// =====================================================

// Add mention to message
router.post('/messages/:messageId/mentions', verifyToken, addMention);

// =====================================================
// MESSAGE REACTION ROUTES
// =====================================================

// Add reaction
router.post('/messages/:messageId/reactions', verifyToken, addReaction);

// Remove reaction
router.delete('/messages/:messageId/reactions', verifyToken, removeReaction);

// =====================================================
// MESSAGE FORWARDING ROUTES
// =====================================================

// Forward message
router.post('/messages/:messageId/forward', verifyToken, forwardMessage);

// =====================================================
// ORGANIZATION GROUP ROUTES
// =====================================================

// Create organization group
router.post('/organization-groups', verifyToken, createOrganizationGroup);

// Get organization groups
router.get('/organization-groups', verifyToken, getOrganizationGroups);

// =====================================================
// GROUP PARTICIPANT ROUTES
// =====================================================

// Add participant to group
router.post('/groups/:groupId/participants', verifyToken, addParticipantToGroup);

// Remove participant from group
router.delete('/groups/:groupId/participants/:participantId', verifyToken, removeParticipantFromGroup);

// Get group participants
router.get('/groups/:groupId/participants', verifyToken, getGroupParticipants);

// =====================================================
// GROUP MANAGEMENT ROUTES
// =====================================================

// Add participant to group (admin only)
router.post('/groups/:groupId/add-participant', verifyToken, addParticipantToGroupChat);

// Remove participant from group (admin only)
router.delete('/groups/:groupId/remove-participant/:userId', verifyToken, removeParticipantFromGroupChat);

// Update group settings (admin only)
router.put('/groups/:groupId', verifyToken, updateGroupSettings);

// Make user admin of group (admin only)
router.post('/groups/:groupId/make-admin/:userId', verifyToken, makeGroupAdmin);

module.exports = router;
