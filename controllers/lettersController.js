const { sequelize } = require('../models/index');
const { QueryTypes } = require('sequelize');

const getAllLetters = async (req, res) => {
  try {
    const data = await sequelize.query('SELECT * FROM letter', { type: QueryTypes.SELECT });
    return res.json(data);
  } catch (err) {
    return res.json('error1 ' + err);
  }
};

const planWithLetter = async (req, res) => {
  try {
    const plan = await sequelize.query(`
      SELECT i.*, l.*
      FROM plan i
      LEFT JOIN letter l ON i.plan_id = l.plan_id
    `, { type: QueryTypes.SELECT });
    res.json(plan);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

module.exports = { getAllLetters, planWithLetter };