const con = require("./db");

// Helper function for consistent error responses
const handleError = (res, error) => {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
};

// To get all plans
const getAllPlans = async (req, res) => {
    const sql = "SELECT * FROM plan";
    con.query(sql, (err, data) => {
        if (err) return handleError(res, err);
        return res.status(200).json({ success: true, data });
    });
};

// To get plans status
const getAllPlansStatus = async (req, res) => {
    const sql = "SELECT * FROM plansstatus";
    con.query(sql, (err, data) => {
        if (err) return handleError(res, err);
        return res.status(200).json({ success: true, data });
    });
};

// Change user status
const changeUserStatus = (req, res) => {
    const id = req.params.user_id;
    const val = req.body.value;

    // Validate input
    if (!id || !val) {
        return res.status(400).json({ success: false, message: 'User ID and status value are required.' });
    }

    con.query('UPDATE user SET status = ? WHERE user_id = ?', [val, id], (error, results) => {
        if (error) return handleError(res, error);
        return res.status(200).json({ success: true, message: "User status successfully updated." });
    });
};

// Get all applicants
const getAllApplicants = async (req, res) => {
    const sql = "SELECT * FROM applicants";
    con.query(sql, (err, data) => {
        if (err) return handleError(res, err);
        return res.status(200).json({ success: true, data });
    });
};

module.exports = { getAllPlans, getAllPlansStatus, changeUserStatus, getAllApplicants };
