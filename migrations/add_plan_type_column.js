/**
 * Migration: Add plan_type column to specific_objectives table
 * Run: node backend/migrations/add_plan_type_column.js
 */
const con = require('../models/db');

const migrations = [
  `ALTER TABLE specific_objectives ADD COLUMN plan_type VARCHAR(100) DEFAULT 'general'`,
];

async function runMigrations() {
  for (const sql of migrations) {
    await new Promise((resolve) => {
      con.query(sql, (err) => {
        if (err) {
          if (err.code === 'ER_DUP_FIELDNAME') {
            console.log('Column plan_type already exists in specific_objectives.');
          } else {
            console.error('Migration error:', err.message);
          }
        } else {
          console.log('Migration applied:', sql);
        }
        resolve();
      });
    });
  }
  console.log('Migration complete.');
  process.exit(0);
}

runMigrations();
