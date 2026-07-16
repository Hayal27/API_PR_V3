// server.js
const express = require("express");
const cors = require("cors");

// imoprting the routes 
const userRoutes = require('./routes/userRoutes.js'); // Import user routes
const employeeRoutes = require('./routes/employeeRoutes.js')
const planRoutes = require('./routes/planRoutes.js')
const reportRoutes = require('./routes/reportRoutes.js')
const dashboardRoutes = require('./routes/dashboardRoutes.js')
const analyticsRoutes = require('./routes/analyticRoutes.js');
// const approvalRoutes = require('./routes/approvalRoutes');
// const approvalWorkflowRoutes = require('./routes/approvalWorkflowRoutes.js')
const session = require('express-session');

const authMiddleware = require("./middleware/authMiddleware.js");
// const fileUploadMiddleware = require("./middleware/fileUploadMiddleware.js");
const loggingMiddleware = require("./middleware/loggingMiddleware.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(session({
  secret: 'hayaltamrat@27', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30000// Session expiration time (1 hour in milliseconds)
  }
}));

app.use(express.json()); // Middleware to parse JSON requests
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded requests
app.use(loggingMiddleware); // Logs every request

// using the routes Routes
app.use('/api', userRoutes); // Use user routes
app.use('/api',employeeRoutes)
app.use('/api',planRoutes)
app.use('/api',dashboardRoutes)
app.use('/api',reportRoutes)
app.use('/api',analyticsRoutes);

// app.use('/api/approvals', approvalRoutes);
// app.use('/api',approvalWorkflowRoutes)
app.post("/login", authMiddleware.login);
app.put("/logout/:user_id", authMiddleware.logout);

// Serve static files from the public directory if needed
// app.use('/images', express.static('public/images'));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});
