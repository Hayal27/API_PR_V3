const con = require('./models/db');

console.log('🔧 Running chat plan migration...');

// Step 1: Update ENUM to include 'plan'
const enumQuery = `ALTER TABLE messages MODIFY COLUMN message_type ENUM('text','image','file','system','plan') DEFAULT 'text'`;

con.query(enumQuery, (err) => {
  if (err) {
    console.error('❌ ENUM update error:', err.message);
  } else {
    console.log('✅ message_type ENUM updated to include plan');
  }

  // Step 2: Add metadata column
  const metaQuery = `ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata TEXT DEFAULT NULL AFTER file_name`;

  con.query(metaQuery, (err2) => {
    if (err2) {
      console.error('❌ metadata column error:', err2.message);
    } else {
      console.log('✅ metadata column added to messages table');
    }

    console.log('✅ Migration complete. You can now share plans and view them in chat.');
    process.exit(0);
  });
});
