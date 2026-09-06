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
const { getGoals, getGoalById, getObjectiveById, getObjectivesByGoals, getspesificObjectivesByGoals, getGoal, getPlansBySpecificGoal, getAllObjectives, getAllSpecificObjectives, getSpecificObjectiveDetailsByKpi } = require("../controllers/planDetailFetchController");
const { getProfilePic, getSpecificGoal, getSpesificObjectives, getdepartment, getUserRoles } = require("../controllers/planget");
const { addGoals, addObjectives, addSpecificObjectives, addspecificObjectiveDetails, updateGoal, deleteGoal, updateObjective, deleteObjective, updateSpecificObjective, deleteSpecificObjective, getKPIsBySpecificObjective, getKPIWeight, updateKPI, deleteKPI } = require("../controllers/planDtailedController")
const { upload } = require("../middleware/upload");

const { buildAndSavePlanApprovalChain, getApprovalSteps, approveStep, declineStep, getPendingPlansForApprover } = require('../controllers/hierarchyApprovalController');

// Task breakdown controller
const { getTasksByDetailId, addTasksToDetail, updateTasksToDetail, addWeeklyTasks, updateMonthlyTaskWeight, updateWeeklyTaskWeight, updateTaskWeightsBatch, updateTaskProgress, getMyReceivedBreakdownTasks } = require("../controllers/taskBreakdownController");

// profile pic
const { getProfilePicture, uploadProfilePicture } = require("../controllers/profileUploadController")

// Plan Pillars & Goal Config controllers
const pillarController = require("../controllers/pillarController");
const goalConfigController = require("../controllers/goalConfigController");
const { getCurrentEthiopianPeriod } = require('../utils/ethiopianCalendar');


// Ensure specific_objective_details table has starting_date and deadline columns
con.query("ALTER TABLE specific_objective_details ADD COLUMN starting_date DATE NULL", (err) => {
  if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding starting_date to specific_objective_details:", err.message);
});
con.query("ALTER TABLE specific_objective_details ADD COLUMN deadline DATE NULL", (err) => {
  if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding deadline to specific_objective_details:", err.message);
});

router.get("/getplan", verifyToken, getAllPlans); // GET /api/plan
router.get("/getplan-org", verifyToken, getAllOrgP_lans); // GET /api/plan-org
router.get("/plandeclined", verifyToken, getAllPlansDeclined); // GET /api/plan
router.get("/planorg", verifyToken, getAllOrgPlans);
router.delete("/plandelete/:planId", verifyToken, deletePlan); // DELETE /api/plan/:planId

// --- Plan Pillars Routes ---
router.get("/pillars", verifyToken, pillarController.getAllPillars);
router.post("/pillars", verifyToken, pillarController.createPillar);
router.put("/pillars/:id", verifyToken, pillarController.updatePillar);
router.delete("/pillars/:id", verifyToken, pillarController.deletePillar);
router.post("/pillars/:id/assign-goals", verifyToken, pillarController.assignGoalsToPillar);

// --- Goal & Plan Hierarchy Configuration & Extension Routes ---
router.get("/goal-config", verifyToken, goalConfigController.getGoalConfigurations);
router.put("/goal-config/:goalId", verifyToken, goalConfigController.updateGoalConfig);
router.post("/goal-config/:goalId/quarter-activation", verifyToken, goalConfigController.toggleQuarterActivation);
router.get("/goal-config/active-period", verifyToken, goalConfigController.getActiveGoalsForCurrentPeriod);
router.post("/goal-config/objective/:objectiveId/quarter-activation", verifyToken, goalConfigController.toggleObjectiveActivation);
router.post("/goal-config/kpi/:specificObjectiveId/quarter-activation", verifyToken, goalConfigController.toggleKpiActivation);
router.post("/goal-config/action-plan/:detailId/quarter-activation", verifyToken, goalConfigController.toggleActionPlanActivation);

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
router.get("/kpis/:specific_objective_id", verifyToken, getKPIsBySpecificObjective); // GET all Action Plans for a KPI
router.put("/kpis/:detail_id", verifyToken, updateKPI);                              // PUT update an Action Plan
router.delete("/kpis/:detail_id", verifyToken, deleteKPI);                          // DELETE an Action Plan and its tasks
router.get("/kpi-weight/:specific_objective_id", verifyToken, getKPIWeight);         // GET KPI weight info





