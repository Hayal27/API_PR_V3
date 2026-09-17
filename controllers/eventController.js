// eventController

const { sequelize } = require('../models/index');
const { StatusCodes } = require('http-status-codes');

// Insert event route
const addEvents = async (req, res) => {
  const { title, type, author, location, start, end } = req.body;

  // Check if all necessary fields are provided
  if (!title || !type || !author || !location || !start || !end) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'All fields are required.' });
  }

  // Validate date format (assuming start and end are in ISO format) and start <= end
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Invalid date format.' });
  }
  if (startDate > endDate) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Start date cannot be later than end date.' });
  }

  try {
    const sql = 'INSERT INTO event (title, type, author, location, start, end, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())';
    const [result] = await sequelize.query(sql, {
      replacements: [title, type, author, location, start, end]
    });

    // Successful response with newly created event details
    res.status(StatusCodes.CREATED).json({
      message: 'Event created successfully.',
      event: { id: result, title, type, author, location, start, end }
    });
  } catch (err) {
    console.error('Database Error:', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Database error' });
  }
};

module.exports = { addEvents };
