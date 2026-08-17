const con = require('../models/db');

// Test 1: Check what columns exist in reports table
con.query('SHOW COLUMNS FROM reports', (err, cols) => {
    if (err) { console.error('reports columns error:', err.message); }
    else { console.log('reports columns:', cols.map(c => c.Field).join(', ')); }
    
    // Test 2: Run simplified reports query
    const sql = `SELECT r.report_id, r.status,
        CASE WHEN sod.specific_objective_detail_id IS NULL THEN 0
             WHEN COALESCE(sod.execution_percentage, 0) > 0 THEN COALESCE(sod.execution_percentage,0)
             ELSE 0
        END AS execution_pct
        FROM reports r
        LEFT JOIN specific_objective_details sod ON r.plan_id=sod.specific_objective_detail_id
        LIMIT 3`;
    con.query(sql, [], (err2, rows) => {
        if (err2) { console.error('Query error:', err2.message); }
        else { console.log('Query OK - rows:', rows.length, JSON.stringify(rows[0]||{})); }
        
        // Test 3: Try the full original reports columns
        const sql3 = `SELECT r.report_id, r.title, r.created_at, r.status, r.plan_id FROM reports r LIMIT 1`;
        con.query(sql3, [], (err3, rows3) => {
            if (err3) { console.error('Full query error:', err3.message); }
            else { console.log('Full query OK:', JSON.stringify(rows3[0]||{})); }
            
            // Check if reporting_period exists
            const sql4 = `SELECT r.reporting_period, r.report_year, r.report_month, r.rating FROM reports r LIMIT 1`;
            con.query(sql4, [], (err4, rows4) => {
                if (err4) { console.error('Optional columns error:', err4.message); }
                else { console.log('Optional cols OK:', JSON.stringify(rows4[0]||{})); }
                process.exit();
            });
        });
    });
});
