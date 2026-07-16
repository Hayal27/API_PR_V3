-- Fix CIplan and CIbaseline column types to ensure they can handle large values
-- This script ensures the columns are DECIMAL(10,2) which can hold values up to 99,999,999.99

-- Check current column definition
DESCRIBE specific_objective_details CIplan;
DESCRIBE specific_objective_details CIbaseline;

-- If the columns are not DECIMAL(10,2), run these ALTER statements:
-- ALTER TABLE specific_objective_details MODIFY COLUMN CIbaseline DECIMAL(10,2) DEFAULT NULL;
-- ALTER TABLE specific_objective_details MODIFY COLUMN CIplan DECIMAL(10,2) DEFAULT NULL;
-- ALTER TABLE specific_objective_details MODIFY COLUMN CIoutcome DECIMAL(10,2) DEFAULT NULL;
-- ALTER TABLE specific_objective_details MODIFY COLUMN CIexecution_percentage DECIMAL(5,2) DEFAULT NULL;
