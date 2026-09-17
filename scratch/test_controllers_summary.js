const db = require('../models/db');
const { promisify } = require('util');
const dbQuery = promisify(db.query).bind(db);

async function test() {
  try {
    const [pillars, goals, departments, roles, applicants] = await Promise.all([
      dbQuery('SELECT id, name FROM pillars LIMIT 5').catch(() => []),
      dbQuery('SELECT goal_id, title, start_year, end_year, weight, is_active FROM goals LIMIT 5').catch(() => []),
      dbQuery('SELECT department_id, name FROM departments LIMIT 5').catch(() => []),
      dbQuery('SELECT role_id, role_name, hierarchy_level FROM roles ORDER BY hierarchy_level ASC LIMIT 5').catch(() => []),
      dbQuery('SELECT COUNT(*) as count FROM applicants').catch(() => [{ count: 0 }])
    ]);
    console.log('Pillars:', pillars);
    console.log('Goals:', goals);
    console.log('Departments:', departments);
    console.log('Roles:', roles);
    console.log('Applicants:', applicants);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
test();
