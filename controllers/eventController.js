//eventController

const dbconnection = require("../models/db");
const { StatusCodes } = require("http-status-codes");

// Insert event route
const addEvents = (req, res) => {
    const { title, type, author, location, start, end } = req.body;

    // Check if all necessary fields are provided
    if (!title || !type || !author || !location || !start || !end) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "All fields are required." });
    }

    // Validate date format (assuming start and end are in ISO format) and start <= end
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid date format." });
    }
    if (startDate > endDate) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Start date cannot be later than end date." });
    }

    const sql = 'INSERT INTO event (title, type, author, location, start, end, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';

    dbconnection.query(sql, [title, type, author, location, start, end], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Database error" });
        }

        // Successful response with newly created event details
        res.status(StatusCodes.CREATED).json({
            message: "Event created successfully.",
            event: { id: result.insertId, title, type, author, location, start, end }
        });
    });
};

module.exports = { addEvents };
