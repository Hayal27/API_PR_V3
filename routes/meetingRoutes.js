const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/verifyToken');
const {
    createMeeting,
    getMeetings,
    getMeetingDetails,
    updateMeeting,
    deleteMeeting,
    respondToMeeting,
    getMeetingStats,
    postponeMeeting,
    endMeeting,
    uploadAttachments,
    getAttachments,
    deleteAttachment,
    sendMeetingReminder
} = require('../controllers/meetingController');

// =====================================================
// MULTER CONFIGURATION FOR FILE UPLOADS
// =====================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/meeting_attachments/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only documents and images are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

// =====================================================
// MEETING ROUTES
// =====================================================

// Get meeting statistics
router.get('/stats', verifyToken, getMeetingStats);

// Get all meetings for current user
router.get('/', verifyToken, getMeetings);

// Create a new meeting
router.post('/', verifyToken, createMeeting);

// Get meeting details
router.get('/:meetingId', verifyToken, getMeetingDetails);

// Update meeting
router.put('/:meetingId', verifyToken, updateMeeting);

// Delete meeting
router.delete('/:meetingId', verifyToken, deleteMeeting);

// Respond to meeting invitation
router.put('/:meetingId/respond', verifyToken, respondToMeeting);

// Postpone meeting
router.put('/:meetingId/postpone', verifyToken, postponeMeeting);

// End meeting
router.put('/:meetingId/end', verifyToken, endMeeting);

// Send on-demand Telegram reminder to all linked participants
router.post('/:meetingId/remind', verifyToken, sendMeetingReminder);

// =====================================================
// ATTACHMENT ROUTES
// =====================================================

// Upload attachments to meeting
router.post('/:meetingId/attachments', verifyToken, upload.array('attachments', 10), uploadAttachments);

// Get meeting attachments
router.get('/:meetingId/attachments', verifyToken, getAttachments);

// Delete attachment
router.delete('/attachments/:attachmentId', verifyToken, deleteAttachment);

module.exports = router;