// router.post("/specific_goals", verifyToken, addSpecificGoal);

router.get('/goalsg', verifyToken, getGoals);
router.get('/objectivesg', verifyToken, getObjectivesByGoals);
router.get('/spesificObjectivesg', verifyToken, getspesificObjectivesByGoals);
router.get('/action-plan-details', verifyToken, getSpecificObjectiveDetailsByKpi);

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
router.get('/tasks/breakdown/my-received', verifyToken, getMyReceivedBreakdownTasks); // Get breakdown tasks assigned to current user


// ─── Plan Types CRUD API ────────────────────────────────────────────────────
// GET    /api/plan-types          — list all plan types
// POST   /api/plan-types          — create a new plan type
// DELETE /api/plan-types/:value   — delete a custom plan type by its value key

router.get('/plan-types', verifyToken, (req, res) => {
  con.query('SELECT * FROM plan_types ORDER BY is_default DESC, sort_order ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    const formatted = rows.map(r => {
      let parsedConfig = null;
      if (r.field_config) {
        try { parsedConfig = typeof r.field_config === 'string' ? JSON.parse(r.field_config) : r.field_config; } catch {}
      }
      return {
        ...r,
        field_config: parsedConfig
      };
    });
    res.json({ success: true, data: formatted });
  });
});

router.post('/plan-types', verifyToken, (req, res) => {
  const { label, labelEn, color, field_config } = req.body;
  if (!label || !labelEn) return res.status(400).json({ success: false, message: 'label and labelEn are required.' });
  const value = labelEn.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const configStr = field_config ? (typeof field_config === 'string' ? field_config : JSON.stringify(field_config)) : null;

  con.query('SELECT id FROM plan_types WHERE value = ? LIMIT 1', [value], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (rows.length > 0) return res.status(400).json({ success: false, message: 'A plan type with this key already exists.' });
    con.query(
      `INSERT INTO plan_types (value, label, label_en, color, field_config, is_default, sort_order) VALUES (?, ?, ?, ?, ?, 0, 100)`,
      [value, label, labelEn, color || 'bg-teal-50 text-teal-700 border-teal-200', configStr],
      (err2, result) => {
        if (err2) return res.status(500).json({ success: false, message: err2.message });
        res.status(201).json({ success: true, message: 'Plan type created.', id: result.insertId, value });
      }
    );
  });
});

router.put('/plan-types/:value/config', verifyToken, (req, res) => {
  const { value } = req.params;
  const { field_config, label, labelEn, color } = req.body;
  const configStr = field_config ? (typeof field_config === 'string' ? field_config : JSON.stringify(field_config)) : null;

  con.query(
    `UPDATE plan_types SET field_config = ?, label = COALESCE(?, label), label_en = COALESCE(?, label_en), color = COALESCE(?, color) WHERE value = ?`,
    [configStr, label || null, labelEn || null, color || null, value],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Plan type not found.' });
      res.json({ success: true, message: 'Plan type configuration updated.' });
    }
  );
});

router.delete('/plan-types/:value', verifyToken, (req, res) => {
  const { value } = req.params;
  con.query('SELECT is_default FROM plan_types WHERE value = ? LIMIT 1', [value], (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Plan type not found.' });
    if (rows[0].is_default) return res.status(403).json({ success: false, message: 'Default plan types cannot be deleted.' });
    con.query('DELETE FROM plan_types WHERE value = ? AND is_default = 0', [value], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: err2.message });
      res.json({ success: true, message: 'Plan type deleted.' });
    });
  });
});


