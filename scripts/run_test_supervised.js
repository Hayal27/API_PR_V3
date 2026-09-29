const controller = require('../controllers/taskAssignmentController');

const req = { user_id: 40 };
const res = {
  json: (data) => {
    console.log("Success:", data.success);
    console.log("Total users:", data.users?.length);
    const usersWithTasks = data.users.filter(u => (u.total_tasks_count > 0 || u.breakdown_tasks_count > 0));
    console.log(`Users with tasks (${usersWithTasks.length}):`);
    usersWithTasks.forEach(u => {
      console.log(`- ${u.name} (user_id: ${u.user_id}): BD tasks: ${u.breakdown_tasks_count}, Ops tasks: ${u.operational_tasks_count}, Total tasks: ${u.total_tasks_count}, Avg prog: ${u.breakdown_avg_progress}%, Health: ${u.health_status}, Score: ${u.performance_score}`);
    });

    const healthCounts = { overdue: 0, behind: 0, on_track: 0, no_tasks: 0 };
    data.users.forEach(u => {
      healthCounts[u.health_status] = (healthCounts[u.health_status] || 0) + 1;
    });
    console.log("Health distribution:", healthCounts);
    process.exit(0);
  },
  status: (code) => {
    console.error("Status code:", code);
    return {
      json: (err) => {
        console.error("Error response:", err);
        process.exit(1);
      }
    };
  }
};

controller.getSupervisedUsers(req, res);
