const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const branchController = require('../controllers/branchController');

// All branch routes require valid JWT authentication
router.get('/', verifyToken, branchController.getAllBranches);
router.get('/hierarchy', verifyToken, branchController.getBranchHierarchy);
router.get('/scorecard', verifyToken, branchController.getBranchPerformanceScorecard);
router.get('/admins', verifyToken, branchController.getBranchAdmins);
router.post('/:id/admin', verifyToken, branchController.assignBranchAdmin);
// User Multi-Branch Assignment routes
router.get('/users/:user_id/branches', verifyToken, branchController.getUserBranches);
router.post('/users/:user_id/branches', verifyToken, branchController.assignUserToBranch);
router.delete('/users/:user_id/branches/:branch_id', verifyToken, branchController.removeUserFromBranch);

router.get('/:id', verifyToken, branchController.getBranchById);
router.post('/', verifyToken, branchController.createBranch);
router.put('/:id', verifyToken, branchController.updateBranch);
router.delete('/:id', verifyToken, branchController.deleteBranch);

module.exports = router;