// ── Action Plan Breakdown Management ──────────────────────────────────────────
// GET /api/action-plans/all  – fetch action plans with their full hierarchy
router.get('/action-plans/all', verifyToken, (req, res) => {
  const userId = req.user_id;

  // First check user role_id and role_name to see if privileged (CEO, Deputy CEO, Admin, Executive)
  con.query(
    `SELECT u.role_id, LOWER(COALESCE(r.role_name, '')) AS role_name, u.employee_id 
     FROM users u 
     LEFT JOIN roles r ON u.role_id = r.role_id 
     WHERE u.user_id = ?`,
    [userId],
    (userErr, userRows) => {
      const roleId = userRows && userRows.length > 0 ? Number(userRows[0].role_id) : 0;
      const roleName = userRows && userRows.length > 0 ? userRows[0].role_name : '';
      
      const isPrivileged = [1, 2, 3, 29].includes(roleId) ||
        roleName.includes('ceo') ||
        roleName.includes('deputy') ||
        roleName.includes('admin') ||
        roleName.includes('executive') ||
        roleName.includes('director');

    let sql = `
      SELECT
        sod.specific_objective_detail_id AS id,
        COALESCE(sod.specific_objective_detailname, sod.name, sod.details, 'Action Plan') AS name,
        sod.details,
        sod.baseline,
        sod.plan,
        sod.CIplan,
        sod.CIbaseline,
        sod.outcome,
        sod.CIoutcome,
        sod.priority,
        sod.status,
        sod.measurement,
        COALESCE(sod.plan, sod.weight, 0) AS weight,
        COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0) AS progress,
        COALESCE(sod.starting_date, sod.created_at) AS starting_date,
        sod.deadline,
        sod.created_at,
        so.specific_objective_id,
        COALESCE(so.specific_objective_name, so.name, 'KPI') AS kpi_name,
        so.weight AS kpi_weight,
        o.objective_id,
        COALESCE(o.name, 'Objective') AS objective_name,
        o.weight AS objective_weight,
        g.goal_id,
        COALESCE(g.name, 'Goal') AS goal_name,
        g.year,
        g.quarter,
        CONCAT(COALESCE(e.fname, ''), ' ', COALESCE(e.lname, '')) AS owner_name,
        u.user_id AS owner_user_id,
        COALESCE(pos.title, pos.name, 'Staff') AS owner_position,
        COALESCE(os.name_amharic, os.name, 'General Directorate') AS department_name,
        (SELECT COUNT(*) FROM monthly_tasks mt WHERE mt.specific_objective_detail_id = sod.specific_objective_detail_id) AS breakdown_tasks_count,
        (SELECT CONCAT(COALESCE(e2.fname, u2.user_name), ' ', COALESCE(e2.lname, '')) FROM task_assignments ta JOIN users u2 ON ta.assigned_to = u2.user_id LEFT JOIN employees e2 ON u2.employee_id = e2.employee_id WHERE ta.category = CONCAT('action_plan_breakdown:', sod.specific_objective_detail_id) ORDER BY ta.created_at DESC LIMIT 1) AS delegated_to_name,
        (SELECT ta.created_at FROM task_assignments ta WHERE ta.category = CONCAT('action_plan_breakdown:', sod.specific_objective_detail_id) ORDER BY ta.created_at DESC LIMIT 1) AS delegated_at,
        (SELECT ta.status FROM task_assignments ta WHERE ta.category = CONCAT('action_plan_breakdown:', sod.specific_objective_detail_id) ORDER BY ta.created_at DESC LIMIT 1) AS delegated_status
      FROM specific_objective_details sod
      JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
      JOIN objectives o ON so.objective_id = o.objective_id
      JOIN goals g ON o.goal_id = g.goal_id
      LEFT JOIN users u ON sod.user_id = u.user_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
      LEFT JOIN positions pos ON ep.position_id = pos.position_id
      LEFT JOIN organization_structure os ON COALESCE(ep.org_node_id, e.department_id) = os.id
      LEFT JOIN action_plan_quarter_activations apqa 
        ON apqa.specific_objective_detail_id = sod.specific_objective_detail_id
    `;

    const params = [];
    if (!isPrivileged) {
      sql += ` WHERE (
        sod.user_id = ? 
        OR sod.created_by = ? 
        OR sod.specific_objective_detail_id IN (
          SELECT specific_objective_detail_id FROM plan_breakdown_supervisors WHERE supervisor_user_id = ?
        )
        OR sod.specific_objective_detail_id IN (
          SELECT mt.specific_objective_detail_id 
          FROM monthly_tasks mt 
          JOIN monthly_task_assignees mta ON mt.monthly_task_id = mta.monthly_task_id 
          WHERE mta.user_id = ?
        )
        OR sod.specific_objective_detail_id IN (
          SELECT mt.specific_objective_detail_id 
          FROM weekly_tasks wt 
          JOIN weekly_task_assignees wta ON wt.weekly_task_id = wta.weekly_task_id 
          JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id 
          WHERE wta.user_id = ?
        )
        OR sod.specific_objective_detail_id IN (
          SELECT CAST(REPLACE(ta.category, 'action_plan_breakdown:', '') AS UNSIGNED)
          FROM task_assignments ta
          WHERE ta.assigned_to = ? AND ta.category LIKE 'action_plan_breakdown:%'
        )
      ) `;
      params.push(userId, userId, userId, userId, userId, userId);
    }

    sql += ` GROUP BY sod.specific_objective_detail_id ORDER BY sod.created_at DESC `;

    con.query(sql, params, (err, rows) => {
      if (err) {
        console.error('Error fetching action plans:', err);
        return res.status(500).json({ success: false, message: 'Error fetching action plans', error: err.message });
      }

      const actionPlans = rows || [];
      if (actionPlans.length === 0) {
        return res.json({ success: true, actionPlans: [] });
      }

      // Fetch all 4 level activation tables to perform full hierarchy verification
      const gActSql = `SELECT goal_id, year, quarter, is_active FROM goal_quarter_activations`;
      const oActSql = `SELECT objective_id, year, quarter, is_active FROM objective_quarter_activations`;
      const kActSql = `SELECT specific_objective_id, year, quarter, is_active FROM kpi_quarter_activations`;
      const apActSql = `SELECT specific_objective_detail_id, year, quarter, is_active FROM action_plan_quarter_activations`;

      con.query(gActSql, (errG, gRows) => {
        con.query(oActSql, (errO, oRows) => {
          con.query(kActSql, (errK, kRows) => {
            con.query(apActSql, (errAP, apRows) => {
              const gMap = {}, oMap = {}, kMap = {}, apMap = {};

              (gRows || []).forEach(r => {
                if (!gMap[r.goal_id]) gMap[r.goal_id] = {};
                if (!gMap[r.goal_id][r.year]) gMap[r.goal_id][r.year] = {};
                gMap[r.goal_id][r.year][r.quarter] = Boolean(r.is_active);
              });

              (oRows || []).forEach(r => {
                if (!oMap[r.objective_id]) oMap[r.objective_id] = {};
                if (!oMap[r.objective_id][r.year]) oMap[r.objective_id][r.year] = {};
                oMap[r.objective_id][r.year][r.quarter] = Boolean(r.is_active);
              });

              (kRows || []).forEach(r => {
                if (!kMap[r.specific_objective_id]) kMap[r.specific_objective_id] = {};
                if (!kMap[r.specific_objective_id][r.year]) kMap[r.specific_objective_id][r.year] = {};
                kMap[r.specific_objective_id][r.year][r.quarter] = Boolean(r.is_active);
              });

              (apRows || []).forEach(r => {
                if (!apMap[r.specific_objective_detail_id]) apMap[r.specific_objective_detail_id] = {};
                if (!apMap[r.specific_objective_detail_id][r.year]) apMap[r.specific_objective_detail_id][r.year] = {};
                apMap[r.specific_objective_detail_id][r.year][r.quarter] = Boolean(r.is_active);
              });

              const currentPeriod = getCurrentEthiopianPeriod();

              const enriched = actionPlans.map(ap => {
                const targetYear = req.query.year ? parseInt(req.query.year, 10) : (ap.year ? parseInt(ap.year, 10) : currentPeriod.year);
                const targetQ = req.query.quarter ? String(req.query.quarter).replace('Q', '') : (ap.quarter ? String(ap.quarter).replace('Q', '') : currentPeriod.quarter);

                // 1. Goal level
                let isGoalActive = ap.goal_is_active !== 0;
                if (ap.goal_id && gMap[ap.goal_id]?.[targetYear]?.[targetQ] === false) {
                  isGoalActive = false;
                }

                // 2. Objective level
                let isObjActive = true;
                if (ap.objective_id && oMap[ap.objective_id]?.[targetYear]?.[targetQ] === false) {
                  isObjActive = false;
                }

                // 3. KPI level
                let isKpiActive = true;
                if (ap.specific_objective_id && kMap[ap.specific_objective_id]?.[targetYear]?.[targetQ] === false) {
                  isKpiActive = false;
                }

                // 4. Action Plan level
                let isApActive = true;
                if (ap.id && apMap[ap.id]?.[targetYear]?.[targetQ] === false) {
                  isApActive = false;
                }

                const isPeriodActive = isGoalActive && isObjActive && isKpiActive && isApActive;

                return {
                  ...ap,
                  is_active_period: isPeriodActive,
                  is_hierarchically_active: isPeriodActive,
                  hierarchy_activations: {
                    goal: isGoalActive,
                    objective: isObjActive,
                    kpi: isKpiActive,
                    action_plan: isApActive
                  }
                };
              });

              res.json({ success: true, actionPlans: enriched });
            });
          });
        });
      });
    });
  });
});

