// planRoutes.js
const express = require("express");
const router = express.Router();
const con = require('../models/db');
const verifyToken = require('../middleware/verifyToken');
const { getSubmittedreports, getSubmittedPlans, updatePlanStatus, getDetailedPlanForSupervisor, getSubmittedPlanssp, updatePlanApprovalStatus, referPlanToSupervisor, getReferredPlans } = require("../controllers/planAproveController");
const { getApprovalHistory, getUserPlansWithHistory } = require("../controllers/approvalHistoryController");
const { addPlan } = require("../controllers/planController");
const { getAllPlansDeclined, getApprovedOrgPlans, getPlanDetail, getAllOrgPlans, getPlanById, getAllPlans, deletePlan, updatePland, updatePlan, addReport, markPlanAsCompleted, resubmitDeclinedPlan, getAllOrgP_lans } = require("../controllers/plansFetch");
// const {getSubmittedPlans, updatePlanStatus, getDetailedPlanForSupervisor,getSubmittedPlanssp,updatePlanApprovalStatus} = require("../controllers/planAproveController");
const { getGoals, getGoalById, getObjectiveById, getObjectivesByGoals, getspesificObjectivesByGoals, getGoal, getPlansBySpecificGoal, getAllObjectives, getAllSpecificObjectives } = require("../controllers/planDetailFetchController");
const { getProfilePic, getSpecificGoal, getSpesificObjectives, getdepartment, getUserRoles } = require("../controllers/planget");
const { addGoals, addObjectives, addSpecificObjectives, addspecificObjectiveDetails, updateGoal, deleteGoal, updateObjective, deleteObjective, updateSpecificObjective, deleteSpecificObjective, getKPIsBySpecificObjective, updateKPI, deleteKPI } = require("../controllers/planDtailedController")
const { upload } = require("../middleware/upload");

const { buildAndSavePlanApprovalChain, getApprovalSteps, approveStep, declineStep, getPendingPlansForApprover } = require('../controllers/hierarchyApprovalController');

// Task breakdown controller
const { getTasksByDetailId, addTasksToDetail, updateTasksToDetail, addWeeklyTasks, updateMonthlyTaskWeight, updateWeeklyTaskWeight, updateTaskWeightsBatch, updateTaskProgress } = require("../controllers/taskBreakdownController");

// profile pic
const { getProfilePicture, uploadProfilePicture } = require("../controllers/profileUploadController")

router.get("/getplan", verifyToken, getAllPlans); // GET /api/plan
router.get("/getplan-org", verifyToken, getAllOrgP_lans); // GET /api/plan-org
router.get("/plandeclined", verifyToken, getAllPlansDeclined); // GET /api/plan
router.get("/planorg", verifyToken, getAllOrgPlans);
router.delete("/plandelete/:planId", verifyToken, deletePlan); // DELETE /api/plan/:planId
router.put("/planupdate/:planId", verifyToken, updatePlan); // PUT /api/plan/:planId
router.put("/planupdated/:planId", verifyToken, updatePland); // PUT /api/plan/:planId
router.put("/plan-complete/:planId", verifyToken, markPlanAsCompleted); // PUT /api/plan-complete/:planId
router.put("/resubmit-declined/:planId", verifyToken, resubmitDeclinedPlan); // PUT /api/plan/resubmit-declined/:planId
router.put("/reassign-supervisor/:planId", verifyToken, (req, res) => {
  const { planId } = req.params;
  const { supervisor_id } = req.body;

  if (!supervisor_id) {
    return res.status(400).json({
      success: false,
      message: "supervisor_id is required"
    });
  }

  console.log(`Reassigning supervisor for plan ${planId} to supervisor ${supervisor_id}`);

  // First check if the plan exists and get current status
  const checkPlanQuery = `SELECT * FROM plans WHERE plan_id = ?`;

  con.query(checkPlanQuery, [planId], (err, planResults) => {
    if (err) {
      console.error("Error checking plan:", err);
      return res.status(500).json({
        success: false,
        message: "Error checking plan",
        error: err.message
      });
    }

    if (planResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    const plan = planResults[0];
    console.log("Current plan data:", plan);

    // Get supervisor details
    const getSupervisorQuery = `SELECT employee_id, department_id FROM employees WHERE employee_id = ?`;

    con.query(getSupervisorQuery, [supervisor_id], (err, supervisorResults) => {
      if (err) {
        console.error("Error getting supervisor details:", err);
        return res.status(500).json({
          success: false,
          message: "Error getting supervisor details",
          error: err.message
        });
      }

      if (supervisorResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Supervisor not found"
        });
      }

      const supervisor = supervisorResults[0];
      console.log("Supervisor details:", supervisor);

      // Update the approval workflow first
      const updateApprovalQuery = `
        UPDATE approvalworkflow 
        SET approver_id = ?, status = 'Pending', comment = '', comment_writer = '', approved_at = NULL
        WHERE plan_id = ?
      `;

      con.query(updateApprovalQuery, [supervisor_id, planId], (err, result) => {
        if (err) {
          console.error("Error updating approval workflow:", err);
          return res.status(500).json({
            success: false,
            message: "Error updating approval workflow",
            error: err.message
          });
        }

        console.log("Approval workflow updated:", result);

        res.json({
          success: true,
          message: "Supervisor reassigned successfully",
          data: {
            plan_id: planId,
            new_supervisor_id: supervisor_id,
            approval_updated: result.affectedRows > 0
          }
        });
      });
    });
  });
}); // PUT /api/reassign-supervisor/:planId

