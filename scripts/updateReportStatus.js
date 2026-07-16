const con = require('../models/db');

// Update all existing Pending reports to Active status
const updateExistingReports = () => {
  const updateQuery = `
    UPDATE reports 
    SET status = '' 
    WHERE status = 'Pending'
  `;
  
  con.query(updateQuery, (err, result) => {
    if (err) {
      console.error('Error updating reports:', err);
    } else {
      console.log(`✅ Updated ${result.affectedRows} reports from Pending to Active status`);
    }
    
    // Close the connection
    con.end();
  });
};

// Run the update
updateExistingReports();