// GET /api/action-plans/delegated-to-me  – fetch action plans delegated to current user for breakdown
router.get('/action-plans/delegated-to-me', verifyToken, (req, res) => {
  const userId = req.user_id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const sql = `
    SELECT
      sod.specific_objective_detail_id AS id,
      COALESCE(sod.specific_objective_detailname, sod.name, sod.details, 'Action Plan') AS name,
      sod.details,
      sod.baseline,
      sod.plan,
      sod.CIplan,
      sod.CIbaseline,
      sod.outcome,
      sod.CIoutcome,
      sod.priority,
      sod.status,
      sod.measurement,
      COALESCE(sod.plan, sod.weight, 0) AS weight,
      COALESCE(sod.execution_percentage, sod.CIexecution_percentage, sod.progress, 0) AS progress,
      COALESCE(sod.starting_date, sod.created_at) AS starting_date,
      sod.deadline,
      sod.created_at,
      so.specific_objective_id,
      COALESCE(so.specific_objective_name, so.name, 'KPI') AS kpi_name,
      o.objective_id,
      COALESCE(o.name, 'Objective') AS objective_name,
      g.goal_id,
      COALESCE(g.name, 'Goal') AS goal_name,
      g.year,
      g.quarter,
      CONCAT(COALESCE(e.fname, ''), ' ', COALESCE(e.lname, '')) AS owner_name,
      u.user_id AS owner_user_id,
      COALESCE(os.name_amharic, os.name, 'General Directorate') AS department_name,
      (SELECT COUNT(*) FROM monthly_tasks mt WHERE mt.specific_objective_detail_id = sod.specific_objective_detail_id) AS breakdown_tasks_count,
      ta.assignment_id AS delegation_id,
      ta.title AS delegation_title,
      ta.description AS delegation_description,
      ta.status AS delegated_status,
      ta.due_date AS delegation_due_date,
      ta.created_at AS delegated_at,
      ta.priority AS delegation_priority,
      CONCAT(COALESCE(e_by.fname, ''), ' ', COALESCE(e_by.lname, '')) AS delegated_by_name
    FROM task_assignments ta
    JOIN specific_objective_details sod
      ON sod.specific_objective_detail_id = CAST(REPLACE(ta.category, 'action_plan_breakdown:', '') AS UNSIGNED)
    JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
    JOIN objectives o ON so.objective_id = o.objective_id
    JOIN goals g ON o.goal_id = g.goal_id
    LEFT JOIN users u ON sod.user_id = u.user_id
    LEFT JOIN employees e ON u.employee_id = e.employee_id
    LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
    LEFT JOIN organization_structure os ON COALESCE(ep.org_node_id, e.department_id) = os.id
    LEFT JOIN users u_by ON ta.assigned_by = u_by.user_id
    LEFT JOIN employees e_by ON u_by.employee_id = e_by.employee_id
    WHERE ta.assigned_to = ? AND ta.category LIKE 'action_plan_breakdown:%'
    ORDER BY ta.created_at DESC
  `;

  con.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error('Error fetching delegated plans:', err);
      return res.status(500).json({ success: false, message: 'Error fetching delegated plans', error: err.message });
    }
    res.json({ success: true, delegatedPlans: rows || [] });
  });
});