// New endpoint to handle complete declined plan update with supervisor reassignment
router.put("/update-declined-plan/:planId", verifyToken, (req, res) => {
  const { planId } = req.params;
  const user_id = req.user_id;
  const {
    baseline,
    plan: planValue,
    year,
    supervisor_id,
    goal_id,
    objective_id,
    specific_objective_id,
    specific_objective_details_id
  } = req.body;

  console.log(`Updating declined plan ${planId} with new supervisor ${supervisor_id}`);
  console.log("Request body:", req.body);

  // Validate required fields
  if (!supervisor_id) {
    return res.status(400).json({
      success: false,
      message: "supervisor_id is required"
    });
  }

  if (!goal_id || !objective_id || !specific_objective_id || !specific_objective_details_id) {
    const missingFields = [];
    if (!goal_id) missingFields.push("goal_id");
    if (!objective_id) missingFields.push("objective_id");
    if (!specific_objective_id) missingFields.push("specific_objective_id");
    if (!specific_objective_details_id) missingFields.push("specific_objective_details_id");

    return res.status(400).json({
      success: false,
      message: "The following fields are missing or invalid.",
      missingFields
    });
  }

  // Start transaction
  con.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).json({
        success: false,
        message: "Error starting transaction",
        error: err.message
      });
    }

    // Step 1: Get the specific_objective_detail_id from plans table
    const fetchPlanQuery = `
      SELECT specific_objective_detail_id FROM plans WHERE plan_id = ? AND user_id = ?
    `;

    con.query(fetchPlanQuery, [planId, user_id], (err, planResults) => {
      if (err) {
        return con.rollback(() => {
          console.error("Error fetching plan:", err);
          res.status(500).json({
            success: false,
            message: "Error fetching plan",
            error: err.message
          });
        });
      }

      if (planResults.length === 0) {
        return con.rollback(() => {
          res.status(404).json({
            success: false,
            message: "Plan not found or unauthorized"
          });
        });
      }

      const specific_objective_detail_id = planResults[0].specific_objective_detail_id;

      // Step 2: Update specific objective details
      const updateDetailQuery = `
        UPDATE specific_objective_details SET 
          baseline = ?, 
          plan = ?, 
          year = ?
        WHERE specific_objective_detail_id = ? AND user_id = ?
      `;

      con.query(updateDetailQuery, [baseline, planValue, year, specific_objective_detail_id, user_id], (err, result) => {
        if (err) {
          return con.rollback(() => {
            console.error("Error updating specific objective details:", err);
            res.status(500).json({
              success: false,
              message: "Error updating specific objective details",
              error: err.message
            });
          });
        }

        if (result.affectedRows === 0) {
          return con.rollback(() => {
            res.status(404).json({
              success: false,
              message: "Specific objective detail not found or unauthorized"
            });
          });
        }

        // Step 3: Update approval workflow
        const updateApprovalQuery = `
          UPDATE approvalworkflow SET 
            approver_id = ?, 
            status = 'Pending', 
            approval_date = NOW(), 
            approved_at = NULL, 
            comment = '',
            comment_writer = ''
          WHERE plan_id = ?
        `;

        con.query(updateApprovalQuery, [supervisor_id, planId], (err, approvalResult) => {
          if (err) {
            return con.rollback(() => {
              console.error("Error updating approval workflow:", err);
              res.status(500).json({
                success: false,
                message: "Error updating approval workflow",
                error: err.message
              });
            });
          }

          // Commit transaction
          con.commit((err) => {
            if (err) {
              return con.rollback(() => {
                console.error("Error committing transaction:", err);
                res.status(500).json({
                  success: false,
                  message: "Error committing transaction",
                  error: err.message
                });
              });
            }

            console.log("Plan updated successfully:", {
              plan_id: planId,
              plan_updated: result.affectedRows > 0,
              approval_updated: approvalResult.affectedRows > 0
            });

            res.json({
              success: true,
              message: "Declined plan updated and reassigned successfully",
              data: {
                plan_id: planId,
                new_supervisor_id: supervisor_id,
                plan_updated: result.affectedRows > 0,
                approval_updated: approvalResult.affectedRows > 0
              }
            });
          });
        });
      });
    });
  });
}); // PUT /api/update-declined-plan/:planId

