let mysql;
try {
    mysql = require("mysql2");
    console.log("✅ Using mysql2 database driver");
} catch (e) {
    mysql = require("mysql");
    console.warn("⚠️  Using legacy mysql database driver (recommend running: npm install mysql2)");
}

require("dotenv").config();

let rawHost = (process.env.DB_HOST || "127.0.0.1").trim();
if (!rawHost || rawHost === "." || rawHost === "localhost." || rawHost.startsWith(".")) {
    rawHost = "127.0.0.1";
}

const con = mysql.createPool({
    connectionLimit: 25,
    host: rawHost,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "itpr",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    multipleStatements: true,
    connectTimeout: 10000,
    waitForConnections: true,
    queueLimit: 0
});

// Handle errors on pooled connections to avoid crashing the server
con.on('error', (err) => {
    console.error('⚠️  MySQL Pool Error:', err.message);
});

// Ensure positions & employee_positions tables exist
con.query(`
  CREATE TABLE IF NOT EXISTS positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) DEFAULT NULL,
    title VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.warn("Notice creating positions table:", err.message);
});

con.query(`
  CREATE TABLE IF NOT EXISTS employee_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    position_id INT DEFAULT NULL,
    org_node_id INT DEFAULT NULL,
    is_primary TINYINT(1) DEFAULT 1,
    is_delegation TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.warn("Notice creating employee_positions table:", err.message);
});

// Ensure specific_objectives has multi-org & supportive-org support
con.query("SHOW COLUMNS FROM specific_objectives LIKE 'org_node_ids'", (err, rows) => {
  if (!err && rows && rows.length === 0) {
    con.query("ALTER TABLE specific_objectives ADD COLUMN org_node_ids TEXT DEFAULT NULL", (err2) => {
      if (!err2) console.log('Added org_node_ids column to specific_objectives');
    });
  }
});
con.query("SHOW COLUMNS FROM specific_objectives LIKE 'supportive_org_node_ids'", (err, rows) => {
  if (!err && rows && rows.length === 0) {
    con.query("ALTER TABLE specific_objectives ADD COLUMN supportive_org_node_ids TEXT DEFAULT NULL", (err2) => {
      if (!err2) console.log('Added supportive_org_node_ids column to specific_objectives');
    });
  }
});
con.query("SHOW COLUMNS FROM employees LIKE 'position'", (err, rows) => {
  if (!err && rows && rows.length === 0) {
    con.query("ALTER TABLE employees ADD COLUMN position VARCHAR(255) DEFAULT NULL", (err2) => {
      if (!err2) console.log('Added position column to employees table');
    });
  }
});
con.query("SHOW COLUMNS FROM employee_positions LIKE 'position_id'", (err, rows) => {
  if (!err && rows && rows.length === 0) {
    con.query("ALTER TABLE employee_positions ADD COLUMN position_id INT DEFAULT NULL", (err2) => {
      if (!err2) console.log('Added position_id column to employee_positions table');
    });
  }
});

// ── M&E Compliance Tables ────────────────────────────────────────────────────

// Risk Flags table (Section 5: Risk Monitoring)
con.query(`
  CREATE TABLE IF NOT EXISTS risk_flags (
    risk_id           INT AUTO_INCREMENT PRIMARY KEY,
    action_plan_id    INT NOT NULL,
    risk_level        ENUM('critical','high','medium','low') NOT NULL DEFAULT 'medium',
    title             VARCHAR(255) NOT NULL,
    description       TEXT,
    mitigation        TEXT,
    escalation_target VARCHAR(100),
    status            ENUM('open','monitoring','resolved') DEFAULT 'open',
    reported_by       INT,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.warn('Notice creating risk_flags table:', err.message);
  else console.log('✅ risk_flags table ready');
});

// Data Quality Checks table (Section 4: Data Quality Standards)
con.query(`
  CREATE TABLE IF NOT EXISTS data_quality_checks (
    check_id          INT AUTO_INCREMENT PRIMARY KEY,
    action_plan_id    INT NOT NULL,
    reporting_period  VARCHAR(20),
    is_valid          TINYINT(1) DEFAULT 0,
    is_reliable       TINYINT(1) DEFAULT 0,
    is_timely         TINYINT(1) DEFAULT 0,
    is_complete       TINYINT(1) DEFAULT 0,
    is_accurate       TINYINT(1) DEFAULT 0,
    is_integral       TINYINT(1) DEFAULT 0,
    supervisor_id     INT,
    supervisor_note   TEXT,
    signed_off_at     TIMESTAMP NULL,
    submitted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_plan_period (action_plan_id, reporting_period)
  )
`, (err) => {
  if (err) console.warn('Notice creating data_quality_checks table:', err.message);
  else console.log('✅ data_quality_checks table ready');
});

// Evaluations table (Section 6: Evaluation Plan)
con.query(`
  CREATE TABLE IF NOT EXISTS evaluations (
    evaluation_id    INT AUTO_INCREMENT PRIMARY KEY,
    type             ENUM('mid_term','annual','thematic') NOT NULL,
    title            VARCHAR(255) NOT NULL,
    timing           VARCHAR(100),
    key_questions    TEXT,
    led_by           VARCHAR(255),
    status           ENUM('planned','in_progress','completed') DEFAULT 'planned',
    findings         TEXT,
    recommendations  TEXT,
    period_year      INT,
    created_by       INT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) console.warn('Notice creating evaluations table:', err.message);
  else console.log('✅ evaluations table ready');
});

