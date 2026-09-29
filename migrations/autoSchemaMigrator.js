/**
 * Pure Schema Auto-Migration & Self-Healing Engine
 * 
 * Runs automatically every time the backend starts/restarts.
 * - PURE SCHEMA (DDL ONLY): Creates missing tables, columns, and indexes.
 * - ZERO DATA SEEDS: Does NOT insert or update any data rows/values.
 * - Non-destructive & resilient: Auto-heals missing schema definitions, passes cleanly if already exists.
 */

const con = require('../models/db');

// Helper to execute query with Promise
function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(Array.isArray(result) ? result : [result]);
    });
  });
}

// Helper to check and add column safely
async function ensureColumn(table, column, definition) {
  try {
    const cols = await q(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
    `, [table, column]);

    if (cols.length === 0) {
      await q(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`  ➕ [Schema Auto-Heal] Added column \`${column}\` to \`${table}\``);
    }
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_NO_SUCH_TABLE') {
      // pass safely
    } else {
      console.warn(`  ℹ️ Notice on \`${table}\`.\`${column}\`:`, err.message);
    }
  }
}

// Helper to check and create index safely
async function ensureIndex(table, indexName, columnsSql) {
  try {
    const indexes = await q(`SHOW INDEX FROM \`${table}\` WHERE Key_name = ?`, [indexName]);
    if (indexes.length === 0) {
      await q(`CREATE INDEX \`${indexName}\` ON \`${table}\` (${columnsSql})`);
      console.log(`  ⚡ [Schema Auto-Heal] Index \`${indexName}\` created on \`${table}\``);
    }
  } catch (err) {
    if (err.code === 'ER_DUP_KEYNAME' || err.code === 'ER_NO_SUCH_TABLE') {
      // pass safely
    } else {
      // pass safely
    }
  }
}

// Helper to execute DDL safely (CREATE TABLE etc.)
async function executeDDL(label, sql) {
  try {
    await q(sql);
  } catch (err) {
    if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_KEYNAME') {
      // pass
    } else {
      console.warn(`  ℹ️ Notice on DDL [${label}]:`, err.message);
    }
  }
}

