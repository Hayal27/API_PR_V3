/**
 * Migration: Add field_config column to plan_types table and seed initial configurations
 * Run: node migrations/add_field_config_column.js
 */
const con = require('../models/db');

const DEFAULT_CONFIGS = {
  income: {
    sectionTitle: 'INCOME DETAILS (የገቢ መረጃ)',
    group1Title: 'ምንዛሬ',
    group1Options: ['ETB', 'USD'],
    group2Title: 'የገቢ እቅድ አይነት',
    group2Options: ['Internal', 'Tenant'],
    dropdownTitle: 'ገቢ ስም',
    dropdownOptions: ['Lease Land', 'Office Rent', 'Consulting', 'SW Products', 'Import & Export Substitution', 'Other'],
    baselineLabel: 'Baseline Income',
    planLabel: 'Plan Income'
  },
  cost: {
    sectionTitle: 'COST DETAILS (የወጪ መረጃ)',
    group1Title: 'ወጪ አይነት',
    group1Options: ['መደበኛ ወጪ', 'ካፒታል ወጪ'],
    group2Title: '',
    group2Options: [],
    dropdownTitle: 'ወጪ ስም',
    dropdownOptions: [
      'Annual Leave Expense', 'Basic Salary Expense', 'Bonus', 'Building Insurance', 'Building Rent Expense', 
      'Cash Indemnity Allowance', 'Fuel and Lubricants', 'Housing Allowance', 'Medical and Hospitalization', 
      'Other Allowances', 'Pension Contribution 11%', 'Stationery and Office Supplies', 
      'Telephone, Fax, and Internet Expenses', 'Transport Allowance', 'Vehicle Rent Expense',
      'Plant, Machinery and Equipment', 'Office Furnitures, Equipment and Fixtures', 'ICT Equipments', 
      'Vehicles and Vehicles Accessories', 'Construction Equipment', 'Other Fixed Assets', 'Other'
    ],
    baselineLabel: 'Baseline Budget',
    planLabel: 'Plan Budget'
  },
  hr: {
    sectionTitle: 'HR DETAILS (የሰራተኞች መረጃ)',
    group1Title: 'Employee Of',
    group1Options: ['Internal', 'Tenant', 'Both'],
    group2Title: 'ሰራተኞች አይነት',
    group2Options: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Externship', 'Freelancing'],
    dropdownTitle: '',
    dropdownOptions: [],
    baselineLabel: 'Baseline Count',
    planLabel: 'Plan Count'
  },
  project: {
    sectionTitle: 'PROJECT DETAILS (የፕሮጀክት መረጃ)',
    group1Title: 'የፕሮጀክት አይነት',
    group1Options: ['IT Project', 'Construction', 'Other'],
    group2Title: '',
    group2Options: [],
    dropdownTitle: 'ፕሮጀክት ስም',
    dropdownOptions: ['IT Infrastructure Setup', 'Software Development', 'Building Construction', 'Other'],
    baselineLabel: 'Baseline Target',
    planLabel: 'Plan Target'
  },
  general: {
    sectionTitle: 'GENERAL DETAILS (ጠቅላላ መረጃ)',
    group1Title: 'ምድብ',
    group1Options: ['Standard', 'Special'],
    group2Title: '',
    group2Options: [],
    dropdownTitle: 'ዝርዝር ስም',
    dropdownOptions: ['General Task', 'Operational', 'Other'],
    baselineLabel: 'Baseline Value',
    planLabel: 'Plan Value'
  }
};

async function run() {
  console.log('Starting field_config column migration...');

  try {
    // 1. Add field_config column if not exists
    await q(`
      ALTER TABLE plan_types 
      ADD COLUMN field_config LONGTEXT NULL
    `);
    console.log('✔ Added field_config column to plan_types table.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('→ Column field_config already exists.');
    } else {
      console.error('Error adding column:', err.message);
    }
  }

  // 2. Seed configs for existing rows if null
  for (const [val, configObj] of Object.entries(DEFAULT_CONFIGS)) {
    const jsonStr = JSON.stringify(configObj);
    await q(
      `UPDATE plan_types SET field_config = ? WHERE value = ? AND (field_config IS NULL OR field_config = '')`,
      [jsonStr, val]
    );
    console.log(`  ✔ Seeded default config for "${val}"`);
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