router.put("/addReport/:planId", verifyToken, upload.array("files"), addReport);
router.put("/plan-complete/:planId", verifyToken, markPlanAsCompleted); // PUT /api/plan-complete/:planId

router.get("/planget/:planId", verifyToken, getPlanById);
router.get("/pland/:id", verifyToken, getPlanDetail);
router.get("/plan-details/:id", verifyToken, getPlanDetail);
router.get("/planorgd/:id", getApprovedOrgPlans);

// Route to add a new plan
router.post('/addplan', verifyToken, addPlan);
// Route to fetch submitted plans for approval
router.get("/supervisor/plans", verifyToken, getSubmittedPlans);
router.get("/supervisor/planssp", verifyToken, getSubmittedPlanssp);
// Route to approve or decline a plan
router.put("/supervisor/plans/approve", verifyToken, updatePlanStatus);
router.put("/supervisor/plans/approveceo", verifyToken, updatePlanApprovalStatus);
// Route to refer a plan to a new supervisor
router.put("/supervisor/plans/refer", verifyToken, referPlanToSupervisor);
// Route to fetch referred plans with referral information
router.get("/supervisor/plans/referred", verifyToken, getReferredPlans);
// Route to fetch detailed plan information for the next supervisor (GET)
router.get("/supervisor/plans/detailed", verifyToken, getDetailedPlanForSupervisor);
// Approval history routes
router.get("/approval-history/:plan_id", verifyToken, getApprovalHistory);
router.get("/plan/referral-history/:plan_id", verifyToken, getApprovalHistory);
router.get("/my-plans-history", verifyToken, getUserPlansWithHistory);

// ─── Hierarchy-based cascaded approval flow ───────────────────────────────────
router.get("/approval-steps/:plan_id", verifyToken, getApprovalSteps);                // GET chain for a plan
router.post("/approval-steps/:plan_id/approve", verifyToken, approveStep);           // Approve current step
router.post("/approval-steps/:plan_id/decline", verifyToken, declineStep);           // Decline current step
router.get("/supervisor/hierarchy-plans", verifyToken, getPendingPlansForApprover);  // Plans awaiting ME
// ───────────────────────────────────────────────────────────────────────────────

// Temporary fix route to create missing approval workflow entries for specific plans
router.post("/fix-specific-approval-workflows", (req, res) => {
  const query = `
    INSERT INTO approvalworkflow (plan_id, approver_id, status, comment_writer)
    VALUES
      (146, 72, 'Pending', ''),
      (148, 72, 'Pending', '')
    ON DUPLICATE KEY UPDATE status = 'Pending'
  `;

  con.query(query, (err, result) => {
    if (err) {
      console.error("Error creating specific approval workflows:", err);
      return res.status(500).json({
        success: false,
        message: "Error creating specific approval workflows",
        error: err.message
      });
    }

    res.json({
      success: true,
      message: `Created/updated approval workflows for plans 146 and 148`,
      affectedRows: result.affectedRows
    });
  });
});

// Temporary route to add progress columns to task tables
router.post("/fix-task-progress-columns", (req, res) => {
  const queries = [
    "ALTER TABLE `monthly_tasks` ADD COLUMN `progress` DECIMAL(5,2) NOT NULL DEFAULT 0.00",
    "ALTER TABLE `monthly_tasks` ADD COLUMN `status` ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending'",
    "ALTER TABLE `weekly_tasks` ADD COLUMN `progress` DECIMAL(5,2) NOT NULL DEFAULT 0.00",
    "ALTER TABLE `weekly_tasks` ADD COLUMN `status` ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending'"
  ];

  let completed = 0;
  let errors = [];

  queries.forEach(query => {
    con.query(query, (err) => {
      completed++;
      if (err) {
        // Ignore "Duplicate column name" errors
        if (err.code !== 'ER_DUP_FIELDNAME') {
          errors.push(err.message);
        }
      }

      if (completed === queries.length) {
        if (errors.length > 0) {
          return res.status(500).json({ success: false, message: "Errors adding columns", errors });
        }
        res.json({ success: true, message: "Progress columns added successfully" });
      }
    });
  });
});


