const { getMyAssignedKPIs } = require('./controllers/kpiAssignmentController');

const req = {
  user_id: 79,
  query: {}
};

const res = {
  status: (code) => {
    return {
      json: (data) => {
        console.log('STATUS:', code);
        console.log('SUCCESS:', data.success);
        console.log('IS_GLOBAL:', data.isGlobal);
        console.log('KPIS COUNT:', data.kpis ? data.kpis.length : 0);
        if (data.kpis && data.kpis.length > 0) {
          console.log('FIRST 3 KPIS:');
          data.kpis.slice(0, 3).forEach(k => {
            console.log(`- KPI #${k.specific_objective_id} (${k.specific_objective_name}) => Objective: ${k.objective_name} => Goal #${k.goal_id}: ${k.goal_name}`);
          });
          const goalsSet = new Set();
          data.kpis.forEach(k => { if (k.goal_id) goalsSet.add(k.goal_id); });
          console.log('GOALS COUNT WITH ASSIGNED KPIS:', goalsSet.size, Array.from(goalsSet));
        }
        process.exit(0);
      }
    };
  }
};

getMyAssignedKPIs(req, res);
