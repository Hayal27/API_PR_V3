/**
 * Migration: Add weight column to goals and objectives tables
 * Run: node migrations/add_goal_and_objective_weight_columns.js
 */
const con = require('../models/db');

async function run() {
  console.log('Starting goals and objectives weight column migration...');

  // 1. Add weight to goals
  try {
    await q(`ALTER TABLE goals ADD COLUMN weight FLOAT DEFAULT 100`);
    console.log('✔ Added weight column to goals table.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('→ Column weight already exists in goals table.');
    else console.error('Error adding weight to goals:', err.message);
  }

  // 2. Add weight to objectives
  try {
    await q(`ALTER TABLE objectives ADD COLUMN weight FLOAT DEFAULT 100`);
    console.log('✔ Added weight column to objectives table.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('→ Column weight already exists in objectives table.');
    else console.error('Error adding weight to objectives:', err.message);
  }

  console.log('✅ Migration finished successfully.');
  process.exit(0);
}

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve(Array.isArray(result) ? result : [result]);
    });
  });
}

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