// GET /api/action-plans/:id/task-assignments  – fetch all breakdown tasks & assignments for an action plan
router.get('/action-plans/:id/task-assignments', verifyToken, (req, res) => {
  const { id } = req.params;

  const monthlySql = `
    SELECT 
      mt.monthly_task_id,
      mt.specific_objective_detail_id,
      mt.name,
      mt.weight,
      COALESCE(mt.plan_amount, 0) AS plan_amount,
      mt.progress,
      COALESCE(mt.plan_progress, 0) AS plan_progress,
      mt.status,
      mt.description,
      mt.attachment,
      mt.actual_amount,
      mt.start_date,
      mt.deadline,
      mt.created_at
    FROM monthly_tasks mt
    WHERE mt.specific_objective_detail_id = ?
    ORDER BY mt.created_at ASC
  `;

  const weeklySql = `
    SELECT 
      wt.weekly_task_id,
      wt.monthly_task_id,
      mt.name AS parent_monthly_name,
      wt.name,
      wt.weight,
      COALESCE(wt.plan_amount, 0) AS plan_amount,
      wt.progress,
      COALESCE(wt.plan_progress, 0) AS plan_progress,
      wt.status,
      wt.description,
      wt.attachment,
      wt.actual_amount,
      wt.start_date,
      wt.deadline,
      wt.created_at
    FROM weekly_tasks wt
    JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
    WHERE mt.specific_objective_detail_id = ?
    ORDER BY wt.created_at ASC
  `;

  const legacySql = `
    SELECT
      ta.assignment_id,
      ta.title,
      ta.description,
      ta.status,
      ta.priority,
      ta.due_date,
      ta.created_at,
      ta.completed_at,
      CONCAT(ea.fname, ' ', ea.lname) AS assigned_to_name,
      ua.avatar_url AS assigned_to_avatar,
      CONCAT(eb.fname, ' ', eb.lname) AS assigned_by_name,
      os_node.name AS assigned_to_position
    FROM task_assignments ta
    JOIN users ua ON ta.assigned_to = ua.user_id
    JOIN employees ea ON ua.employee_id = ea.employee_id
    JOIN users ub ON ta.assigned_by = ub.user_id
    JOIN employees eb ON ub.employee_id = eb.employee_id
    LEFT JOIN employee_positions ep ON ea.employee_id = ep.employee_id AND ep.is_primary = 1
    LEFT JOIN organization_structure os_node ON ep.org_node_id = os_node.id
    WHERE ta.category = CONCAT('action_plan:', ?)
    ORDER BY ta.created_at DESC
  `;

  con.query(monthlySql, [id], (mErr, mRows) => {
    con.query(weeklySql, [id], (wErr, wRows) => {
      con.query(legacySql, [id], (lErr, lRows) => {
        if (mErr || wErr || lErr) {
          console.error('Error fetching breakdown tasks for action plan:', mErr || wErr || lErr);
          return res.status(500).json({ success: false, message: 'DB error' });
        }

        const mTasks = mRows || [];
        const wTasks = wRows || [];
        const monthlyIds = mTasks.map(t => t.monthly_task_id);
        const weeklyIds = wTasks.map(t => t.weekly_task_id);

        const mAssigneeSql = monthlyIds.length > 0
          ? `SELECT mta.monthly_task_id, mta.user_id, CONCAT(e.fname, ' ', e.lname) AS name, u.avatar_url, os.name AS position
             FROM monthly_task_assignees mta
             JOIN users u ON mta.user_id = u.user_id
             JOIN employees e ON u.employee_id = e.employee_id
             LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
             LEFT JOIN organization_structure os ON ep.org_node_id = os.id
             WHERE mta.monthly_task_id IN (?)`
          : null;

        const wAssigneeSql = weeklyIds.length > 0
          ? `SELECT wta.weekly_task_id, wta.user_id, CONCAT(e.fname, ' ', e.lname) AS name, u.avatar_url, os.name AS position
             FROM weekly_task_assignees wta
             JOIN users u ON wta.user_id = u.user_id
             JOIN employees e ON u.employee_id = e.employee_id
             LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
             LEFT JOIN organization_structure os ON ep.org_node_id = os.id
             WHERE wta.weekly_task_id IN (?)`
          : null;

        const fetchM = mAssigneeSql
          ? new Promise(res => con.query(mAssigneeSql, [monthlyIds], (err, rows) => res(rows || [])))
          : Promise.resolve([]);

        const fetchW = wAssigneeSql
          ? new Promise(res => con.query(wAssigneeSql, [weeklyIds], (err, rows) => res(rows || [])))
          : Promise.resolve([]);

        Promise.all([fetchM, fetchW]).then(([mAssignees, wAssignees]) => {
          const mAssigneeMap = {};
          mAssignees.forEach(a => {
            if (!mAssigneeMap[a.monthly_task_id]) mAssigneeMap[a.monthly_task_id] = [];
            mAssigneeMap[a.monthly_task_id].push(a);
          });

          const wAssigneeMap = {};
          wAssignees.forEach(a => {
            if (!wAssigneeMap[a.weekly_task_id]) wAssigneeMap[a.weekly_task_id] = [];
            wAssigneeMap[a.weekly_task_id].push(a);
          });

          mTasks.forEach(t => t.assignees = mAssigneeMap[t.monthly_task_id] || []);
          wTasks.forEach(t => t.assignees = wAssigneeMap[t.weekly_task_id] || []);

          res.json({
            success: true,
            monthlyTasks: mTasks,
            weeklyTasks: wTasks,
            assignments: lRows || []
          });
        });
      });
    });
  });
});

