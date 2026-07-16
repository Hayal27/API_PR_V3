const dbconnection = require("../models/db");
const {StatusCodes} = require("http-status-codes");
const addReference = (req, res) => {
    const { plan_id, recipients, subject, description, createdBy, updatedBy } = req.body;
  
    const sql = 'INSERT INTO refered (plan_id, recipients, subject, description, createdBy) VALUES (?, ?, ?, ?, ?)';
    const values = [plan_id, recipients, subject, description, createdBy];
  
    dbconnection.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error adding reference:', err);
        return res.status(500).json({ message: 'Failed to add reference' });
      }
  
      console.log('Reference added successfully');
      return res.status(200).json({ message: 'Reference added successfully' });
    });
};

const planRetriveRefer = (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM refered WHERE recipients=?";
  dbconnection.query(sql, [id], (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.status(200).json(data);
  });
};



  module.exports = {addReference, planRetriveRefer}