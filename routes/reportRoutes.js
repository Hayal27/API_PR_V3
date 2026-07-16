
// reportsRoutes.js

const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {upload} = require("../middleware/upload");
const { addReport, addReportFromStaff, getApprovedReport} = require("../controllers/reportController");
const {getAnalyticsData, getmyreportReports, getApprovedOrgreports,getReportDetail,getAllOrgReports,getReportById,getAllReports, deleteReport, updateReport } = require("../controllers/reportFetch");
// Route to add a new reports


const {getSubmittedReports,updateReportStatus} =require('../controllers/reportAproveController')
router.post("/reportadd/:planId", verifyToken, addReport);
// Route to add a new reports - alternative endpoint for StaffViewPlan component
router.post("/reports", verifyToken, upload.array("attachments"), addReportFromStaff);
router.get("/report", verifyToken, getAllReports); // GET /api/plan
router.get("/reportorg", verifyToken, getAllOrgReports);
router.get("/myreport", verifyToken, getmyreportReports);
router.get("/getAnalyticsData1", verifyToken, getAnalyticsData);

router.delete("/reportdelete/:reportId",verifyToken, deleteReport); 
router.put("/reportupdate/:reportId",verifyToken, updateReport); 
router.get("/reportget/:reportId", verifyToken, getReportById);
router.get("/reportd/:id", getReportDetail);
router.get("/reportorgd/:id", getApprovedOrgreports);


// submitted reports get and approve
router.get("/supervisor/reports", verifyToken, getSubmittedReports);
router.put("/supervisor/reports/approve", verifyToken, updateReportStatus);



// router.get('/reports/approved', getApprovedReport);

// // Route to fetch submitted reports for approval
// router.get("/supervisor/reports", verifyToken, getSubmittedreports);
// router.get("/supervisor/reportssp", verifyToken, getSubmittedreportssp);

// // Route to approve or decline a reports
// router.put("/supervisor/reports/approve", verifyToken, updatereportstatus);

// router.put("/supervisor/reports/approvesp", verifyToken, updatereportsApprovalStatus);
// // Route to fetch detailed reports information for the next supervisor (GET)
// router.get("/supervisor/reports/detailed", verifyToken, getDetailedreportsForSupervisor);

module.exports = router;