console.log('Connected to MySQL database via connection pool');

// Schema Synchronization with plan_report.sql
const ensureColumnExists = (tableName, columnName, columnDef) => {
  con.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE '${columnName}'`, (err, rows) => {
    if (!err && rows && rows.length === 0) {
      con.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnDef}`, (err2) => {
        if (!err2) console.log(`✅ Added ${columnName} column to ${tableName}`);
        else console.warn(`Notice adding ${columnName} to ${tableName}:`, err2.message);
      });
    }
  });
};

// 1. specific_objective_details (Action Plans) columns
ensureColumnExists('specific_objective_details', 'weight', 'DECIMAL(10,2) DEFAULT 0.00');
ensureColumnExists('specific_objective_details', 'outcome', 'DECIMAL(15,4) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'CIbaseline', 'DECIMAL(15,2) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'CIplan', 'DECIMAL(15,2) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'CIoutcome', 'DECIMAL(15,2) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'CIexecution_percentage', 'DECIMAL(5,2) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'income_exchange', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'cost_type', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'employment_type', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'incomeName', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'costName', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'project_type', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'income_plan_type', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'employee_of', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'goal_id', 'INT DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'plan_type', 'VARCHAR(255) DEFAULT NULL');
ensureColumnExists('specific_objective_details', 'editing_status', "ENUM('active','deactivate') NOT NULL DEFAULT 'active'");
ensureColumnExists('specific_objective_details', 'reporting', "ENUM('active','deactivate') NOT NULL DEFAULT 'active'");

// 2. specific_objectives (KPIs) columns
ensureColumnExists('specific_objectives', 'weight', 'DECIMAL(10,2) DEFAULT 100.00');
ensureColumnExists('specific_objectives', 'plan_type', "VARCHAR(100) DEFAULT 'general'");
ensureColumnExists('specific_objectives', 'org_node_ids', 'TEXT DEFAULT NULL');
ensureColumnExists('specific_objectives', 'supportive_org_node_ids', 'TEXT DEFAULT NULL');
ensureColumnExists('specific_objectives', 'view', "ENUM('የፋይናንስ ዕይታ','የተገልጋይ ዕይታ','የውስጥ አሰራር ዕይታ','የመማማርና ዕድገት ዕይታ') DEFAULT NULL");
ensureColumnExists('specific_objectives', 'income_id', 'INT DEFAULT NULL');
ensureColumnExists('specific_objectives', 'cost_id', 'INT DEFAULT NULL');

// 3. objectives columns
ensureColumnExists('objectives', 'goal_id', 'INT DEFAULT NULL');
ensureColumnExists('objectives', 'weight', 'FLOAT DEFAULT 100');
ensureColumnExists('objectives', 'created_by', 'INT DEFAULT NULL');
ensureColumnExists('objectives', 'year', 'INT DEFAULT NULL');
ensureColumnExists('objectives', 'quarter', 'VARCHAR(2) DEFAULT NULL');
ensureColumnExists('objectives', 'employee_id', 'INT DEFAULT NULL');

// 4. goals columns
ensureColumnExists('goals', 'weight', 'FLOAT DEFAULT 100');
ensureColumnExists('goals', 'created_by', 'INT DEFAULT NULL');
ensureColumnExists('goals', 'year', 'INT DEFAULT NULL');
ensureColumnExists('goals', 'quarter', 'VARCHAR(2) DEFAULT NULL');
ensureColumnExists('goals', 'employee_id', 'INT DEFAULT NULL');

// 5. monthly_tasks & weekly_tasks columns
ensureColumnExists('monthly_tasks', 'actual_amount', 'DECIMAL(15,4) DEFAULT NULL');
ensureColumnExists('weekly_tasks', 'actual_amount', 'DECIMAL(15,4) DEFAULT NULL');

module.exports = con;

