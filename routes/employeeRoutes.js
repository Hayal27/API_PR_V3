// employeeRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    addEmployee,
    getAllDepartments,
    getAllRoles,
    getAllSupervisors,
    getSupervisorsForReferral,
    getAllEmployees,
    getEmployeeStatistics,
    getRecentActivities,
    updateEmployee,
    deleteEmployee,
    getEmployeePositions,
    getAllEmployeePositions,
    addEmployeePosition,
    updateEmployeePosition,
    removeEmployeePosition
} = require('../controllers/employeeController');

// Define routes

// Employee CRUD operations
router.post('/addEmployee', verifyToken.optionalVerifyToken, addEmployee);
router.get('/employees', verifyToken.optionalVerifyToken, getAllEmployees); // Route to fetch all employees with details
router.put('/employees/:employee_id', verifyToken.optionalVerifyToken, updateEmployee); // Route to update employee
router.delete('/employees/:employee_id', verifyToken.optionalVerifyToken, deleteEmployee); // Route to delete employee

// Employee Positions operations
router.get('/employee-positions', verifyToken.optionalVerifyToken, getAllEmployeePositions);
router.get('/employees/:employee_id/positions', getEmployeePositions);
router.post('/employees/:employee_id/positions', addEmployeePosition);
router.put('/employees/:employee_id/positions/:position_id', updateEmployeePosition);
router.delete('/employees/:employee_id/positions/:position_id', removeEmployeePosition);

// Reference data routes
router.get('/departments',  getAllDepartments); // Route to fetch all departments
router.get('/roles', verifyToken.optionalVerifyToken, getAllRoles); // Route to fetch all roles
router.get('/supervisors', verifyToken.optionalVerifyToken, getAllSupervisors); // Route to fetch all supervisors
router.get('/supervisor/supervisors', getSupervisorsForReferral); // Route to fetch supervisors for referral

// Dashboard and analytics routes
router.get('/employee-statistics', getEmployeeStatistics); // Route to fetch employee statistics
router.get('/recent-activities', getRecentActivities); // Route to fetch recent activities

module.exports = router;


