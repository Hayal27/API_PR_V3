const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getCompletedPlansAdvanced,
  getCompletedPlansSummary,
  getCompletedPlansByDepartment,
  getCompletedPlansByWorkflow,
} = require('../controllers/completedPlansController');

/**
 * Advanced Completed Plans Routes
 * 
 * These routes provide comprehensive access to completed plans with detailed information
 * from the ITPR database, including filtering, sorting, and statistical analysis.
 */

/**
 * GET /api/completed-plans/advanced
 * Fetch all completed plans with advanced filtering and detailed information
 * 
 * Query Parameters:
 * - year: Filter by year
 * - quarter: Filter by quarter (Q1, Q2, Q3, Q4)
 * - department: Filter by department name
 * - goal_id: Filter by goal ID
 * - objective_id: Filter by objective ID
 * - specific_objective_id: Filter by specific objective ID
 * - specific_objective_detail_id: Filter by specific objective detail ID
 * - search: Search across goal, objective, and detail names
 * - sortBy: Sort field (created_at, updated_at, plan_id, year, execution_percentage, department)
 * - sortOrder: Sort order (ASC or DESC)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - includeReports: Include report details (default: true)
 * - includeApprovals: Include approval details (default: true)
 * - includeMetrics: Include metrics (default: true)
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: Array of completed plans with full details,
 *   pagination: { currentPage, pageSize, totalCount, totalPages, hasNextPage, hasPreviousPage },
 *   filters: Applied filters,
 *   sorting: Applied sorting
 * }
 */
router.get('/advanced', verifyToken, getCompletedPlansAdvanced);

/**
 * GET /api/completed-plans/summary
 * Get summary statistics for completed plans
 * 
 * Query Parameters:
 * - year: Filter by year
 * - quarter: Filter by quarter
 * - department: Filter by department name
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     totalCompletedPlans: number,
 *     departmentsInvolved: number,
 *     goalsCovered: number,
 *     objectivesCovered: number,
 *     executionMetrics: { average, minimum, maximum },
 *     planProgress: { fullyCompleted, onGoing, started },
 *     approvalStatus: { approved, declined },
 *     reportMetrics: { totalSubmitted, approved, declined }
 *   },
 *   filters: Applied filters
 * }
 */
router.get('/summary', verifyToken, getCompletedPlansSummary);

/**
 * GET /api/completed-plans/by-department
 * Get completed plans statistics grouped by department
 * 
 * Query Parameters:
 * - year: Filter by year
 * - quarter: Filter by quarter
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: Array of department statistics,
 *   filters: Applied filters
 * }
 */
router.get('/by-department', verifyToken, getCompletedPlansByDepartment);

/**
 * GET /api/completed-plans/workflow-completed
 * Fetch all plans where approval workflow status is 'completed'
 */
router.get('/workflow-completed', verifyToken, getCompletedPlansByWorkflow);

module.exports = router;
