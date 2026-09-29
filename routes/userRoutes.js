const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken.js');
const { checkSessionExpiration } = require('../middleware/sessionMiddleware');
const { getAllRoles, getAllUsers, updateUser, deleteUser, getDepartment, changeUserStatus, addUser } = require('../controllers/userController.js');
const { getProfilePicture } = require('../controllers/profileUploadController');

// Define routes
router.get('/user/profile/:user_id', getProfilePicture);

// router.get('/roles', getAllRoles);
router.get('/users', verifyToken.optionalVerifyToken, getAllUsers);
router.post('/addUser', verifyToken.optionalVerifyToken, addUser);
router.get('/department', getDepartment);

router.put('/:user_id/status', verifyToken.optionalVerifyToken, changeUserStatus);
router.put('/users/:user_id/status', verifyToken.optionalVerifyToken, changeUserStatus);

router.put('/updateUser/:user_id', verifyToken.optionalVerifyToken, updateUser);
router.delete('/deleteUser/:user_id', verifyToken.optionalVerifyToken, deleteUser);

module.exports = router;


