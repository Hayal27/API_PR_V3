const { sequelize } = require('../models/index');
const { QueryTypes } = require('sequelize');

const getApplicants = async (req, res) => {
  try {
    const data = await sequelize.query('SELECT * FROM applicants', { type: QueryTypes.SELECT });
    res.json(data);
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ error: 'Database query error' });
  }
};

module.exports = getApplicants;