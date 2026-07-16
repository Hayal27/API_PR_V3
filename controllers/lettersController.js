const dbconnection = require("../models/db");
const {StatusCodes} = require("http-status-codes");

const getAllLetters = (req, res) => {
    const sql = "SELECT * FROM letter";
    dbconnection.query(sql, (err, data) => {
      if (err) return res.json("error1 " + err);
      return res.json(data);
    });
  };
 const planWithLetter =  (req, res) => {
    try {
      const plan =  dbconnection.query(`
        SELECT i.*, l.*
        FROM plan i
        LEFT JOIN letter l ON i.plan_id = l.plan_id
      `);
      res.json(plan);
    } catch (error) {
      res.status(500).send('Server error');
    }
  }
  module.exports = {getAllLetters, planWithLetter};