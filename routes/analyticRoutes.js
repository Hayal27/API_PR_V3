const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
    DefaultPlanOutcomeDifferenceFulltime,
    HRPlanOutcomeDifferenceFulltime,
    displayTotalCost,
    displayTotalCostPlan,
    compareCostPlanOutcome,
    displayTotalCostExcutionPercentage,
    displayTotalIncomeplanETB,
    displayTotalIncomeOutcomeETB,
    displayTotalIncomePlanUSD,
    displayTotalIncomeOutcomeUSD,
    compareIncomePlanOutcomeETB,
    compareIncomePlanOutcomeUSD,
    compareIncomePlanOutcomeTotal,
    compareIncomeByName,
    getCompletedPlanIncomeDetails,
    costPlanOutcomeDifferenceRegularBudget,
    costPlanOutcomeDifferenceCapitalBudget,
    userPerformanceRanking,
    getCostReporting,
    getIncomeReporting,
    getCostVsIncomeReporting,
    getHRReporting,
    getProjectReporting,
    getGeneralReporting,
    getDetailedFullReporting,
    unitPerformanceRanking,

    // costPlan_Outcome_difference_capital_budget,
    // compareCostCIplanAndCIoutcome,
    // compareCostCIexecutionPercentage,
    // displayTotalIncome,
    // compareTotalIncomeCIplanAndCIoutcome,
    // compareIncomeCIplanAndCIoutcomeByPeriod,
    // compareCostAndIncome,
    // displayTotalHR,
    // compareTotalHRCIplanAndCIoutcome
} = require("../controllers/analytics");




// Human Resource 
router.get("/hrPlanOutcomeDifferenceFulltime", verifyToken, HRPlanOutcomeDifferenceFulltime);




// ROUTE TO GET TOTAL COST
router.get("/displayTotalCost", verifyToken, displayTotalCost);
router.get("/displayTotalCostPlan", verifyToken, displayTotalCostPlan);
router.get("/compareCostPlanOutcome", verifyToken, compareCostPlanOutcome);
router.get("/displayTotalCostExcutionPercentage", verifyToken, displayTotalCostExcutionPercentage);

// ROUTE TO GET TOTAL INCOME
router.get("/displayTotalIncomePlanETB", verifyToken, displayTotalIncomeplanETB);
router.get("/displayTotalIncomeOutcomeETB", verifyToken, displayTotalIncomeOutcomeETB);
router.get("/displayTotalIncomePlanUSD", verifyToken, displayTotalIncomePlanUSD);
router.get("/displayTotalIncomeOutcomeUSD", verifyToken, displayTotalIncomeOutcomeUSD);
router.get("/compareIncomePlanOutcomeETB", verifyToken, compareIncomePlanOutcomeETB);
router.get("/compareIncomePlanOutcomeUSD", verifyToken, compareIncomePlanOutcomeUSD);
router.get("/compareIncomePlanOutcomeTotal", verifyToken, compareIncomePlanOutcomeTotal);
router.get("/compareIncomeByName", verifyToken, compareIncomeByName);
router.get("/getCompletedPlanIncomeDetails", verifyToken, getCompletedPlanIncomeDetails);
router.get("/costPlanOutcomeDifferenceRegularBudget", verifyToken, costPlanOutcomeDifferenceRegularBudget);
router.get("/costPlanOutcomeDifferenceCapitalBudget", verifyToken, costPlanOutcomeDifferenceCapitalBudget);

// Granular Reporting Routes
router.get("/getCostReporting", verifyToken, getCostReporting);
router.get("/getIncomeReporting", verifyToken, getIncomeReporting);
router.get("/getCostVsIncomeReporting", verifyToken, getCostVsIncomeReporting);
router.get("/getHRReporting", verifyToken, getHRReporting);
router.get("/getProjectReporting", verifyToken, getProjectReporting);
router.get("/getGeneralReporting", verifyToken, getGeneralReporting);
router.get("/getDetailedFullReporting", verifyToken, getDetailedFullReporting);

// default plan 
router.get("/defaultPlanOutcomeDifferenceFulltime", verifyToken, DefaultPlanOutcomeDifferenceFulltime);

// Performance Rankings
router.get("/userPerformanceRanking", verifyToken, userPerformanceRanking);
router.get("/unitPerformanceRanking", verifyToken, unitPerformanceRanking);








//cost type based 
// router.get("/compareCostCIplanAndCIoutcome", verifyToken, compareCostCIplanAndCIoutcome);

// router.get("/compareCostCIplanAndCIoutcome", verifyToken, compareCostCIplanAndCIoutcome);
// router.get("/compareCostCIexecutionPercentage", verifyToken, compareCostCIexecutionPercentage);
// router.get("/displayTotalIncome", verifyToken, displayTotalIncome);
// router.get("/compareTotalIncomeCIplanAndCIoutcome", verifyToken, compareTotalIncomeCIplanAndCIoutcome);
// router.get("/compareIncomeCIplanAndCIoutcomeByPeriod", verifyToken, compareIncomeCIplanAndCIoutcomeByPeriod);
// router.get("/compareCostAndIncome", verifyToken, compareCostAndIncome);
// router.get("/displayTotalHR", verifyToken, displayTotalHR);
// router.get("/compareTotalHRCIplanAndCIoutcome", verifyToken, compareTotalHRCIplanAndCIoutcome);

module.exports = router;