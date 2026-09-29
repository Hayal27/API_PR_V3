// Controller for task breakdown operations
const con = require('../models/db');
const { getCurrentEthiopianPeriod } = require('../utils/ethiopianCalendar');
const { logAudit, AUDIT_ACTIONS } = require('../middleware/auditLogger');


// Auto-create task assignees tables if they don't exist
con.query(`
    CREATE TABLE IF NOT EXISTS monthly_task_assignees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      monthly_task_id INT NOT NULL,
      user_id INT NOT NULL,
      assigned_by INT NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_monthly_assignee (monthly_task_id, user_id),
      FOREIGN KEY (monthly_task_id) REFERENCES monthly_tasks(monthly_task_id) ON DELETE CASCADE
    )
`, (err) => {
    if (err) console.warn("Notice creating monthly_task_assignees:", err.message);
});

con.query(`
    CREATE TABLE IF NOT EXISTS weekly_task_assignees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      weekly_task_id INT NOT NULL,
      user_id INT NOT NULL,
      assigned_by INT NOT NULL,
      assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_weekly_assignee (weekly_task_id, user_id),
      FOREIGN KEY (weekly_task_id) REFERENCES weekly_tasks(weekly_task_id) ON DELETE CASCADE
    )
`, (err) => {
    if (err) console.warn("Notice creating weekly_task_assignees:", err.message);
});

// Ensure monthly_tasks & weekly_tasks have start_date and deadline columns
con.query("ALTER TABLE monthly_tasks ADD COLUMN start_date DATE NULL", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding start_date to monthly_tasks:", err.message);
});
con.query("ALTER TABLE monthly_tasks ADD COLUMN deadline DATE NULL", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding deadline to monthly_tasks:", err.message);
});
con.query("ALTER TABLE weekly_tasks ADD COLUMN start_date DATE NULL", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding start_date to weekly_tasks:", err.message);
});
con.query("ALTER TABLE weekly_tasks ADD COLUMN deadline DATE NULL", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding deadline to weekly_tasks:", err.message);
});

// ── WBR Group columns: support multiple independent WBD groups per action plan ──
con.query("ALTER TABLE monthly_tasks ADD COLUMN wbr_group VARCHAR(100) NOT NULL DEFAULT 'WBR1'", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding wbr_group to monthly_tasks:", err.message);
});
con.query("ALTER TABLE monthly_tasks ADD COLUMN wbr_group_weight DECIMAL(5,2) NOT NULL DEFAULT 0", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding wbr_group_weight to monthly_tasks:", err.message);
});
con.query("ALTER TABLE monthly_tasks ADD COLUMN wbr_group_plan_amount DECIMAL(15,4) NOT NULL DEFAULT 0", (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') console.warn("Notice adding wbr_group_plan_amount to monthly_tasks:", err.message);
});

// Get monthly and weekly tasks for a specific objective detail
const getTasksByDetailId = (req, res) => {
    const { detail_id } = req.params;

    if (!detail_id) {
        return res.status(400).json({
            success: false,
            message: 'Detail ID is required'
        });
    }

    // Query to get monthly tasks with their weekly tasks
    const query = `
    SELECT 
      mt.monthly_task_id,
      mt.specific_objective_detail_id,
      mt.name AS monthly_task_name,
      mt.weight AS monthly_task_weight,
      mt.progress AS monthly_task_progress,
      mt.status AS monthly_task_status,
      mt.description AS monthly_task_description,
      mt.attachment AS monthly_task_attachment,
      mt.start_date AS monthly_start_date,
      mt.deadline AS monthly_deadline,
      mt.created_at AS monthly_created_at,
      mt.updated_at AS monthly_updated_at,
      COALESCE(mt.wbr_group, 'WBR1') AS wbr_group,
      COALESCE(mt.wbr_group_weight, 0) AS wbr_group_weight,
      COALESCE(mt.wbr_group_plan_amount, 0) AS wbr_group_plan_amount,
      wt.weekly_task_id,
      wt.name AS weekly_task_name,
      wt.weight AS weekly_task_weight,
      wt.progress AS weekly_task_progress,
      wt.status AS weekly_task_status,
      wt.description AS weekly_task_description,
      wt.attachment AS weekly_task_attachment,
      wt.start_date AS weekly_start_date,
      wt.deadline AS weekly_deadline,
      wt.created_at AS weekly_created_at,
      wt.updated_at AS weekly_updated_at
    FROM monthly_tasks mt
    LEFT JOIN weekly_tasks wt ON mt.monthly_task_id = wt.monthly_task_id
    WHERE mt.specific_objective_detail_id = ?
    ORDER BY mt.wbr_group, mt.monthly_task_id, wt.weekly_task_id
  `;

    con.query(query, [detail_id], (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching tasks',
                error: err.message
            });
        }

        // Transform flat results into hierarchical structure
        const monthlyTasksMap = new Map();

        results.forEach(row => {
            if (!monthlyTasksMap.has(row.monthly_task_id)) {
                monthlyTasksMap.set(row.monthly_task_id, {
                    monthly_task_id: row.monthly_task_id,
                    name: row.monthly_task_name,
                    weight: parseFloat(row.monthly_task_weight),
                    progress: parseFloat(row.monthly_task_progress) || 0,
                    status: row.monthly_task_status || 'Pending',
                    description: row.monthly_task_description,
                    attachment: row.monthly_task_attachment,
                    start_date: row.monthly_start_date,
                    deadline: row.monthly_deadline,
                    created_at: row.monthly_created_at,
                    updated_at: row.monthly_updated_at,
                    wbr_group: row.wbr_group || 'WBR1',
                    wbr_group_weight: parseFloat(row.wbr_group_weight) || 0,
                    wbr_group_plan_amount: parseFloat(row.wbr_group_plan_amount) || 0,
                    assignees: [],
                    weeklyTasks: []
                });
            }

            if (row.weekly_task_id) {
                const mtObj = monthlyTasksMap.get(row.monthly_task_id);
                if (!mtObj.weeklyTasks.some(w => w.weekly_task_id === row.weekly_task_id)) {
                    mtObj.weeklyTasks.push({
                        weekly_task_id: row.weekly_task_id,
                        name: row.weekly_task_name,
                        weight: parseFloat(row.weekly_task_weight),
                        progress: parseFloat(row.weekly_task_progress) || 0,
                        status: row.weekly_task_status || 'Pending',
                        description: row.weekly_task_description,
                        attachment: row.weekly_task_attachment,
                        start_date: row.weekly_start_date,
                        deadline: row.weekly_deadline,
                        created_at: row.weekly_created_at,
                        updated_at: row.weekly_updated_at,
                        assignees: []
                    });
                }
            }
        });

        const monthlyIds = Array.from(monthlyTasksMap.keys());
        if (monthlyIds.length === 0) {
            return res.status(200).json({ success: true, tasks: [] });
        }

        // Fetch monthly and weekly task assignees
        const mAssigneeSql = 'SELECT monthly_task_id, user_id FROM monthly_task_assignees WHERE monthly_task_id IN (?)';
        con.query(mAssigneeSql, [monthlyIds], (errM, mAssignees) => {
            if (!errM && mAssignees) {
                mAssignees.forEach(ma => {
                    const mtObj = monthlyTasksMap.get(ma.monthly_task_id);
                    if (mtObj && !mtObj.assignees.includes(ma.user_id)) {
                        mtObj.assignees.push(ma.user_id);
                    }
                });
            }

            const weeklyIds = [];
            monthlyTasksMap.forEach(mt => {
                mt.weeklyTasks.forEach(wt => weeklyIds.push(wt.weekly_task_id));
            });

            if (weeklyIds.length === 0) {
                return res.status(200).json({ success: true, tasks: Array.from(monthlyTasksMap.values()) });
            }

            const wAssigneeSql = 'SELECT weekly_task_id, user_id FROM weekly_task_assignees WHERE weekly_task_id IN (?)';
            con.query(wAssigneeSql, [weeklyIds], (errW, wAssignees) => {
                if (!errW && wAssignees) {
                    wAssignees.forEach(wa => {
                        monthlyTasksMap.forEach(mt => {
                            const wtObj = mt.weeklyTasks.find(w => w.weekly_task_id === wa.weekly_task_id);
                            if (wtObj && !wtObj.assignees.includes(wa.user_id)) {
                                wtObj.assignees.push(wa.user_id);
                            }
                        });
                    });
                }
                res.status(200).json({ success: true, tasks: Array.from(monthlyTasksMap.values()) });
            });
        });
    });
};