// PUT /api/action-plans/:id — Edit/Update Action Plan details
router.put('/action-plans/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const {
    name,
    details,
    priority,
    status,
    weight,
    plan,
    baseline,
    CIplan,
    CIbaseline,
    outcome,
    measurement,
    starting_date,
    deadline,
  } = req.body;

  const plannedWeight = weight !== undefined ? weight : plan;

  const sql = `
    UPDATE specific_objective_details SET
      specific_objective_detailname = COALESCE(?, specific_objective_detailname),
      name = COALESCE(?, name),
      details = COALESCE(?, details),
      priority = COALESCE(?, priority),
      status = COALESCE(?, status),
      weight = COALESCE(?, weight),
      plan = COALESCE(?, plan),
      baseline = COALESCE(?, baseline),
      CIplan = COALESCE(?, CIplan),
      CIbaseline = COALESCE(?, CIbaseline),
      outcome = COALESCE(?, outcome),
      measurement = COALESCE(?, measurement),
      starting_date = COALESCE(?, starting_date),
      deadline = COALESCE(?, deadline),
      updated_at = NOW()
    WHERE specific_objective_detail_id = ?
  `;

  const params = [
    name || null,
    name || null,
    details || null,
    priority || null,
    status || null,
    plannedWeight !== undefined && plannedWeight !== '' ? plannedWeight : null,
    plannedWeight !== undefined && plannedWeight !== '' ? plannedWeight : null,
    baseline !== undefined && baseline !== '' ? baseline : null,
    CIplan !== undefined && CIplan !== '' ? CIplan : null,
    CIbaseline !== undefined && CIbaseline !== '' ? CIbaseline : null,
    outcome !== undefined && outcome !== '' ? outcome : null,
    measurement || null,
    starting_date || null,
    deadline || null,
    id
  ];

  con.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error updating action plan:', err);
      return res.status(500).json({ success: false, message: 'Database update failed', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Action plan not found' });
    }
    res.json({ success: true, message: 'Action plan updated successfully.' });
  });
});

// PUT /api/action-plans/:id/confirm — Confirm Action Plan status
router.put('/action-plans/:id/confirm', verifyToken, (req, res) => {
  const { id } = req.params;
  const targetStatus = req.body.status || 'confirmed';

  const sql = `
    UPDATE specific_objective_details SET
      status = ?,
      updated_at = NOW()
    WHERE specific_objective_detail_id = ?
  `;

  con.query(sql, [targetStatus, id], (err, result) => {
    if (err) {
      console.error('Error confirming action plan:', err);
      return res.status(500).json({ success: false, message: 'Confirmation failed', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Action plan not found' });
    }
    res.json({ success: true, message: `Action plan marked as ${targetStatus}.`, status: targetStatus });
  });
});

module.exports = router;

