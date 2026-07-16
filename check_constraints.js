const db = require('./models/db');
const sql = `
  SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    CONSTRAINT_NAME, 
    REFERENCED_TABLE_NAME, 
    REFERENCED_COLUMN_NAME 
  FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
  WHERE 
    TABLE_NAME = 'plans' 
    AND REFERENCED_TABLE_NAME IS NOT NULL;
`;

db.query(sql, (err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(results, null, 2));
    }
    process.exit(0);
});
