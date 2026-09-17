const { sequelize } = require('../config/database');

async function inspectWeights() {
  try {
    const [cols] = await sequelize.query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'itpr' AND COLUMN_NAME LIKE '%weight%'
    `);
    console.log(JSON.stringify(cols, null, 2));

    // Also look for weight columns in goals, objectives, specific_objectives
    const [allCols] = await sequelize.query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE, COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'itpr' AND TABLE_NAME IN ('goals', 'objectives', 'specific_objectives', 'specific_objective_details')
      AND (COLUMN_NAME LIKE '%weight%' OR COLUMN_NAME LIKE '%target%' OR COLUMN_NAME LIKE '%plan%')
    `);
    console.log("Goals/Objectives/KPI weight & target cols:");
    console.log(JSON.stringify(allCols, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspectWeights();