// adding plan routes 

router.post("/addgoal", verifyToken, addGoals);
router.put("/updategoal/:goal_id", verifyToken, updateGoal);
router.delete("/deletegoal/:goal_id", verifyToken, deleteGoal);

router.post("/addobjective", verifyToken, addObjectives);
router.put("/updateobjective/:objective_id", verifyToken, updateObjective);
router.delete("/deleteobjective/:objective_id", verifyToken, deleteObjective);

router.post("/addSpecificObjective", verifyToken, addSpecificObjectives);
router.put("/updateSpecificObjective/:specific_objective_id", verifyToken, updateSpecificObjective);
router.delete("/deleteSpecificObjective/:specific_objective_id", verifyToken, deleteSpecificObjective);

router.post("/addspecificObjectiveDetail", verifyToken, addspecificObjectiveDetails);

// KPI (specific_objective_details) routes
router.get("/kpis/:specific_objective_id", verifyToken, getKPIsBySpecificObjective); // GET all KPIs for a specific objective
router.put("/kpis/:detail_id", verifyToken, updateKPI);                              // PUT update a KPI
router.delete("/kpis/:detail_id", verifyToken, deleteKPI);                          // DELETE a KPI and its tasks





// router.post("/specific_goals", verifyToken, addSpecificGoal);

router.get('/goalsg', verifyToken, getGoals);
router.get('/objectivesg', verifyToken, getObjectivesByGoals);
router.get('/spesificObjectivesg', verifyToken, getspesificObjectivesByGoals);

// New routes for overview page (fetch all without goal_id requirement)
router.get('/objectives/all', verifyToken, getAllObjectives);
router.get('/specific-objectives/all', verifyToken, getAllSpecificObjectives);


router.get('/objectivesbyid/:objective_id', verifyToken, getObjectiveById);
router.get('/goalsbyid/:goal_id', verifyToken, getGoalById);

router.get("/specificGoals/:sgoalId", verifyToken, getSpecificGoal);
router.get("/getSpesificObjectives", verifyToken, getSpesificObjectives);
router.get("/getdepartment", verifyToken, getdepartment);
router.get('/userrole', verifyToken, getUserRoles);

router.get('/submitted_reports', verifyToken, getSubmittedreports)





// profile pic 
router.post('/uploadProfilePicture', verifyToken, uploadProfilePicture);
router.get("/getprofile/:user_id", verifyToken, getProfilePicture); // API endpoint

// Task breakdown routes
router.post('/tasks/add', verifyToken, addTasksToDetail); // Add tasks to existing detail
router.put('/tasks/update', verifyToken, updateTasksToDetail); // Update existing task breakdown (Handles Syncing)
router.delete('/tasks/:detailId', verifyToken, async (req, res) => {
  // Delete all tasks for a specific objective detail
  const { detailId } = req.params;

  try {
    // Delete weekly tasks first (foreign key constraint)
    await new Promise((resolve, reject) => {
      con.query(
        'DELETE wt FROM weekly_tasks wt INNER JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id WHERE mt.specific_objective_detail_id = ?',
        [detailId],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Delete monthly tasks
    await new Promise((resolve, reject) => {
      con.query(
        'DELETE FROM monthly_tasks WHERE specific_objective_detail_id = ?',
        [detailId],
        (err) => err ? reject(err) : resolve()
      );
    });

    res.json({ success: true, message: 'All tasks deleted successfully' });
  } catch (error) {
    console.error('Error deleting tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to delete tasks' });
  }
});
router.post('/tasks/weekly/add', verifyToken, addWeeklyTasks); // Add weekly tasks to existing monthly task
router.get('/tasks/:detail_id', verifyToken, getTasksByDetailId); // Get all tasks for a detail
router.put('/tasks/monthly/:monthly_task_id', verifyToken, updateMonthlyTaskWeight); // Update monthly task weight
router.put('/tasks/weekly/:weekly_task_id', verifyToken, updateWeeklyTaskWeight); // Update weekly task weight
router.put('/tasks/batch-update', verifyToken, updateTaskWeightsBatch); // Batch update task weights
router.put('/tasks/progress', verifyToken, upload.single('attachment'), updateTaskProgress); // Update task progress



module.exports = router;
