/**
 * Migration: Create plan_types table and seed default types
 * Run: node migrations\create_plan_types_table.js
 */
const con = require('../models/db');

async function run() {
  console.log('Creating plan_types table...');

  await q(`
    CREATE TABLE IF NOT EXISTS plan_types (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      value      VARCHAR(100) NOT NULL UNIQUE,
      label      VARCHAR(100) NOT NULL,
      label_en   VARCHAR(100) NOT NULL,
      color      VARCHAR(200) DEFAULT 'bg-gray-50 text-gray-700 border-gray-200',
      is_default TINYINT(1)  DEFAULT 0,
      sort_order INT         DEFAULT 100,
      created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✔ plan_types table ready.');

  // Seed defaults (ignore duplicates)
  const defaults = [
    { value: 'cost',    label: 'ወጪ',    label_en: 'Cost',    color: 'bg-orange-50 text-orange-700 border-orange-200',  sort_order: 1 },
    { value: 'income',  label: 'ገቢ',    label_en: 'Income',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200', sort_order: 2 },
    { value: 'hr',      label: 'ሰራተኞች', label_en: 'HR',      color: 'bg-purple-50 text-purple-700 border-purple-200',   sort_order: 3 },
    { value: 'project', label: 'ፕሮጀክት', label_en: 'Project', color: 'bg-blue-50 text-blue-700 border-blue-200',         sort_order: 4 },
    { value: 'general', label: 'ጠቅላላ',  label_en: 'General', color: 'bg-gray-50 text-gray-700 border-gray-200',         sort_order: 5 },
  ];

  for (const pt of defaults) {
    const existing = await q('SELECT id FROM plan_types WHERE value = ? LIMIT 1', [pt.value]);
    if (existing.length === 0) {
      await q(
        `INSERT INTO plan_types (value, label, label_en, color, is_default, sort_order) VALUES (?, ?, ?, ?, 1, ?)`,
        [pt.value, pt.label, pt.label_en, pt.color, pt.sort_order]
      );
      console.log('  ✔ Seeded default:', pt.label_en);
    } else {
      console.log('  → Already exists:', pt.label_en);
    }
  }

  console.log('\n✅ plan_types table migration complete.');
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

run().catch(err => { console.error('Migration failed:', err.message); process.exit(1); });
