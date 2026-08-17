/**
 * Migration: Add weight columns to specific_objectives and specific_objective_details
 * Run: node backend/migrations/add_weight_columns.js
 */
const con = require('../models/db');

const migrations = [
  `ALTER TABLE specific_objectives ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2) DEFAULT 100 COMMENT 'KPI weight (total budget for action plans)'`,
  `ALTER TABLE specific_objective_details ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2) DEFAULT 0 COMMENT 'Action plan weight contribution'`,
];

async function runMigrations() {
  for (const sql of migrations) {
    await new Promise((resolve, reject) => {
      con.query(sql, (err) => {
        if (err) {
          // Column may already exist (older MySQL without IF NOT EXISTS for columns)
          if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists, skipping.');
            resolve();
          } else {
            console.error('Migration error:', err.message);
            reject(err);
          }
        } else {
          console.log('Migration applied:', sql.substring(0, 60) + '...');
          resolve();
        }
      });
    });
  }
  console.log('All migrations complete.');
  process.exit(0);
}

runMigrations().catch((e) => { console.error(e); process.exit(1); });
