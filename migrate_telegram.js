const db = require('./models/db');

const sql = `
  ALTER TABLE employees 
  ADD COLUMN telegram_username VARCHAR(100) DEFAULT NULL, 
  ADD COLUMN telegram_chat_id BIGINT DEFAULT NULL
`;

db.query(sql, (err, result) => {
  if (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists, skipping.');
      process.exit(0);
    }
    console.error('Error adding columns:', err);
    process.exit(1);
  }
  console.log('Columns added successfully:', result);
  process.exit(0);
});
