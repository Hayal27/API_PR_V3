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
const riskRoutes = require("./routes/riskRoutes.js");
const dataQualityRoutes = require("./routes/dataQualityRoutes.js");
const evaluationRoutes = require("./routes/evaluationRoutes.js");
const executiveReportRoutes = require("./routes/executiveReportRoutes.js");
const reportModuleRoutes = require("./routes/reportModuleRoutes.js");
const kpiAssignmentRoutes = require("./routes/kpiAssignmentRoutes.js");
const DeadlineScheduler = require("./services/deadlineScheduler.js");
const telegramBot = require("./services/telegramBot.js");
const ReminderScheduler = require("./services/reminderScheduler.js");
const BackupScheduler = require("./services/backupScheduler.js");
const authMiddleware = require("./middleware/authMiddleware.js");
const loggingMiddleware = require("./middleware/loggingMiddleware.js");

const app = express();
const PORT = process.env.PORT;

// Middleware - Allow all origins, methods, and headers
app.use(cors({
  origin: "*",
  methods: "*",
  allowedHeaders: "*"
}));

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
app.use("/api/kpis", kpiAssignmentRoutes); // MUST be before planRoutes (which has wildcard /kpis/:id)
app.use("/api", planRoutes);
app.use("/api/plan", planRoutes);   // also expose plan routes under /api/plan prefix
app.use("/api/dashboard", dashboardRoutes);
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
app.use("/api", riskRoutes);
app.use("/api", dataQualityRoutes);
app.use("/api", evaluationRoutes);
app.use("/api/executive-report", executiveReportRoutes);
app.use("/api/report-module", reportModuleRoutes);

app.post("/login", authMiddleware.login);
app.post("/api/login", authMiddleware.login);
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
const con = require('./models/db');

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "production"}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

  // Initialize deadline, reminder, and backup schedulers
  DeadlineScheduler.init();
  ReminderScheduler.init();
  BackupScheduler.init();
  console.log('Deadline, Reminder, and Automated Backup schedulers initialized');

  // ── Auto-register menu items that may not yet exist ──────────────────────
  setTimeout(() => autoRegisterMenuItems(), 2000); // wait 2 s for DB to settle
});

/**
 * Idempotently ensures required menu items exist in menu_items + role_permissions.
 * Safe to run on every startup — uses INSERT IGNORE / existence checks.
 */
function autoRegisterMenuItems() {
  const db = con;

  const menus = [
    {
      name: 'Action Plan Breakdown',
      path: '/plan/action-plan-breakdown',
      icon: 'bi bi-diagram-3',
      fileName: 'ActionPlanBreakdownPage.jsx',
      sortOrder: 55,
      parentPath: '/plan/View_myplan',
      roles: [1, 2, 3, 4, 29],
    },
    {
      name: 'M&E Compliance',
      path: '/me/compliance',
      icon: 'bi bi-shield-check',
      fileName: 'MECompliancePage.jsx',
      sortOrder: 60,
      parentPath: null,
      roles: [1, 2, 3, 4, 29],
    },
    {
      name: 'Executive Report',
      path: '/reports/executive',
      icon: 'bi bi-bar-chart-steps',
      fileName: 'ExecutiveReportPage.jsx',
      sortOrder: 65,
      parentPath: null,
      roles: [1, 2, 3, 4, 5, 29],
    },
    {
      name: 'KPI Position Assignment',
      path: '/kpi/my-assigned',
      icon: 'bi bi-award-fill',
      fileName: 'KPIAssignmentPage.jsx',
      sortOrder: 4,
      parentPath: '#',
      roles: [1, 2, 3, 4, 5, 29],
    },
    {
      name: 'Assign New Task',
      path: '/tasks/assignment/assign',
      icon: 'bi bi-plus-circle',
      fileName: 'TaskAssignment.jsx',
      sortOrder: 1,
      parentPath: '#',
      roles: [1, 2, 3, 4, 5, 29],
    },
    {
      name: 'Sent Tasks',
      path: '/tasks/assignment/sent',
      icon: 'bi bi-send',
      fileName: 'TaskAssignment.jsx',
      sortOrder: 2,
      parentPath: '#',
      roles: [1, 2, 3, 4, 5, 29],
    },
    {
      name: 'Received Tasks',
      path: '/tasks/assignment/received',
      icon: 'bi bi-inbox',
      fileName: 'TaskAssignment.jsx',
      sortOrder: 3,
      parentPath: '#',
      roles: [1, 2, 3, 4, 5, 29],
    },
    {
      name: 'Subordinates',
      path: '/tasks/assignment/subordinates',
      icon: 'bi bi-people',
      fileName: 'TaskAssignment.jsx',
      sortOrder: 4,
      parentPath: '#',
      roles: [1, 2, 3, 4, 5, 29],
    },
  ];

  menus.forEach(menu => {
    // 1. Resolve parent_id (optional)
    const resolveParent = menu.parentPath
      ? new Promise(resolve =>
          db.query('SELECT id FROM menu_items WHERE path = ? LIMIT 1', [menu.parentPath], (err, rows) =>
            resolve((!err && rows && rows.length > 0) ? rows[0].id : null)
          )
        )
      : Promise.resolve(null);

    resolveParent.then(parentId => {
      // 2. Check if menu already exists
      db.query('SELECT id FROM menu_items WHERE path = ? LIMIT 1', [menu.path], (err, existing) => {
        if (err) { console.error('autoRegisterMenuItems: check error', err.message); return; }

        const proceed = (menuItemId) => {
          // 3. Ensure permissions for each role
          menu.roles.forEach(roleId => {
            db.query(
              'SELECT id FROM role_permissions WHERE role_id = ? AND menu_item_id = ? LIMIT 1',
              [roleId, menuItemId],
              (pErr, pRows) => {
                if (pErr || (pRows && pRows.length > 0)) return;
                db.query(
                  'INSERT INTO role_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)',
                  [roleId, menuItemId],
                  (iErr) => {
                    if (!iErr) console.log(`✔ Menu permission granted: "${menu.name}" → role_id=${roleId}`);
                  }
                );
              }
            );
          });
        };

        if (existing && existing.length > 0) {
          proceed(existing[0].id);
        } else {
          db.query(
            'INSERT INTO menu_items (name, path, icon, parent_id, sort_order, file_name, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
            [menu.name, menu.path, menu.icon, parentId, menu.sortOrder, menu.fileName],
            (iErr, result) => {
              if (iErr) { console.error(`autoRegisterMenuItems: insert error for "${menu.name}":`, iErr.message); return; }
              console.log(`✔ Menu item registered: "${menu.name}" (id=${result.insertId})`);
              proceed(result.insertId);
            }
          );
        }
      });
    });
  });

  // Run Task Assignment child menus migration
  try {
    const autoMigrateTaskAssignmentMenus = require('./migrations/autoMigrateTaskAssignmentMenus');
    autoMigrateTaskAssignmentMenus();
  } catch (err) {
    console.error('Failed to run Task Assignment auto-migration:', err);
  }

  // Run KPI Position Assignment migration
  try {
    const addKpiPositionAssignmentMenu = require('./migrations/add_kpi_position_assignment_menu');
    addKpiPositionAssignmentMenu();
  } catch (err) {
    console.error('Failed to run KPI Position Assignment migration:', err);
  }
}