// Add tasks to an existing specific objective detail
const addTasksToDetail = (req, res) => {
    const { specific_objective_detail_id, tasks } = req.body;

    if (!specific_objective_detail_id || !tasks || !Array.isArray(tasks)) {
        return res.status(400).json({
            success: false,
            message: 'Detail ID and tasks array are required'
        });
    }

    const taskPromises = tasks.map(monthlyTask => {
        return new Promise((resolveTask, rejectTask) => {
            // Insert monthly task
            const monthlyTaskQuery = `
                INSERT INTO monthly_tasks (specific_objective_detail_id, name, weight, start_date, deadline)
                VALUES (?, ?, ?, ?, ?)
            `;

            con.query(monthlyTaskQuery, [specific_objective_detail_id, monthlyTask.name, monthlyTask.weight || 0, monthlyTask.start_date || null, monthlyTask.deadline || null], (err, monthlyResult) => {
                if (err) {
                    console.error("Error inserting monthly task:", err.message);
                    rejectTask(`Error inserting monthly task: ${err.message}`);
                } else {
                    const monthlyTaskId = monthlyResult.insertId;

                    // Insert weekly tasks if provided
                    if (monthlyTask.weeklyTasks && Array.isArray(monthlyTask.weeklyTasks) && monthlyTask.weeklyTasks.length > 0) {
                        const weeklyPromises = monthlyTask.weeklyTasks.map(weeklyTask => {
                            return new Promise((resolveWeekly, rejectWeekly) => {
                                const weeklyTaskQuery = `
                                    INSERT INTO weekly_tasks (monthly_task_id, name, weight, start_date, deadline)
                                    VALUES (?, ?, ?, ?, ?)
                                `;

                                con.query(weeklyTaskQuery, [monthlyTaskId, weeklyTask.name, weeklyTask.weight || 0, weeklyTask.start_date || null, weeklyTask.deadline || null], (err) => {
                                    if (err) {
                                        console.error("Error inserting weekly task:", err.message);
                                        rejectWeekly(`Error inserting weekly task: ${err.message}`);
                                    } else {
                                        resolveWeekly();
                                    }
                                });
                            });
                        });

                        Promise.all(weeklyPromises)
                            .then(() => resolveTask())
                            .catch(rejectTask);
                    } else {
                        resolveTask();
                    }
                }
            });
        });
    });

    Promise.all(taskPromises)
        .then(() => {
            logAudit(req.user_id, AUDIT_ACTIONS.TASK_CREATE || 'TASK_CREATE', `Added ${tasks.length} monthly breakdown task(s) to Action Plan ID ${specific_objective_detail_id}`, {
                specific_objective_detail_id, count: tasks.length
            }, req).catch(() => {});

            res.status(201).json({
                success: true,
                message: "Tasks added successfully"
            });
        })
        .catch((err) => {
            console.error("Error adding tasks:", err);
            res.status(500).json({
                success: false,
                message: "Error adding tasks",
                error: err
            });
        });
};

// Update monthly task weight
const updateMonthlyTaskWeight = (req, res) => {
    const { monthly_task_id } = req.params;
    const { weight } = req.body;

    if (!monthly_task_id || weight === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Monthly task ID and weight are required'
        });
    }

    const query = `
    UPDATE monthly_tasks 
    SET weight = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE monthly_task_id = ?
  `;

    con.query(query, [weight, monthly_task_id], (err, result) => {
        if (err) {
            console.error('Error updating monthly task weight:', err);
            return res.status(500).json({ success: false, message: 'DB error', error: err.message });
        }
        res.status(200).json({ success: true, message: 'Weight updated' });
    });
};

// Update weekly task weight
const updateWeeklyTaskWeight = (req, res) => {
    const { weekly_task_id } = req.params;
    const { weight } = req.body;

    if (!weekly_task_id || weight === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Weekly task ID and weight are required'
        });
    }

    const query = `
    UPDATE weekly_tasks 
    SET weight = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE weekly_task_id = ?
  `;

    con.query(query, [weight, weekly_task_id], (err, result) => {
        if (err) {
            console.error('Error updating weekly task weight:', err);
            return res.status(500).json({ success: false, message: 'DB error', error: err.message });
        }
        res.status(200).json({ success: true, message: 'Weight updated' });
    });
};

// Batch update task weights (Monthly + Weekly) in a single transaction
const updateTaskWeightsBatch = (req, res) => {
    const { monthlyTasks, weeklyTasks } = req.body;

    if (!monthlyTasks && !weeklyTasks) {
        return res.status(400).json({
            success: false,
            message: 'Either monthlyTasks or weeklyTasks array must be provided'
        });
    }

    con.getConnection((err, connection) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'DB connection error', error: err.message });
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ success: false, message: 'Transaction error', error: err.message });
            }

            const promises = [];

            if (monthlyTasks && Array.isArray(monthlyTasks)) {
                monthlyTasks.forEach(task => {
                    promises.push(new Promise((resolve, reject) => {
                        connection.query('UPDATE monthly_tasks SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE monthly_task_id = ?',
                            [task.weight, task.monthly_task_id], (err, result) => {
                                if (err) reject(err); else resolve(result);
                            });
                    }));
                });
            }

            if (weeklyTasks && Array.isArray(weeklyTasks)) {
                weeklyTasks.forEach(task => {
                    promises.push(new Promise((resolve, reject) => {
                        connection.query('UPDATE weekly_tasks SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE weekly_task_id = ?',
                            [task.weight, task.weekly_task_id], (err, result) => {
                                if (err) reject(err); else resolve(result);
                            });
                    }));
                });
            }

            Promise.all(promises)
                .then(() => {
                    connection.commit((err) => {
                        connection.release();
                        if (err) {
                            return res.status(500).json({ success: false, message: 'Commit error', error: err.message });
                        }
                        res.status(200).json({
                            success: true,
                            message: 'Task weights updated successfully',
                            updated: { monthlyTasks: monthlyTasks?.length || 0, weeklyTasks: weeklyTasks?.length || 0 }
                        });
                    });
                })
                .catch((error) => {
                    connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ success: false, message: 'Error updating task weights', error: error.message });
                    });
                });
        });
    });
};

