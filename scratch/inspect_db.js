const { sequelize } = require('../config/database');

async function checkIncome() {
  try {
    const [cols] = await sequelize.query(`DESCRIBE income`);
    console.log('income cols:', cols.map(c => c.Field));
    const [rows] = await sequelize.query(`SELECT * FROM income LIMIT 5`);
    console.log('income rows:', rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

checkIncome();
