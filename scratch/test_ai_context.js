const db = require('../models/db');
const { promisify } = require('util');
const dbQuery = promisify(db.query).bind(db);

async function testHierarchy() {
  try {
    const userId = 83; // Lelisa Gemechu
    const myEmpId = 156;

    // BFS 1: supervisor_id chain
    const allEmps = await dbQuery('SELECT employee_id, supervisor_id, department_id, fname, lname, position, email, phone FROM employees');
    const allPositions = await dbQuery('SELECT employee_id, org_node_id FROM employee_positions');
    const allNodes = await dbQuery('SELECT id, parent_id, name FROM organization_structure');

    const subordinateEmpIds = new Set();
    const queueEmps = [myEmpId];
    const visitedEmps = new Set([myEmpId]);
    while (queueEmps.length > 0) {
      const cur = queueEmps.shift();
      allEmps.filter(e => e.supervisor_id === cur && e.employee_id !== cur).forEach(e => {
        if (!visitedEmps.has(e.employee_id)) {
          visitedEmps.add(e.employee_id);
          subordinateEmpIds.add(e.employee_id);
          queueEmps.push(e.employee_id);
        }
      });
    }

    // BFS 2: org_structure sub-tree
    const myHeldNodes = (allPositions || [])
      .filter(p => p.employee_id === myEmpId)
      .map(p => p.org_node_id)
      .concat(allEmps.filter(e => e.employee_id === myEmpId).map(e => e.department_id))
      .filter(Boolean);

    if (myHeldNodes.length > 0) {
      const descendantNodes = new Set();
      const queueNodes = [...myHeldNodes];
      while (queueNodes.length > 0) {
        const nodeId = queueNodes.shift();
        allNodes.filter(n => n.parent_id === nodeId).forEach(child => {
          if (!descendantNodes.has(child.id)) {
            descendantNodes.add(child.id);
            queueNodes.push(child.id);
          }
        });
      }

      allPositions
        .filter(p => (descendantNodes.has(p.org_node_id) || myHeldNodes.includes(p.org_node_id)) && p.employee_id !== myEmpId)
        .forEach(p => subordinateEmpIds.add(p.employee_id));

      allEmps
        .filter(e => (descendantNodes.has(e.department_id) || myHeldNodes.includes(e.department_id)) && e.employee_id !== myEmpId)
        .forEach(e => subordinateEmpIds.add(e.employee_id));
    }

    console.log('Subordinate Emp IDs for Lelisa:', Array.from(subordinateEmpIds));

    // Get their user details & tasks
    if (subordinateEmpIds.size > 0) {
      const subUsers = await dbQuery(`
        SELECT u.user_id, u.user_name, e.employee_id, CONCAT(e.fname, ' ', e.lname) as name,
               e.email, e.phone, e.position, d.name as department_name
        FROM users u
        JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        WHERE e.employee_id IN (?)
      `, [Array.from(subordinateEmpIds)]);
      console.log('Subordinate Users:', subUsers);

      const subUserIds = subUsers.map(u => u.user_id);
      if (subUserIds.length > 0) {
        const subTasks = await dbQuery(`
          SELECT ta.assignment_id, ta.title, ta.priority, ta.status, ta.due_date,
                 CONCAT(e.fname, ' ', e.lname) as assigned_to_name
          FROM task_assignments ta
          JOIN users u ON ta.assigned_to = u.user_id
          JOIN employees e ON u.employee_id = e.employee_id
          WHERE ta.assigned_to IN (?)
        `, [subUserIds]);
        console.log('Subordinate Tasks:', subTasks);
      }
    }

  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
testHierarchy();
