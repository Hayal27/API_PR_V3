const dbconnection = require("../models/db");
const {StatusCodes} = require("http-status-codes");
//const get plan status
const getApplicants =(req, res) =>{
      const sql = "SELECT * FROM applicants";
      dbconnection.query(sql, (err, data) => {
      if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'Database query error' });
          return;
      }
  
      res.json(data);
    });
  }
module.exports = getApplicants;