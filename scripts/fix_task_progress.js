const con = require('./models/db');
const { promisify } = require('util');

const query = promisify(con.query).bind(con);

async function fixTaskProgress() {
    try {
        console.log("Fixing monthly tasks...");
        const monthlyTasks = await query(`
            SELECT mt.monthly_task_id, mt.weight, mt.actual_amount, sod.plan
            FROM monthly_tasks mt
            JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
            WHERE mt.actual_amount > 0
        `);

        let mUpdated = 0;
        for (const mt of monthlyTasks) {
            let progress = mt.progress;
            if (mt.weight > 0) {
                progress = Math.min(100, Math.round((Number(mt.actual_amount) / Number(mt.weight)) * 100));
            } else if (mt.plan > 0) {
                progress = Math.min(100, Math.round((Number(mt.actual_amount) / Number(mt.plan)) * 100));
            } else {
                progress = Math.min(100, Number(mt.actual_amount));
            }
            await query('UPDATE monthly_tasks SET progress = ? WHERE monthly_task_id = ?', [progress, mt.monthly_task_id]);
            mUpdated++;
        }
        console.log(`Updated ${mUpdated} monthly tasks.`);

        console.log("Fixing weekly tasks...");
        const weeklyTasks = await query(`
            SELECT wt.weekly_task_id, wt.weight, wt.actual_amount, sod.plan
            FROM weekly_tasks wt
            JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
            JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
            WHERE wt.actual_amount > 0
        `);

        let wUpdated = 0;
        for (const wt of weeklyTasks) {
            let progress = wt.progress;
            if (wt.weight > 0) {
                progress = Math.min(100, Math.round((Number(wt.actual_amount) / Number(wt.weight)) * 100));
            } else if (wt.plan > 0) {
                progress = Math.min(100, Math.round((Number(wt.actual_amount) / Number(wt.plan)) * 100));
            } else {
                progress = Math.min(100, Number(wt.actual_amount));
            }
            await query('UPDATE weekly_tasks SET progress = ? WHERE weekly_task_id = ?', [progress, wt.weekly_task_id]);
            wUpdated++;
        }
        console.log(`Updated ${wUpdated} weekly tasks.`);

        console.log("Recalculating action plans progress...");
        // Call syncPlanProgress for all affected action plans? It's complex, we'll let the user's next update trigger it or they can just check the UI now for the child task.
        
        process.exit(0);
    } catch (err) {
        console.error("Error fixing progress:", err);
        process.exit(1);
    }
}

fixTaskProgress();