// Add weekly tasks to an existing monthly task
const addWeeklyTasks = (req, res) => {
    const { monthly_task_id, weeklyTasks } = req.body;

    if (!monthly_task_id || !weeklyTasks || !Array.isArray(weeklyTasks)) {
        return res.status(400).json({
            success: false,
            message: 'Monthly task ID and weekly tasks array are required'
        });
    }

    const promises = weeklyTasks.map(task => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO weekly_tasks (monthly_task_id, name, weight, start_date, deadline)
                VALUES (?, ?, ?, ?, ?)
            `;

            con.query(query, [monthly_task_id, task.name, task.weight || 0, task.start_date || null, task.deadline || null], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            logAudit(req.user_id, AUDIT_ACTIONS.TASK_CREATE || 'TASK_CREATE', `Added ${weeklyTasks.length} weekly task(s) to Monthly Task ID ${monthly_task_id}`, {
                monthly_task_id, count: weeklyTasks.length
            }, req).catch(() => {});

            res.status(201).json({
                success: true,
                message: "Weekly tasks added successfully"
            });
        })
        .catch((err) => {
            console.error("Error adding weekly tasks:", err);
            res.status(500).json({
                success: false,
                message: "Error adding weekly tasks",
                error: err.message
            });
        });
};

const isPastDeadline = (deadlineStr) => {
    if (!deadlineStr) return false;
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return false;
    const str = String(deadlineStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        d.setHours(23, 59, 59, 999);
    }
    return d.getTime() < Date.now();
};

// Update task progress, description, and attachment
// Helper to synchronize parent plan progress
// Helper to synchronize parent plan progress
const updateParentKpi = (kpiId) => {
    return new Promise((resolve) => {
        if (!kpiId) return resolve();
        con.query(
            'SELECT AVG(COALESCE(execution_percentage, 0)) AS avg_exec FROM specific_objective_details WHERE specific_objective_id = ?',
            [kpiId],
            (err, results) => {
                if (!err && results && results.length > 0) {
                    const avgExec = parseFloat(results[0].avg_exec) || 0;
                    con.query(
                        'UPDATE specific_objectives SET execution_percentage = ? WHERE specific_objective_id = ?',
                        [avgExec, kpiId],
                        () => resolve()
                    );
                } else {
                    resolve();
                }
            }
        );
    });
};

const syncPlanProgress = async (detailId) => {
    return new Promise((resolve, reject) => {
        // 1. Fetch monthly tasks and child weekly tasks for this detail
        const query = `
            SELECT 
              mt.monthly_task_id,
              mt.weight AS monthly_weight,
              mt.progress AS monthly_progress,
              mt.actual_amount AS monthly_actual,
              wt.weekly_task_id,
              wt.weight AS weekly_weight,
              wt.progress AS weekly_progress
            FROM monthly_tasks mt
            LEFT JOIN weekly_tasks wt ON mt.monthly_task_id = wt.monthly_task_id
            WHERE mt.specific_objective_detail_id = ?
        `;

        con.query(query, [detailId], async (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve();

            // Group weekly tasks by monthly_task_id
            const monthlyMap = new Map();
            rows.forEach(r => {
                if (!monthlyMap.has(r.monthly_task_id)) {
                    monthlyMap.set(r.monthly_task_id, {
                        monthly_task_id: r.monthly_task_id,
                        weight: parseFloat(r.monthly_weight) || 0,
                        progress: parseFloat(r.monthly_progress) || 0,
                        actual_amount: parseFloat(r.monthly_actual) || 0,
                        weeklyTasks: []
                    });
                }
                if (r.weekly_task_id) {
                    monthlyMap.get(r.monthly_task_id).weeklyTasks.push({
                        weekly_task_id: r.weekly_task_id,
                        weight: parseFloat(r.weekly_weight) || 0,
                        progress: parseFloat(r.weekly_progress) || 0
                    });
                }
            });

            // Recalculate monthly task progress if it has weekly tasks
            const updatePromises = [];
            monthlyMap.forEach(mt => {
                if (mt.weeklyTasks.length > 0) {
                    const totalW = mt.weeklyTasks.reduce((s, w) => s + w.weight, 0);
                    const weightedAch = mt.weeklyTasks.reduce((s, w) => s + (w.weight * w.progress / 100), 0);
                    const calcProg = totalW > 0 ? Math.min(100, Math.round((weightedAch / totalW) * 100)) : mt.progress;
                    mt.progress = calcProg;
                    updatePromises.push(new Promise(res => {
                        con.query('UPDATE monthly_tasks SET progress = ? WHERE monthly_task_id = ?', [calcProg, mt.monthly_task_id], () => res());
                    }));
                }
            });

            await Promise.all(updatePromises);

            // 2. Calculate parent action plan execution percentage across all monthly tasks
            con.query(
                `SELECT plan, CIplan, CIbaseline, baseline, outcome, specific_objective_id, weight
                 FROM specific_objective_details WHERE specific_objective_detail_id = ?`,
                [detailId],
                (err2, detailResults) => {
                    if (err2 || !detailResults || detailResults.length === 0) return resolve();

                    const row = detailResults[0];
                    const parentKpiId = row.specific_objective_id;

                    const allMonthly = Array.from(monthlyMap.values());
                    const totalWeight = allMonthly.reduce((s, m) => s + m.weight, 0);
                    const weightedAchievement = allMonthly.reduce((s, m) => s + (m.weight * m.progress / 100), 0);

                    let executionPercentage = totalWeight > 0
                        ? Math.min(100, Math.round((weightedAchievement / totalWeight) * 100 * 100) / 100)
                        : 0;

                    // Update specific_objective_details
                    const updateQuery = `
                        UPDATE specific_objective_details 
                        SET execution_percentage = ?, 
                            CIexecution_percentage = ?
                        WHERE specific_objective_detail_id = ?
                    `;
                    con.query(updateQuery, [executionPercentage, executionPercentage, detailId], (err3) => {
                        updateParentKpi(parentKpiId).then(resolve).catch(resolve);
                    });
                }
            );
        });
    });
};


// Update task breakdown (Handles Syncing: Update, Insert, and Delete)
const updateTasksToDetail = (req, res) => {
    const { specific_objective_detail_id, tasks } = req.body;

    if (!specific_objective_detail_id || !tasks || !Array.isArray(tasks)) {
        return res.status(400).json({
            success: false,
            message: 'Detail ID and tasks array are required'
        });
    }

    con.getConnection((connErr, connection) => {
        if (connErr) {
            return res.status(500).json({ success: false, message: 'DB connection error', error: connErr.message });
        }

        connection.beginTransaction((err) => {
            if (err) {
                connection.release();
                return res.status(500).json({ success: false, message: 'Transaction error' });
            }

            const rollback = (errMsg) => {
                connection.rollback(() => { connection.release(); res.status(500).json({ success: false, message: errMsg }); });
            };

            // Use connection-scoped query helper
            const qry = (sql, params) => new Promise((resolve, reject) => {
                connection.query(sql, params, (err, result) => err ? reject(err) : resolve(result));
            });

            (async () => {
                try {
                    // 1. Get existing monthly tasks to identify deletions & fetch parent plan metrics
                    const parentDetails = await qry('SELECT plan, CIplan FROM specific_objective_details WHERE specific_objective_detail_id = ?', [specific_objective_detail_id]);
                    const parentPlanWeight = Number(parentDetails[0]?.plan) || 0;
                    const parentPlanAmount = Number(parentDetails[0]?.CIplan) || 0;

                    const totalMonthlyWeight = tasks.reduce((sum, t) => sum + (parseFloat(t.weight) || 0), 0);
                    if (parentPlanWeight > 0 && totalMonthlyWeight > parentPlanWeight + 0.01) {
                        return rollback(`Total breakdown task weight (${totalMonthlyWeight.toFixed(2)}%) cannot be greater than the Action Plan weight (${parentPlanWeight}%).`);
                    }

                    const existingMonthly = await qry('SELECT monthly_task_id FROM monthly_tasks WHERE specific_objective_detail_id = ?', [specific_objective_detail_id]);
                    const existingMonthlyIds = existingMonthly.map(m => m.monthly_task_id);
                    const actualIncomingIds = tasks.map(t => t.monthly_task_id).filter(id => id && existingMonthlyIds.includes(id));
                    const idsToDelete = existingMonthlyIds.filter(id => !actualIncomingIds.includes(id));

                    if (idsToDelete.length > 0) {
                        await qry('DELETE FROM weekly_tasks WHERE monthly_task_id IN (?)', [idsToDelete]);
                        await qry('DELETE FROM monthly_tasks WHERE monthly_task_id IN (?)', [idsToDelete]);
                    }

                    // 2. Process Monthly Tasks (Upsert)
                    for (const mTask of tasks) {
                        const mId = mTask.monthly_task_id;
                        let currentMonthlyId = mId;

                        let calculatedMPlanAmount = Number(mTask.plan_amount) || 0;
                        if (calculatedMPlanAmount === 0 && Number(mTask.weight) > 0 && parentPlanAmount > 0 && parentPlanWeight > 0) {
                            calculatedMPlanAmount = Number(((Number(mTask.weight) / parentPlanWeight) * parentPlanAmount).toFixed(2));
                        }

                        const wbrGroup = mTask.wbr_group || 'WBR1';
                        const wbrGroupWeight = parseFloat(mTask.wbr_group_weight) || 0;
                        const wbrGroupPlanAmount = parseFloat(mTask.wbr_group_plan_amount) || 0;

                        if (mId && existingMonthlyIds.includes(mId)) {
                            await qry('UPDATE monthly_tasks SET name = ?, weight = ?, plan_amount = ?, start_date = ?, deadline = ?, wbr_group = ?, wbr_group_weight = ?, wbr_group_plan_amount = ? WHERE monthly_task_id = ?',
                                [mTask.name, mTask.weight || 0, calculatedMPlanAmount, mTask.start_date || null, mTask.deadline || null, wbrGroup, wbrGroupWeight, wbrGroupPlanAmount, mId]);
                        } else {
                            const result = await qry('INSERT INTO monthly_tasks (specific_objective_detail_id, name, weight, plan_amount, start_date, deadline, wbr_group, wbr_group_weight, wbr_group_plan_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [specific_objective_detail_id, mTask.name, mTask.weight || 0, calculatedMPlanAmount, mTask.start_date || null, mTask.deadline || null, wbrGroup, wbrGroupWeight, wbrGroupPlanAmount]);
                            currentMonthlyId = result.insertId;
                        }

                        // 3. Process Weekly Tasks
                        const incomingWeekly = mTask.weeklyTasks || [];
                        const existingWeekly = await qry('SELECT weekly_task_id FROM weekly_tasks WHERE monthly_task_id = ?', [currentMonthlyId]);
                        const existingWeeklyIds = existingWeekly.map(w => w.weekly_task_id);
                        const actualIncomingWeeklyIds = incomingWeekly.map(w => w.weekly_task_id).filter(id => id && existingWeeklyIds.includes(id));
                        const weeklyToDelete = existingWeeklyIds.filter(id => !actualIncomingWeeklyIds.includes(id));

                        if (weeklyToDelete.length > 0) {
                            await qry('DELETE FROM weekly_tasks WHERE weekly_task_id IN (?)', [weeklyToDelete]);
                        }

                        for (const wTask of incomingWeekly) {
                            const wId = wTask.weekly_task_id;
                            let calculatedWPlanAmount = Number(wTask.plan_amount) || 0;
                            if (calculatedWPlanAmount === 0 && Number(wTask.weight) > 0 && calculatedMPlanAmount > 0 && Number(mTask.weight) > 0) {
                                calculatedWPlanAmount = Number(((Number(wTask.weight) / Number(mTask.weight)) * calculatedMPlanAmount).toFixed(2));
                            } else if (calculatedWPlanAmount === 0 && Number(wTask.weight) > 0 && parentPlanAmount > 0 && parentPlanWeight > 0) {
                                calculatedWPlanAmount = Number(((Number(wTask.weight) / parentPlanWeight) * parentPlanAmount).toFixed(2));
                            }

                            if (wId && existingWeeklyIds.includes(wId)) {
                                await qry('UPDATE weekly_tasks SET name = ?, weight = ?, plan_amount = ?, start_date = ?, deadline = ? WHERE weekly_task_id = ?',
                                    [wTask.name, wTask.weight || 0, calculatedWPlanAmount, wTask.start_date || null, wTask.deadline || null, wId]);
                            } else {
                                await qry('INSERT INTO weekly_tasks (monthly_task_id, name, weight, plan_amount, start_date, deadline) VALUES (?, ?, ?, ?, ?, ?)',
                                    [currentMonthlyId, wTask.name, wTask.weight || 0, calculatedWPlanAmount, wTask.start_date || null, wTask.deadline || null]);
                            }
                        }
                    }

                    connection.commit(async (err) => {
                        connection.release();
                        if (err) return res.status(500).json({ success: false, message: 'Commit error' });
                        try {
                            await syncPlanProgress(specific_objective_detail_id);
                        } catch (syncErr) {
                            console.error('Error syncing plan progress after commit:', syncErr.message);
                        }
                        res.status(200).json({ success: true, message: 'Tasks updated successfully' });
                    });
                } catch (error) {
                    console.error('Process error:', error);
                    rollback('Processing error: ' + error.message);
                }
            })();
        });
    });
};


// Update task progress, description, and attachment
const updateTaskProgress = (req, res) => {
    const { taskId, type, status, description } = req.body;
    let { progress, actual_amount } = req.body;
    const attachment = req.file ? req.file.filename : null;

    // If actual_amount is provided, calculate progress from parent plan's planned target
    const hasActualAmount = actual_amount !== undefined && actual_amount !== null && actual_amount !== '';

    if (!taskId || !type) {
        return res.status(400).json({
            success: false,
            message: 'Task ID and type (monthly/weekly) are required'
        });
    }

    const table = type === 'monthly' ? 'monthly_tasks' : 'weekly_tasks';
    const idColumn = type === 'monthly' ? 'monthly_task_id' : 'weekly_task_id';

    // 1. First, find which specific_objective_detail_id this task belongs to (+ parent plan metrics)
    const getDetailIdQuery = type === 'monthly'
        ? `SELECT mt.specific_objective_detail_id, mt.weight AS task_weight, mt.plan_amount AS task_plan_amount,
                  mt.deadline AS task_deadline, sod.deadline AS plan_deadline,
                  COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS plan_name,
                  COALESCE(sod.weight, 0) AS plan_weight,
                  COALESCE(sod.baseline, sod.CIbaseline, 0) AS plan_baseline,
                  COALESCE(sod.plan, sod.CIplan, 0) AS plan_target,
                  sod.measurement AS plan_measurement,
                  sod.plan_type, sod.cost_type, sod.costName, sod.income_plan_type, sod.incomeName, 
                  sod.income_exchange, sod.employment_type, sod.employee_of, sod.project_type
           FROM monthly_tasks mt
           LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
           WHERE mt.monthly_task_id = ?`
        : `SELECT mt.specific_objective_detail_id, wt.weight AS task_weight, wt.plan_amount AS task_plan_amount,
                  wt.deadline AS task_deadline, mt.deadline AS monthly_deadline, sod.deadline AS plan_deadline,
                  COALESCE(sod.specific_objective_detailname, sod.name, 'Action Plan') AS plan_name,
                  COALESCE(sod.weight, 0) AS plan_weight,
                  COALESCE(sod.baseline, sod.CIbaseline, 0) AS plan_baseline,
                  COALESCE(sod.plan, sod.CIplan, 0) AS plan_target,
                  sod.measurement AS plan_measurement,
                  sod.plan_type, sod.cost_type, sod.costName, sod.income_plan_type, sod.incomeName, 
                  sod.income_exchange, sod.employment_type, sod.employee_of, sod.project_type
           FROM weekly_tasks wt
           JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
           LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
           WHERE wt.weekly_task_id = ?`;

    con.query(getDetailIdQuery, [taskId], (err, results) => {
        if (err || results.length === 0) {
            console.error('Error finding parent detail:', err);
            return res.status(500).json({ success: false, message: 'Could not find parent plan' });
        }

        const parentInfo = results[0];
        const effectiveDeadline = parentInfo.task_deadline || parentInfo.monthly_deadline || parentInfo.plan_deadline;
        if (effectiveDeadline && isPastDeadline(effectiveDeadline)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot submit report: The deadline for this task has passed.'
            });
        }

        const detailId = parentInfo.specific_objective_detail_id;
        const taskWeight = Number(parentInfo.task_weight) || 0;
        const taskPlanAmount = Number(parentInfo.task_plan_amount) || 0;
        const planTarget = Number(parentInfo.plan_target) || 0;
        const planBaseline = Number(parentInfo.plan_baseline) || 0;
        const planWeight = Number(parentInfo.plan_weight) || 0;
        const planName = parentInfo.plan_name || 'Action Plan';
        const planType = parentInfo.plan_type || 'general';
        const unitStr = parentInfo.income_exchange ? parentInfo.income_exchange.toUpperCase() : (parentInfo.plan_measurement || 'units');

        const effectiveTaskPlanTarget = taskPlanAmount > 0 
          ? taskPlanAmount 
          : ((planTarget > 0 && taskWeight > 0 && planWeight > 0) 
              ? Number(((taskWeight / planWeight) * planTarget).toFixed(2)) 
              : planTarget);

        let plan_progress;

        // Auto-calculate plan_progress from actual_amount and effectiveTaskPlanTarget
        if (hasActualAmount) {
            if (effectiveTaskPlanTarget > 0) {
                plan_progress = Math.min(100, Math.round((Number(actual_amount) / effectiveTaskPlanTarget) * 100));
            } else {
                plan_progress = Math.min(100, Number(actual_amount));
            }
            
            // Optionally auto-sync the weight progress if it wasn't manually provided
            if (progress === undefined) {
                progress = plan_progress;
            }
        }

        // 2. Perform the update
        let query = `UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP`;
        const params = [];

        if (progress !== undefined) {
            query += `, progress = ?`;
            params.push(progress);
        }
        if (plan_progress !== undefined) {
            query += `, plan_progress = ?`;
            params.push(plan_progress);
        }
        if (status) {
            query += `, status = ?`;
            params.push(status);
        }
        if (description !== undefined) {
            query += `, description = ?`;
            params.push(description);
        }
        if (attachment) {
            query += `, attachment = ?`;
            params.push(attachment);
        }
        if (hasActualAmount) {
            query += `, actual_amount = ?`;
            params.push(Number(actual_amount));
        }

        query += ` WHERE ${idColumn} = ?`;
        params.push(taskId);

        con.query(query, params, async (err, result) => {
            if (err) {
                console.error(`Error updating ${type} task details:`, err);
                return res.status(500).json({
                    success: false,
                    message: `Error updating ${type} task details`,
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Task not found' });
            }

            // 3. Sync the parent plan's progress & push outcome to parent sod & Notify Supervisor
            try {
                await syncPlanProgress(detailId);

                // If actual_amount provided, also update the outcome on the parent action plan
                if (hasActualAmount) {
                    con.query(
                        'UPDATE specific_objective_details SET outcome = ?, updated_at = CURRENT_TIMESTAMP WHERE specific_objective_detail_id = ?',
                        [Number(actual_amount), detailId],
                        (oErr) => { if (oErr) console.warn('Could not update outcome on sod:', oErr.message); }
                    );
                }

                // Notify original supervisor if present
                const NotificationService = require('../services/notificationService');
                const currentUserId = req.user_id;

                const assigneeQuery = type === 'monthly'
                    ? `SELECT mta.assigned_by, mt.name AS task_name, CONCAT(e.fname, ' ', e.lname) AS pusher_name
                       FROM monthly_task_assignees mta
                       JOIN monthly_tasks mt ON mta.monthly_task_id = mt.monthly_task_id
                       JOIN users u ON u.user_id = ?
                       LEFT JOIN employees e ON u.employee_id = e.employee_id
                       WHERE mta.monthly_task_id = ?`
                    : `SELECT wta.assigned_by, wt.name AS task_name, CONCAT(e.fname, ' ', e.lname) AS pusher_name
                       FROM weekly_task_assignees wta
                       JOIN weekly_tasks wt ON wta.weekly_task_id = wt.weekly_task_id
                       JOIN users u ON u.user_id = ?
                       LEFT JOIN employees e ON u.employee_id = e.employee_id
                       WHERE wta.weekly_task_id = ?`;

                con.query(assigneeQuery, [currentUserId, taskId], (aErr, aRows) => {
                    if (!aErr && aRows && aRows.length > 0) {
                        aRows.forEach(row => {
                            const supervisorId = row.assigned_by;
                            if (supervisorId && supervisorId !== currentUserId) {
                                const taskName = row.task_name || 'Breakdown Task';
                                const pusherName = row.pusher_name || 'Subordinate';
                                const actualStr = hasActualAmount ? `${Number(actual_amount).toLocaleString()} ${unitStr}` : 'N/A';
                                const targetStr = `${planTarget.toLocaleString()} ${unitStr}`;

                                NotificationService.createNotification({
                                    user_id: supervisorId,
                                    type: 'task_progress_push',
                                    title: `⚡ Progress Pushed: ${taskName}`,
                                    message: `${pusherName} pushed progress on "${taskName}" for Action Plan "${planName}" (Weight: ${planWeight}). Target: ${targetStr} | Achieved: ${actualStr} (${progress}% completed). Notes: ${description || 'No notes provided'}.`,
                                    priority: 'high',
                                    data: {
                                        task_id: taskId,
                                        task_type: type,
                                        detail_id: detailId,
                                        plan_name: planName,
                                        plan_type: planType,
                                        plan_weight: planWeight,
                                        plan_target: planTarget,
                                        actual_amount: hasActualAmount ? Number(actual_amount) : null,
                                        unit: unitStr,
                                        progress: progress,
                                        pusher_name: pusherName,
                                        target_page: 'supervisor_breakdown'
                                    }
                                }).catch(nErr => console.error('Failed to notify supervisor on progress push:', nErr.message));
                            }
                        });
                    }
                });

                const isComplete = Number(progress) >= 100;
                logAudit(req.user_id, isComplete ? (AUDIT_ACTIONS.TASK_COMPLETE || 'TASK_COMPLETE') : (AUDIT_ACTIONS.TASK_UPDATE || 'TASK_UPDATE'),
                    `${isComplete ? 'Completed' : 'Updated progress on'} ${type} task ID ${taskId} (${planName}) — ${progress}%${hasActualAmount ? ` | Actual: ${actual_amount} ${unitStr}` : ''}`,
                    { taskId, type, progress, status, actual_amount: hasActualAmount ? Number(actual_amount) : null, plan_name: planName, detail_id: detailId }
                , req).catch(() => {});

                res.status(200).json({
                    success: true,
                    message: 'Task details updated successfully',
                    attachment: attachment,
                    inheritedMetrics: {
                        plan_name: planName,
                        plan_type: planType,
                        plan_weight: planWeight,
                        plan_baseline: planBaseline,
                        plan_target: planTarget,
                        actual_amount: hasActualAmount ? Number(actual_amount) : null,
                        unit: unitStr,
                        calculated_progress: progress
                    }
                });
            } catch (syncError) {
                console.error('Error syncing plan progress:', syncError);
                // Still return success for the task update, but log the sync error
                res.status(200).json({
                    success: true,
                    message: 'Task updated but plan progress sync failed',
                    attachment: attachment
                });
            }
        });
    });
};

// ── TASK ASSIGNEES ──────────────────────────────────────────────

// Get assignees for a monthly task
const getMonthlyTaskAssignees = (req, res) => {
    const { taskId } = req.params;
    const sql = `
        SELECT mta.id, mta.user_id, mta.assigned_at,
            CONCAT(e.fname, ' ', e.lname) AS name,
            u.avatar_url,
            os.name AS position,
            d.name AS department_name
        FROM monthly_task_assignees mta
        JOIN users u ON mta.user_id = u.user_id
        JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
        LEFT JOIN organization_structure os ON ep.org_node_id = os.id
        WHERE mta.monthly_task_id = ?
        ORDER BY mta.assigned_at DESC
    `;
    con.query(sql, [taskId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error', error: err.message });
        res.json({ success: true, assignees: results });
    });
};

// Set (replace) assignees for a monthly task
const setMonthlyTaskAssignees = (req, res) => {
    const { taskId } = req.params;
    const { user_ids } = req.body; // Array of user_ids
    const assignedBy = req.user_id || req.user?.user_id || req.user?.id || (Array.isArray(user_ids) && user_ids[0]) || 1;

    if (!Array.isArray(user_ids)) {
        return res.status(400).json({ success: false, message: 'user_ids must be an array' });
    }

    // Delete existing then insert new
    con.query('DELETE FROM monthly_task_assignees WHERE monthly_task_id = ?', [taskId], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error', error: err.message });
        if (user_ids.length === 0) return res.json({ success: true, message: 'Assignees cleared' });
        const values = user_ids.map(uid => [taskId, uid, assignedBy]);
        con.query('INSERT INTO monthly_task_assignees (monthly_task_id, user_id, assigned_by) VALUES ?', [values], (err2) => {
            if (err2) return res.status(500).json({ success: false, message: 'Insert error', error: err2.message });

            // Create navbar notifications
            try {
                const NotificationService = require('../services/notificationService');
                con.query('SELECT name FROM monthly_tasks WHERE monthly_task_id = ?', [taskId], (mErr, mRows) => {
                    const taskName = mRows && mRows[0] ? mRows[0].name : 'Monthly Task';
                    user_ids.forEach(uid => {
                        const isSelf = Number(uid) === Number(assignedBy);
                        NotificationService.createNotification({
                            user_id: uid,
                            type: 'task',
                            title: isSelf ? '📋 Self-Assigned Breakdown Task' : '📋 Breakdown Task Assigned',
                            message: isSelf ? `You self-assigned monthly task "${taskName}"` : `You have been assigned to monthly breakdown task "${taskName}"`,
                            priority: 'medium'
                        }).catch(() => {});
                    });
                });
            } catch (_) {}

            logAudit(assignedBy, AUDIT_ACTIONS.TASK_UPDATE || 'TASK_UPDATE', `Delegated Monthly Task ID ${taskId} to ${user_ids.length} user(s)`, {
                monthly_task_id: taskId, assigned_to: user_ids, assigned_by: assignedBy
            }, req).catch(() => {});

            res.json({ success: true, message: 'Assignees updated', count: user_ids.length });
        });
    });
};

// Get assignees for a weekly task
const getWeeklyTaskAssignees = (req, res) => {
    const { taskId } = req.params;
    const sql = `
        SELECT wta.id, wta.user_id, wta.assigned_at,
            CONCAT(e.fname, ' ', e.lname) AS name,
            u.avatar_url,
            os.name AS position,
            d.name AS department_name
        FROM weekly_task_assignees wta
        JOIN users u ON wta.user_id = u.user_id
        JOIN employees e ON u.employee_id = e.employee_id
        LEFT JOIN departments d ON e.department_id = d.department_id
        LEFT JOIN employee_positions ep ON e.employee_id = ep.employee_id AND ep.is_primary = 1
        LEFT JOIN organization_structure os ON ep.org_node_id = os.id
        WHERE wta.weekly_task_id = ?
        ORDER BY wta.assigned_at DESC
    `;
    con.query(sql, [taskId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error', error: err.message });
        res.json({ success: true, assignees: results });
    });
};

// Set (replace) assignees for a weekly task
const setWeeklyTaskAssignees = (req, res) => {
    const { taskId } = req.params;
    const { user_ids } = req.body;
    const assignedBy = req.user_id || req.user?.user_id || req.user?.id || (Array.isArray(user_ids) && user_ids[0]) || 1;

    if (!Array.isArray(user_ids)) {
        return res.status(400).json({ success: false, message: 'user_ids must be an array' });
    }

    con.query('DELETE FROM weekly_task_assignees WHERE weekly_task_id = ?', [taskId], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'DB error', error: err.message });
        if (user_ids.length === 0) return res.json({ success: true, message: 'Assignees cleared' });

        const values = user_ids.map(uid => [taskId, uid, assignedBy]);
        con.query('INSERT INTO weekly_task_assignees (weekly_task_id, user_id, assigned_by) VALUES ?', [values], (err2) => {
            if (err2) return res.status(500).json({ success: false, message: 'Insert error', error: err2.message });

            // Create navbar notifications
            try {
                const NotificationService = require('../services/notificationService');
                con.query('SELECT name FROM weekly_tasks WHERE weekly_task_id = ?', [taskId], (wErr, wRows) => {
                    const taskName = wRows && wRows[0] ? wRows[0].name : 'Weekly Task';
                    user_ids.forEach(uid => {
                        const isSelf = Number(uid) === Number(assignedBy);
                        NotificationService.createNotification({
                            user_id: uid,
                            type: 'task',
                            title: isSelf ? '📋 Self-Assigned Weekly Task' : '📋 Weekly Task Assigned',
                            message: isSelf ? `You self-assigned weekly task "${taskName}"` : `You have been assigned to weekly task "${taskName}"`,
                            priority: 'medium'
                        }).catch(() => {});
                    });
                });
            } catch (_) {}

            logAudit(assignedBy, AUDIT_ACTIONS.TASK_UPDATE || 'TASK_UPDATE', `Delegated Weekly Task ID ${taskId} to ${user_ids.length} user(s)`, {
                weekly_task_id: taskId, assigned_to: user_ids, assigned_by: assignedBy
            }, req).catch(() => {});

            res.json({ success: true, message: 'Assignees updated', count: user_ids.length });
        });
    });
};

// Get breakdown tasks (monthly and weekly) assigned to current user
const getMyReceivedBreakdownTasks = (req, res) => {
    const userId = req.user_id;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const monthlySql = `
        SELECT 
            mt.monthly_task_id,
            mt.specific_objective_detail_id,
            mt.name AS name,
            mt.weight,
            mt.progress,
            mt.status,
            mt.description,
            mt.attachment,
            mt.actual_amount,
            mt.created_at,
            mt.start_date AS task_start_date,
            mt.deadline AS task_deadline,
            'monthly' AS type,
            COALESCE(so.specific_objective_name, so.name, sod.name, sod.specific_objective_detailname) AS SpecificObjective,
            COALESCE(g.name, 'Goal') AS Goal,
            COALESCE(o.name, 'Objective') AS Objective,
            CASE WHEN mta.assigned_by = mta.user_id OR mta.user_id IS NULL THEN 'Self-Assigned (Me)' ELSE CONCAT(e.fname, ' ', e.lname) END AS assigned_by_name,
            -- Action plan details
            COALESCE(sod.specific_objective_detailname, sod.name, sod.details, 'Action Plan') AS action_plan_name,
            sod.details AS action_plan_details,
            sod.plan_type,
            sod.cost_type,
            sod.costName,
            sod.income_plan_type,
            sod.incomeName,
            sod.income_exchange,
            sod.employment_type,
            sod.project_type,
            sod.CIbaseline,
            sod.CIplan,
            sod.CIbaseline AS ci_baseline,
            sod.CIplan AS ci_plan,
            sod.CIbaseline AS CI_Baseline,
            sod.CIplan AS CI_Plan,
            sod.CIplan AS action_plan_ciplan,
            sod.CIbaseline AS action_plan_cibaseline,
            sod.baseline,
            sod.plan,
            sod.plan AS action_plan_plan,
            sod.baseline AS action_plan_baseline,
            sod.weight AS action_plan_weight,
            sod.priority AS action_plan_priority,
            sod.status AS action_plan_status,
            COALESCE(sod.CIbaseline, sod.baseline, 0) AS plan_baseline,
            COALESCE(
                NULLIF(mt.plan_amount, 0),
                (CASE WHEN sod.plan > 0 AND mt.weight > 0 THEN ROUND((mt.weight / sod.plan) * COALESCE(NULLIF(sod.CIplan, 0), sod.plan, 0), 2) ELSE NULL END),
                sod.CIplan,
                (CASE WHEN sod.plan > 1 THEN sod.plan ELSE NULL END),
                0
            ) AS plan_target,
            mt.plan_amount AS task_plan_amount,
            mt.plan_amount,
            sod.measurement AS plan_measurement,
            COALESCE(g.is_active, 1) AS goal_is_active,
            apqa.is_active AS ap_quarter_active,
            so.specific_objective_id,
            COALESCE(so.specific_objective_name, so.name, 'KPI') AS kpi_name,
            so.weight AS kpi_weight,
            so.measurement AS kpi_measurement,
            so.baseline AS kpi_baseline,
            so.plan AS kpi_target,
            o.objective_id,
            COALESCE(o.name, 'Objective') AS objective_name,
            o.description AS objective_description,
            o.weight AS objective_weight,
            g.goal_id,
            COALESCE(g.name, 'Goal') AS goal_name,
            g.description AS goal_description,
            g.year AS goal_year,
            g.quarter AS goal_quarter,
            g.weight AS goal_weight,
            COALESCE(mt.deadline, sod.deadline) AS plan_deadline,
            COALESCE(mt.start_date, sod.created_at) AS plan_start_date
        FROM monthly_tasks mt
        LEFT JOIN monthly_task_assignees mta ON mt.monthly_task_id = mta.monthly_task_id
        LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
        LEFT JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
        LEFT JOIN objectives o ON so.objective_id = o.objective_id
        LEFT JOIN goals g ON (sod.goal_id = g.goal_id OR o.goal_id = g.goal_id)
        LEFT JOIN action_plan_quarter_activations apqa ON apqa.specific_objective_detail_id = sod.specific_objective_detail_id
        LEFT JOIN users u ON mta.assigned_by = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        WHERE mta.user_id = ? OR sod.user_id = ? OR sod.created_by = ?
        GROUP BY mt.monthly_task_id
        ORDER BY mt.created_at DESC
    `;

    const weeklySql = `
        SELECT 
            wt.weekly_task_id,
            mt.specific_objective_detail_id,
            wt.name AS name,
            wt.weight,
            wt.progress,
            wt.status,
            wt.description,
            wt.attachment,
            wt.actual_amount,
            wt.created_at,
            wt.start_date AS task_start_date,
            wt.deadline AS task_deadline,
            'weekly' AS type,
            mt.name AS parent_monthly_name,
            mt.weight AS parent_monthly_weight,
            mt.plan_amount AS parent_monthly_plan_amount,
            COALESCE(so.specific_objective_name, so.name, sod.name, sod.specific_objective_detailname) AS SpecificObjective,
            COALESCE(g.name, 'Goal') AS Goal,
            COALESCE(o.name, 'Objective') AS Objective,
            CASE WHEN wta.assigned_by = wta.user_id OR wta.user_id IS NULL THEN 'Self-Assigned (Me)' ELSE CONCAT(e.fname, ' ', e.lname) END AS assigned_by_name,
            -- Action plan details
            COALESCE(sod.specific_objective_detailname, sod.name, sod.details, 'Action Plan') AS action_plan_name,
            sod.details AS action_plan_details,
            sod.plan_type,
            sod.cost_type,
            sod.costName,
            sod.income_plan_type,
            sod.incomeName,
            sod.income_exchange,
            sod.employment_type,
            sod.project_type,
            sod.CIbaseline,
            sod.CIplan,
            sod.CIbaseline AS ci_baseline,
            sod.CIplan AS ci_plan,
            sod.CIbaseline AS CI_Baseline,
            sod.CIplan AS CI_Plan,
            sod.CIplan AS action_plan_ciplan,
            sod.CIbaseline AS action_plan_cibaseline,
            sod.baseline,
            sod.plan,
            sod.plan AS action_plan_plan,
            sod.baseline AS action_plan_baseline,
            sod.weight AS action_plan_weight,
            sod.priority AS action_plan_priority,
            sod.status AS action_plan_status,
            COALESCE(sod.CIbaseline, sod.baseline, 0) AS plan_baseline,
            COALESCE(
                NULLIF(wt.plan_amount, 0),
                (CASE WHEN mt.weight > 0 AND wt.weight > 0 AND mt.plan_amount > 0 THEN ROUND((wt.weight / mt.weight) * mt.plan_amount, 2) ELSE NULL END),
                (CASE WHEN sod.plan > 0 AND wt.weight > 0 THEN ROUND((wt.weight / sod.plan) * COALESCE(NULLIF(sod.CIplan, 0), sod.plan, 0), 2) ELSE NULL END),
                sod.CIplan,
                (CASE WHEN sod.plan > 1 THEN sod.plan ELSE NULL END),
                0
            ) AS plan_target,
            wt.plan_amount AS task_plan_amount,
            wt.plan_amount,
            sod.measurement AS plan_measurement,
            COALESCE(g.is_active, 1) AS goal_is_active,
            apqa.is_active AS ap_quarter_active,
            so.specific_objective_id,
            COALESCE(so.specific_objective_name, so.name, 'KPI') AS kpi_name,
            so.weight AS kpi_weight,
            so.measurement AS kpi_measurement,
            so.baseline AS kpi_baseline,
            so.plan AS kpi_target,
            o.objective_id,
            COALESCE(o.name, 'Objective') AS objective_name,
            o.description AS objective_description,
            o.weight AS objective_weight,
            g.goal_id,
            COALESCE(g.name, 'Goal') AS goal_name,
            g.description AS goal_description,
            g.year AS goal_year,
            g.quarter AS goal_quarter,
            g.weight AS goal_weight,
            COALESCE(wt.deadline, mt.deadline, sod.deadline) AS plan_deadline,
            COALESCE(wt.start_date, mt.start_date, sod.created_at) AS plan_start_date
        FROM weekly_tasks wt
        JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id
        LEFT JOIN weekly_task_assignees wta ON wt.weekly_task_id = wta.weekly_task_id
        LEFT JOIN specific_objective_details sod ON mt.specific_objective_detail_id = sod.specific_objective_detail_id
        LEFT JOIN specific_objectives so ON sod.specific_objective_id = so.specific_objective_id
        LEFT JOIN objectives o ON so.objective_id = o.objective_id
        LEFT JOIN goals g ON (sod.goal_id = g.goal_id OR o.goal_id = g.goal_id)
        LEFT JOIN action_plan_quarter_activations apqa ON apqa.specific_objective_detail_id = sod.specific_objective_detail_id
        LEFT JOIN users u ON wta.assigned_by = u.user_id
        LEFT JOIN employees e ON u.employee_id = e.employee_id
        WHERE wta.user_id = ? OR sod.user_id = ? OR sod.created_by = ?
        GROUP BY wt.weekly_task_id
        ORDER BY wt.created_at DESC
    `;

    con.query(monthlySql, [userId, userId, userId], (err1, monthlyResults) => {
        if (err1) {
            console.error('Error fetching received monthly tasks:', err1);
            return res.status(500).json({ success: false, message: 'DB error', error: err1.message });
        }

        con.query(weeklySql, [userId, userId, userId], (err2, weeklyResults) => {
            if (err2) {
                console.error('Error fetching received weekly tasks:', err2);
                return res.status(500).json({ success: false, message: 'DB error', error: err2.message });
            }

            const allMonthly = (monthlyResults || []).map(t => ({ ...t, is_active_period: true, goal_is_active: 1, ap_quarter_active: 1 }));
            const allWeekly = (weeklyResults || []).map(t => ({ ...t, is_active_period: true, goal_is_active: 1, ap_quarter_active: 1 }));
            const totalCount = allMonthly.length + allWeekly.length;

            const page = parseInt(req.query.page, 10);
            const limit = parseInt(req.query.limit, 10);

            if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;

                // Slice monthly and weekly tasks proportionally or combine
                res.status(200).json({
                    success: true,
                    monthlyTasks: allMonthly,
                    weeklyTasks: allWeekly,
                    pagination: {
                        total: totalCount,
                        page,
                        limit,
                        totalPages: Math.ceil(totalCount / limit)
                    }
                });
            } else {
                res.status(200).json({
                    success: true,
                    monthlyTasks: allMonthly,
                    weeklyTasks: allWeekly,
                    pagination: {
                        total: totalCount,
                        page: 1,
                        limit: totalCount,
                        totalPages: 1
                    }
                });
            }
        });
    });
};

module.exports = {
    getTasksByDetailId,
    addTasksToDetail,
    updateTasksToDetail,
    addWeeklyTasks,
    updateMonthlyTaskWeight,
    updateWeeklyTaskWeight,
    updateTaskWeightsBatch,
    updateTaskProgress,
    getMonthlyTaskAssignees,
    setMonthlyTaskAssignees,
    getWeeklyTaskAssignees,
    setWeeklyTaskAssignees,
    getMyReceivedBreakdownTasks
};

