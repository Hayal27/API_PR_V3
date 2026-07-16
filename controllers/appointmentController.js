const dbconnection = require("../models/db");
const {StatusCodes} = require("http-status-codes");
//take an appointment
const addAppointment = (req, res) => {
    // const { title, description, startDate, endDate, appointmentDate, appointmentLocation } = req.body;
    const { plan_id, appointmentBy, subject, description, appointmentDate, updated_at, updatedBy } = req.body;
    // const userId = req.user.userId;
    const query = 'INSERT INTO appointment (plan_id, appointmentBy, subject, description, appointmentDate) VALUES (?, ?, ?, ?, ?)';
    dbconnection.query(query, [plan_id, appointmentBy, subject, description, appointmentDate], (err, result) => {
      if (err) throw err;
      res.status(201).json({ message: 'Appointment created', taskId: result.insertId });
    });
  };
  const planRetriveAppointment = (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM appointment WHERE appointmentBy=?";
    dbconnection.query(sql, [id], (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
      return res.status(200).json(data);
    });
  };
  

module.exports = {addAppointment, planRetriveAppointment}