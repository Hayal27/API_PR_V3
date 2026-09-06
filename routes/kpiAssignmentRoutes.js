const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getMyAssignedKPIs, getSubordinatesForKPI, delegateKPI } = require('../controllers/kpiAssignmentController');

router.get('/my-assigned', verifyToken, getMyAssignedKPIs);
router.get('/subordinates', verifyToken, getSubordinatesForKPI);
router.post('/delegate', verifyToken, delegateKPI);

module.exports = router;