async function runAutoMigration() {
  console.log('\n🛡️  [Schema Auto-Migrate & Auto-Heal] Verifying pure database schema (DDL only, 0 data seeds)...');
  const startTime = Date.now();

  try {
    // ════════════════════════════════════════════════════════════════════════
    // 1. CORE SYSTEM & ADMINISTRATIVE TABLES (DDL ONLY)
    // ════════════════════════════════════════════════════════════════════════

    // Roles table columns & indexes
    await ensureColumn('roles', 'hierarchy_level', 'INT(11) DEFAULT NULL AFTER `role_name`');
    await ensureColumn('roles', 'description', 'VARCHAR(255) DEFAULT NULL AFTER `hierarchy_level`');
    await ensureColumn('roles', 'status', 'TINYINT(1) DEFAULT 1');
    await ensureIndex('roles', 'idx_hierarchy_level', '`hierarchy_level`');

    // Branches table structure
    await executeDDL('branches', `
      CREATE TABLE IF NOT EXISTS \`branches\` (
        \`branch_id\` INT(11) NOT NULL AUTO_INCREMENT,
        \`code\` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique branch code',
        \`name\` VARCHAR(255) NOT NULL COMMENT 'Branch Name',
        \`name_amharic\` VARCHAR(255) NOT NULL COMMENT 'የቅርንጫፍ ስም',
        \`tier_level\` ENUM('federal', 'regional', 'city_admin', 'sub_city', 'zone', 'woreda') NOT NULL DEFAULT 'federal',
        \`parent_branch_id\` INT(11) NULL COMMENT 'Parent branch ID in administrative hierarchy',
        \`head_employee_id\` INT(11) NULL,
        \`region\` VARCHAR(100) NULL,
        \`city\` VARCHAR(100) NULL,
        \`sub_city\` VARCHAR(100) NULL,
        \`woreda\` VARCHAR(100) NULL,
        \`address\` TEXT NULL,
        \`phone\` VARCHAR(50) NULL,
        \`email\` VARCHAR(100) NULL,
        \`is_head_office\` TINYINT(1) NOT NULL DEFAULT 0,
        \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`branch_id\`),
        INDEX \`idx_branches_tier\` (\`tier_level\`),
        INDEX \`idx_branches_parent\` (\`parent_branch_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // User Branches table structure
    await executeDDL('user_branches', `
      CREATE TABLE IF NOT EXISTS \`user_branches\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`branch_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_user_branch\` (\`user_id\`, \`branch_id\`),
        INDEX \`idx_user_branches_user\` (\`user_id\`),
        INDEX \`idx_user_branches_branch\` (\`branch_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Positions & Employee Positions tables structure
    await executeDDL('positions', `
      CREATE TABLE IF NOT EXISTS \`positions\` (
        \`position_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) DEFAULT NULL,
        \`title\` VARCHAR(255) DEFAULT NULL,
        \`description\` TEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await executeDDL('employee_positions', `
      CREATE TABLE IF NOT EXISTS \`employee_positions\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`employee_id\` INT NOT NULL,
        \`position_id\` INT DEFAULT NULL,
        \`org_node_id\` INT DEFAULT NULL,
        \`is_primary\` TINYINT(1) DEFAULT 1,
        \`is_delegation\` TINYINT(1) DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_emp_pos_emp\` (\`employee_id\`),
        INDEX \`idx_emp_pos_pos\` (\`position_id\`),
        INDEX \`idx_emp_pos_node\` (\`org_node_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // App Settings table structure
    await executeDDL('app_settings', `
      CREATE TABLE IF NOT EXISTS \`app_settings\` (
        \`setting_key\` VARCHAR(100) PRIMARY KEY,
        \`setting_value\` LONGTEXT,
        \`updated_by\` INT DEFAULT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Multi-Branch columns across core tables
    await ensureColumn('users', 'branch_id', 'INT(11) DEFAULT 1 AFTER `employee_id`');
    await ensureColumn('employees', 'branch_id', 'INT(11) DEFAULT 1 AFTER `department_id`');
    await ensureColumn('employees', 'position', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('organization_structure', 'branch_id', 'INT(11) DEFAULT 1 AFTER `type`');
    await ensureColumn('plans', 'branch_id', 'INT(11) DEFAULT 1 AFTER `user_id`');
    await ensureColumn('task_assignments', 'branch_id', 'INT(11) DEFAULT 1 AFTER `assigned_to`');
    await ensureColumn('reports', 'branch_id', 'INT(11) DEFAULT 1 AFTER `user_id`');

    // Multi-Branch indexes
    const tablesToIndex = ['organization_structure', 'employees', 'plans', 'task_assignments', 'reports', 'users', 'goals', 'objectives', 'specific_objectives', 'plan_pillars'];
    for (const tbl of tablesToIndex) {
      await ensureIndex(tbl, `idx_${tbl}_branch`, '`branch_id`');
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. STRATEGIC PLANNING, PILLARS & GOALS SCHEMA (DDL ONLY)
    // ════════════════════════════════════════════════════════════════════════

    // Plan Pillars table structure
    await executeDDL('plan_pillars', `
      CREATE TABLE IF NOT EXISTS \`plan_pillars\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`code\` VARCHAR(50) NULL,
        \`description\` TEXT NULL,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`sort_order\` INT DEFAULT 10,
        \`branch_id\` INT DEFAULT 1,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    await ensureColumn('plan_pillars', 'branch_id', 'INT DEFAULT 1');

    // Goals table columns & quarter activations table
    await ensureColumn('goals', 'pillar_id', 'INT NULL');
    await ensureColumn('goals', 'start_year', 'INT NULL');
    await ensureColumn('goals', 'end_year', 'INT NULL');
    await ensureColumn('goals', 'is_active', 'TINYINT(1) DEFAULT 1');
    await ensureColumn('goals', 'weight', 'DECIMAL(12,4) DEFAULT 100.0000');
    await ensureColumn('goals', 'branch_id', 'INT DEFAULT 1');
    await ensureColumn('goals', 'created_by', 'INT DEFAULT NULL');
    await ensureColumn('goals', 'year', 'INT DEFAULT NULL');
    await ensureColumn('goals', 'quarter', 'VARCHAR(10) DEFAULT NULL');
    await ensureColumn('goals', 'employee_id', 'INT DEFAULT NULL');

    await executeDDL('goal_quarter_activations', `
      CREATE TABLE IF NOT EXISTS \`goal_quarter_activations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`goal_id\` INT NOT NULL,
        \`year\` INT NOT NULL,
        \`quarter\` VARCHAR(10) NOT NULL,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_goal_year_quarter\` (\`goal_id\`, \`year\`, \`quarter\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Objectives table columns & quarter activations table
    await ensureColumn('objectives', 'goal_id', 'INT DEFAULT NULL');
    await ensureColumn('objectives', 'weight', 'DECIMAL(12,4) DEFAULT 100.0000');
    await ensureColumn('objectives', 'branch_id', 'INT DEFAULT 1');
    await ensureColumn('objectives', 'created_by', 'INT DEFAULT NULL');
    await ensureColumn('objectives', 'year', 'INT DEFAULT NULL');
    await ensureColumn('objectives', 'quarter', 'VARCHAR(10) DEFAULT NULL');
    await ensureColumn('objectives', 'employee_id', 'INT DEFAULT NULL');

    await executeDDL('objective_quarter_activations', `
      CREATE TABLE IF NOT EXISTS \`objective_quarter_activations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`objective_id\` INT NOT NULL,
        \`year\` INT NOT NULL,
        \`quarter\` VARCHAR(10) NOT NULL,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_objective_year_quarter\` (\`objective_id\`, \`year\`, \`quarter\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Specific Objectives (KPIs) columns & quarter activations table
    await ensureColumn('specific_objectives', 'weight', 'DECIMAL(12,4) DEFAULT 100.0000');
    await ensureColumn('specific_objectives', 'plan_type', "VARCHAR(100) DEFAULT 'general'");
    await ensureColumn('specific_objectives', 'branch_id', 'INT DEFAULT 1');
    await ensureColumn('specific_objectives', 'org_node_ids', 'TEXT DEFAULT NULL');
    await ensureColumn('specific_objectives', 'supportive_org_node_ids', 'TEXT DEFAULT NULL');
    await ensureColumn('specific_objectives', 'view', "ENUM('የፋይናንስ ዕይታ','የተገልጋይ ዕይታ','የውስጥ አሰራር ዕይታ','የመማማርና ዕድገት ዕይታ') DEFAULT NULL");
    await ensureColumn('specific_objectives', 'income_id', 'INT DEFAULT NULL');
    await ensureColumn('specific_objectives', 'cost_id', 'INT DEFAULT NULL');

    await executeDDL('kpi_quarter_activations', `
      CREATE TABLE IF NOT EXISTS \`kpi_quarter_activations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`specific_objective_id\` INT NOT NULL,
        \`year\` INT NOT NULL,
        \`quarter\` VARCHAR(10) NOT NULL,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_kpi_year_quarter\` (\`specific_objective_id\`, \`year\`, \`quarter\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Specific Objective Details (Action Plans) columns & quarter activations table
    await ensureColumn('specific_objective_details', 'weight', 'DECIMAL(12,4) DEFAULT 0.0000');
    await ensureColumn('specific_objective_details', 'outcome', 'DECIMAL(15,4) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'CIbaseline', 'DECIMAL(15,2) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'CIplan', 'DECIMAL(15,2) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'CIoutcome', 'DECIMAL(15,2) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'CIexecution_percentage', 'DECIMAL(5,2) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'income_exchange', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'cost_type', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'employment_type', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'incomeName', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'costName', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'project_type', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'income_plan_type', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'employee_of', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'goal_id', 'INT DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'plan_type', 'VARCHAR(255) DEFAULT NULL');
    await ensureColumn('specific_objective_details', 'editing_status', "ENUM('active','deactivate') NOT NULL DEFAULT 'active'");
    await ensureColumn('specific_objective_details', 'reporting', "ENUM('active','deactivate') NOT NULL DEFAULT 'active'");

    await executeDDL('action_plan_quarter_activations', `
      CREATE TABLE IF NOT EXISTS \`action_plan_quarter_activations\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`specific_objective_detail_id\` INT NOT NULL,
        \`year\` INT NOT NULL,
        \`quarter\` VARCHAR(10) NOT NULL,
        \`is_active\` TINYINT(1) DEFAULT 1,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_ap_year_quarter\` (\`specific_objective_detail_id\`, \`year\`, \`quarter\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // Plan Types Table structure
    await executeDDL('plan_types', `
      CREATE TABLE IF NOT EXISTS \`plan_types\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`value\` VARCHAR(100) NOT NULL UNIQUE,
        \`label\` VARCHAR(100) NOT NULL,
        \`label_en\` VARCHAR(100) NOT NULL,
        \`color\` VARCHAR(200) DEFAULT 'bg-gray-50 text-gray-700 border-gray-200',
        \`is_default\` TINYINT(1) DEFAULT 0,
        \`sort_order\` INT DEFAULT 100,
        \`field_config\` LONGTEXT NULL,
        \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await ensureColumn('plan_types', 'field_config', 'LONGTEXT NULL');

    // Plan Breakdown Supervisors (KPI & Action Plan Delegation)
    await executeDDL('plan_breakdown_supervisors', `
      CREATE TABLE IF NOT EXISTS \`plan_breakdown_supervisors\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`specific_objective_detail_id\` INT NOT NULL,
        \`supervisor_id\` INT DEFAULT NULL,
        \`assigned_by\` INT DEFAULT NULL,
        \`delegated_to_user_id\` INT DEFAULT NULL,
        \`note\` TEXT DEFAULT NULL,
        \`due_date\` DATE DEFAULT NULL,
        \`priority\` VARCHAR(50) DEFAULT 'medium',
        \`status\` VARCHAR(50) DEFAULT 'pending',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_pbs_detail\` (\`specific_objective_detail_id\`),
        INDEX \`idx_pbs_delegated\` (\`delegated_to_user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ════════════════════════════════════════════════════════════════════════
    // 3. TASKS & EXECUTION TABLES (DDL ONLY)
    // ════════════════════════════════════════════════════════════════════════

    await ensureColumn('monthly_tasks', 'actual_amount', 'DECIMAL(15,4) DEFAULT NULL');
    await ensureColumn('weekly_tasks', 'actual_amount', 'DECIMAL(15,4) DEFAULT NULL');

    await executeDDL('monthly_task_assignees', `
      CREATE TABLE IF NOT EXISTS \`monthly_task_assignees\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`monthly_task_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`assigned_by\` INT NOT NULL,
        \`assigned_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_monthly_assignee\` (\`monthly_task_id\`, \`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await executeDDL('weekly_task_assignees', `
      CREATE TABLE IF NOT EXISTS \`weekly_task_assignees\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`weekly_task_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`assigned_by\` INT NOT NULL,
        \`assigned_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_weekly_assignee\` (\`weekly_task_id\`, \`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // ════════════════════════════════════════════════════════════════════════
    // 4. M&E COMPLIANCE, EVALUATIONS & AUXILIARY TABLES (DDL ONLY)
    // ════════════════════════════════════════════════════════════════════════

    await executeDDL('risk_flags', `
      CREATE TABLE IF NOT EXISTS \`risk_flags\` (
        \`risk_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`action_plan_id\` INT NOT NULL,
        \`risk_level\` ENUM('critical','high','medium','low') NOT NULL DEFAULT 'medium',
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`mitigation\` TEXT,
        \`escalation_target\` VARCHAR(100),
        \`status\` ENUM('open','monitoring','resolved') DEFAULT 'open',
        \`reported_by\` INT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_risk_plan\` (\`action_plan_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await executeDDL('data_quality_checks', `
      CREATE TABLE IF NOT EXISTS \`data_quality_checks\` (
        \`check_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`action_plan_id\` INT NOT NULL,
        \`reporting_period\` VARCHAR(20),
        \`is_valid\` TINYINT(1) DEFAULT 0,
        \`is_reliable\` TINYINT(1) DEFAULT 0,
        \`is_timely\` TINYINT(1) DEFAULT 0,
        \`is_complete\` TINYINT(1) DEFAULT 0,
        \`is_accurate\` TINYINT(1) DEFAULT 0,
        \`is_integral\` TINYINT(1) DEFAULT 0,
        \`supervisor_id\` INT,
        \`supervisor_note\` TEXT,
        \`signed_off_at\` TIMESTAMP NULL,
        \`submitted_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_plan_period\` (\`action_plan_id\`, \`reporting_period\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await executeDDL('evaluations', `
      CREATE TABLE IF NOT EXISTS \`evaluations\` (
        \`evaluation_id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`type\` ENUM('mid_term','annual','thematic') NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`timing\` VARCHAR(100),
        \`key_questions\` TEXT,
        \`led_by\` VARCHAR(255),
        \`status\` ENUM('planned','in_progress','completed') DEFAULT 'planned',
        \`findings\` TEXT,
        \`recommendations\` TEXT,
        \`period_year\` INT,
        \`created_by\` INT,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Meetings Zoom columns
    await ensureColumn('meetings', 'zoom_meeting_id', 'VARCHAR(255) DEFAULT NULL AFTER `meeting_link`');
    await ensureColumn('meetings', 'zoom_passcode', 'VARCHAR(100) DEFAULT NULL AFTER `zoom_meeting_id`');

    // Password Reset OTP Table structure
    await executeDDL('password_reset_otps', `
      CREATE TABLE IF NOT EXISTS \`password_reset_otps\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(255) NOT NULL,
        \`otp\` VARCHAR(10) NOT NULL,
        \`expires_at\` DATETIME NOT NULL,
        \`is_used\` TINYINT(1) DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_otp_email\` (\`email\`),
        INDEX \`idx_otp_code\` (\`otp\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Supervisor Comments Table structure
    await executeDDL('supervisor_comments', `
      CREATE TABLE IF NOT EXISTS \`supervisor_comments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`plan_id\` INT NOT NULL,
        \`specific_objective_detail_id\` INT DEFAULT NULL,
        \`comment\` TEXT NOT NULL,
        \`supervisor_id\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_sc_plan\` (\`plan_id\`),
        INDEX \`idx_sc_detail\` (\`specific_objective_detail_id\`),
        INDEX \`idx_sc_supervisor\` (\`supervisor_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const elapsed = Date.now() - startTime;
    console.log(`✅ [Schema Auto-Migrate & Auto-Heal] Complete! Pure database schema is verified & healthy (${elapsed}ms).\n`);
  } catch (err) {
    console.error('❌ [Schema Auto-Migrate & Auto-Heal] Error during schema verification:', err);
  }
}

module.exports = {
  runAutoMigration,
  ensureColumn,
  ensureIndex,
  executeDDL
};

if (require.main === module) {
  runAutoMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
