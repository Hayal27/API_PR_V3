const express = require('express');
const router = express.Router();
// const verifyToken = require('../middleware/verifyToken.js');
const { checkSessionExpiration } = require('../middleware/sessionMiddleware');
const { getAllRoles, getAllUsers, updateUser, deleteUser, getDepartment, changeUserStatus } = require('../controllers/userController.js');
const { getProfilePicture } = require('../controllers/profileUploadController');

// Define routes
router.get('/user/profile/:user_id', getProfilePicture);



// router.get('/roles', getAllRoles);
router.get('/users', getAllUsers);
router.get('/department', getDepartment);

router.put('/:user_id/status', changeUserStatus);
router.put('/users/:user_id/status', changeUserStatus);



router.put('/updateUser/:user_id', updateUser);
router.delete('/deleteUser/:user_id', deleteUser);

module.exports = router;


