require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

// Importing Routes
const userRoutes = require("./routes/userRoutes.js");
const employeeRoutes = require("./routes/employeeRoutes.js");
const planRoutes = require("./routes/planRoutes.js");
const reportRoutes = require("./routes/reportRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes.js");
const analyticsRoutes = require("./routes/analyticRoutes.js");
const menuPermissionRoutes = require("./routes/menuPermissions.js");
const fileRoutes = require("./routes/fileRoutes.js");
const supervisorCommentsRoutes = require("./routes/supervisorCommentsRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");
const meetingRoutes = require("./routes/meetingRoutes.js");
const completedPlansRoutes = require("./routes/completedPlansRoutes.js");
const auditLogRoutes = require("./routes/auditLogRoutes.js");
const passwordRoutes = require("./routes/passwordRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const taskAssignmentRoutes = require("./routes/taskAssignmentRoutes.js");
const dailyTaskRoutes = require("./routes/dailyTaskRoutes.js");
const aiRoutes = require("./routes/aiRoutes.js");
const DeadlineScheduler = require("./services/deadlineScheduler.js");
const telegramBot = require("./services/telegramBot.js");
const ReminderScheduler = require("./services/reminderScheduler.js");
const authMiddleware = require("./middleware/authMiddleware.js");
const loggingMiddleware = require("./middleware/loggingMiddleware.js");

const app = express();
const PORT = process.env.PORT;

// Middleware
const corsOptions = {
  origin: "*", // Allow all origins
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};
app.use(cors(corsOptions));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 } // 1 hour session expiration
}));

// Middleware to serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware); // Logs every request

// Using Routes
app.use("/api", userRoutes);
app.use("/api", employeeRoutes);
app.use("/api", planRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", reportRoutes);
app.use("/api", analyticsRoutes);
app.use("/api/menu-permissions", menuPermissionRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/supervisor-comments", supervisorCommentsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", taskRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/completed-plans", completedPlansRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/task-assignments", taskAssignmentRoutes);
app.use("/api/daily-tasks", dailyTaskRoutes);
app.use("/api", aiRoutes);

app.post("/login", authMiddleware.login);
app.put("/logout/:user_id", authMiddleware.logout);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production"
  });
});

// Root Route Handler
app.get("/", (req, res) => {
  res.status(200).json({
    message: "ITPR Backend API Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/health",
      api: "/api/*",
      login: "POST /login",
      logout: "PUT /logout/:user_id"
    }
  });
});

// 404 Handler
app.use((req, res) => {
  console.warn(`⚠️  404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    message: "Endpoint not found",
    path: req.path,
    method: req.method
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp
  });

  const logMessage = `[${timestamp}] ${req.method} ${req.path} - ${err.message}\nStack: ${err.stack}\n--------------------------------------------------\n`;
  fs.appendFile(path.join(__dirname, 'error.log'), logMessage, (fsErr) => {
    if (fsErr) console.error('Failed to write to error log:', fsErr);
  });

  res.status(err.status || 500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
    timestamp
  });
});

// Catch Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  const logMessage = `[${new Date().toISOString()}] UNCAUGHT EXCEPTION - ${err.message}\nStack: ${err.stack}\n--------------------------------------------------\n`;
  fs.appendFileSync(path.join(__dirname, 'error.log'), logMessage);
});

// Catch Unhandled Rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  const logMessage = `[${new Date().toISOString()}] UNHANDLED REJECTION - ${reason}\n--------------------------------------------------\n`;
  fs.appendFileSync(path.join(__dirname, 'error.log'), logMessage);
});

// Start Server and Listen on All Network Interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

  // Initialize deadline scheduler
  DeadlineScheduler.init();
  ReminderScheduler.init();
  console.log('Deadline and Reminder schedulers initialized');
});
