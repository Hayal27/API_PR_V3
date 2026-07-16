// Controller for task breakdown operations
const con = require('../models/db');

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
      mt.created_at AS monthly_created_at,
      mt.updated_at AS monthly_updated_at,
      wt.weekly_task_id,
      wt.name AS weekly_task_name,
      wt.weight AS weekly_task_weight,
      wt.progress AS weekly_task_progress,
      wt.status AS weekly_task_status,
      wt.description AS weekly_task_description,
      wt.attachment AS weekly_task_attachment,
      wt.created_at AS weekly_created_at,
      wt.updated_at AS weekly_updated_at
    FROM monthly_tasks mt
    LEFT JOIN weekly_tasks wt ON mt.monthly_task_id = wt.monthly_task_id
    WHERE mt.specific_objective_detail_id = ?
    ORDER BY mt.monthly_task_id, wt.weekly_task_id
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
                    created_at: row.monthly_created_at,
                    updated_at: row.monthly_updated_at,
                    weeklyTasks: []
                });
            }

            if (row.weekly_task_id) {
                monthlyTasksMap.get(row.monthly_task_id).weeklyTasks.push({
                    weekly_task_id: row.weekly_task_id,
                    name: row.weekly_task_name,
                    weight: parseFloat(row.weekly_task_weight),
                    progress: parseFloat(row.weekly_task_progress) || 0,
                    status: row.weekly_task_status || 'Pending',
                    description: row.weekly_task_description,
                    attachment: row.weekly_task_attachment,
                    created_at: row.weekly_created_at,
                    updated_at: row.weekly_updated_at
                });
            }
        });

        const tasks = Array.from(monthlyTasksMap.values());

        res.status(200).json({
            success: true,
            tasks,
            count: tasks.length
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
                INSERT INTO monthly_tasks (specific_objective_detail_id, name, weight)
                VALUES (?, ?, ?)
            `;

            con.query(monthlyTaskQuery, [specific_objective_detail_id, monthlyTask.name, monthlyTask.weight || 0], (err, monthlyResult) => {
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
                                    INSERT INTO weekly_tasks (monthly_task_id, name, weight)
                                    VALUES (?, ?, ?)
                                `;

                                con.query(weeklyTaskQuery, [monthlyTaskId, weeklyTask.name, weeklyTask.weight || 0], (err) => {
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
            return res.status(500).json({
                success: false,
                message: 'Error updating monthly task weight',
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Monthly task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Monthly task weight updated successfully'
        });
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
            return res.status(500).json({
                success: false,
                message: 'Error updating weekly task weight',
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Weekly task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Weekly task weight updated successfully'
        });
    });
};

// Update multiple task weights at once
const updateTaskWeightsBatch = (req, res) => {
    const { monthlyTasks, weeklyTasks } = req.body;

    if ((!monthlyTasks || monthlyTasks.length === 0) && (!weeklyTasks || weeklyTasks.length === 0)) {
        return res.status(400).json({
            success: false,
            message: 'At least one task update is required'
        });
    }

    con.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({
                success: false,
                message: 'Error starting transaction',
                error: err.message
            });
        }

        const promises = [];

        // Update monthly tasks
        if (monthlyTasks && monthlyTasks.length > 0) {
            monthlyTasks.forEach(task => {
                promises.push(new Promise((resolve, reject) => {
                    const query = 'UPDATE monthly_tasks SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE monthly_task_id = ?';
                    con.query(query, [task.weight, task.monthly_task_id], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                }));
            });
        }

        // Update weekly tasks
        if (weeklyTasks && weeklyTasks.length > 0) {
            weeklyTasks.forEach(task => {
                promises.push(new Promise((resolve, reject) => {
                    const query = 'UPDATE weekly_tasks SET weight = ?, updated_at = CURRENT_TIMESTAMP WHERE weekly_task_id = ?';
                    con.query(query, [task.weight, task.weekly_task_id], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                }));
            });
        }

        Promise.all(promises)
            .then(() => {
                con.commit((err) => {
                    if (err) {
                        return con.rollback(() => {
                            console.error('Error committing transaction:', err);
                            res.status(500).json({
                                success: false,
                                message: 'Error committing transaction',
                                error: err.message
                            });
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: 'Task weights updated successfully',
                        updated: {
                            monthlyTasks: monthlyTasks?.length || 0,
                            weeklyTasks: weeklyTasks?.length || 0
                        }
                    });
                });
            })
            .catch((error) => {
                con.rollback(() => {
                    console.error('Error updating task weights:', error);
                    res.status(500).json({
                        success: false,
                        message: 'Error updating task weights',
                        error: error.message
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
                INSERT INTO weekly_tasks (monthly_task_id, name, weight)
                VALUES (?, ?, ?)
            `;

            con.query(query, [monthly_task_id, task.name, task.weight || 0], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    });

    Promise.all(promises)
        .then(() => {
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

// Update task progress, description, and attachment
// Helper to synchronize parent plan progress
const syncPlanProgress = async (detailId) => {
    return new Promise((resolve, reject) => {
        // 1. Get all tasks for this detail
        con.query('SELECT weight, progress FROM monthly_tasks WHERE specific_objective_detail_id = ?', [detailId], (err, tasks) => {
            if (err) return reject(err);

            // 2. Calculate weighted achievement
            const weightedAchievement = tasks.reduce((sum, t) => {
                const weight = parseFloat(t.weight) || 0;
                const progress = parseFloat(t.progress) || 0;
                return sum + (weight * progress / 100);
            }, 0);

            // 3. Get planned weight from detail
            con.query('SELECT plan FROM specific_objective_details WHERE specific_objective_detail_id = ?', [detailId], (err, detailResults) => {
                if (err) return reject(err);
                if (detailResults.length === 0) return resolve();

                const planned = parseFloat(detailResults[0].plan) || 100; // Fallback to 100 if plan is 0 (to avoid div by zero)
                const executionPercentage = planned > 0 ? (weightedAchievement / planned) * 100 : 0;

                // 4. Update the detail table
                // We update both execution_percentage and CIexecution_percentage to be safe
                const updateQuery = `
                    UPDATE specific_objective_details 
                    SET execution_percentage = ?, 
                        CIexecution_percentage = ?, 
                        achivement = ?
                    WHERE specific_objective_detail_id = ?
                `;
                con.query(updateQuery, [executionPercentage, executionPercentage, weightedAchievement, detailId], (err) => {
                    if (err) {
                        // If columns don't exist, this might fail, but we try anyway
                        // Fallback to simpler update if complex one fails
                        con.query('UPDATE specific_objective_details SET execution_percentage = ? WHERE specific_objective_detail_id = ?', 
                            [executionPercentage, detailId], (err) => err ? reject(err) : resolve());
                    } else {
                        resolve();
                    }
                });
            });
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

    con.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.status(500).json({ success: false, message: 'Transaction error' });
        }

        try {
            // 1. Get existing monthly tasks to identify deletions
            con.query('SELECT monthly_task_id FROM monthly_tasks WHERE specific_objective_detail_id = ?', [specific_objective_detail_id], async (err, existingMonthly) => {
                if (err) return con.rollback(() => res.status(500).json({ success: false, message: 'Error fetching existing tasks' }));

                const existingMonthlyIds = existingMonthly.map(m => m.monthly_task_id);
                const actualIncomingIds = tasks.map(t => t.monthly_task_id).filter(id => id && existingMonthlyIds.includes(id));

                const idsToDelete = existingMonthlyIds.filter(id => !actualIncomingIds.includes(id));

                if (idsToDelete.length > 0) {
                    await new Promise((resolve, reject) => {
                        con.query('DELETE FROM weekly_tasks WHERE monthly_task_id IN (?)', [idsToDelete], (err) => err ? reject(err) : resolve());
                    });
                    await new Promise((resolve, reject) => {
                        con.query('DELETE FROM monthly_tasks WHERE monthly_task_id IN (?)', [idsToDelete], (err) => err ? reject(err) : resolve());
                    });
                }

                // 2. Process Monthly Tasks (Upsert)
                for (const mTask of tasks) {
                    const mId = mTask.monthly_task_id;
                    let currentMonthlyId = mId;

                    if (mId && existingMonthlyIds.includes(mId)) {
                        await new Promise((resolve, reject) => {
                            con.query('UPDATE monthly_tasks SET name = ?, weight = ? WHERE monthly_task_id = ?', 
                                [mTask.name, mTask.weight || 0, mId], (err) => err ? reject(err) : resolve());
                        });
                    } else {
                        const result = await new Promise((resolve, reject) => {
                            con.query('INSERT INTO monthly_tasks (specific_objective_detail_id, name, weight) VALUES (?, ?, ?)', 
                                [specific_objective_detail_id, mTask.name, mTask.weight || 0], (err, res) => err ? reject(err) : resolve(res));
                        });
                        currentMonthlyId = result.insertId;
                    }

                    // 3. Process Weekly Tasks
                    const incomingWeekly = mTask.weeklyTasks || [];
                    const existingWeekly = await new Promise((resolve, reject) => {
                        con.query('SELECT weekly_task_id FROM weekly_tasks WHERE monthly_task_id = ?', [currentMonthlyId], (err, res) => err ? reject(err) : resolve(res));
                    });
                    const existingWeeklyIds = existingWeekly.map(w => w.weekly_task_id);
                    const actualIncomingWeeklyIds = incomingWeekly.map(w => w.weekly_task_id).filter(id => id && existingWeeklyIds.includes(id));
                    
                    const weeklyToDelete = existingWeeklyIds.filter(id => !actualIncomingWeeklyIds.includes(id));
                    if (weeklyToDelete.length > 0) {
                        await new Promise((resolve, reject) => {
                            con.query('DELETE FROM weekly_tasks WHERE weekly_task_id IN (?)', [weeklyToDelete], (err) => err ? reject(err) : resolve());
                        });
                    }

                    for (const wTask of incomingWeekly) {
                        const wId = wTask.weekly_task_id;
                        if (wId && existingWeeklyIds.includes(wId)) {
                            await new Promise((resolve, reject) => {
                                con.query('UPDATE weekly_tasks SET name = ?, weight = ? WHERE weekly_task_id = ?', 
                                    [wTask.name, wTask.weight || 0, wId], (err) => err ? reject(err) : resolve());
                            });
                        } else {
                            await new Promise((resolve, reject) => {
                                con.query('INSERT INTO weekly_tasks (monthly_task_id, name, weight) VALUES (?, ?, ?)', 
                                    [currentMonthlyId, wTask.name, wTask.weight || 0], (err) => err ? reject(err) : resolve());
                            });
                        }
                    }
                }

                // NEW: Sync plan progress after weights change
                await syncPlanProgress(specific_objective_detail_id);

                con.commit((err) => {
                    if (err) return con.rollback(() => res.status(500).json({ success: false, message: 'Commit error' }));
                    res.status(200).json({ success: true, message: 'Tasks updated successfully' });
                });
            });
        } catch (error) {
            console.error('Process error:', error);
            con.rollback(() => res.status(500).json({ success: false, message: 'Processing error', error: error.message }));
        }
    });
};

// Update task progress, description, and attachment
const updateTaskProgress = (req, res) => {
    const { taskId, type, progress, status, description } = req.body;
    const attachment = req.file ? req.file.filename : null;

    if (!taskId || !type) {
        return res.status(400).json({
            success: false,
            message: 'Task ID and type (monthly/weekly) are required'
        });
    }

    const table = type === 'monthly' ? 'monthly_tasks' : 'weekly_tasks';
    const idColumn = type === 'monthly' ? 'monthly_task_id' : 'weekly_task_id';

    // 1. First, find which specific_objective_detail_id this task belongs to
    const getDetailIdQuery = type === 'monthly' 
        ? 'SELECT specific_objective_detail_id FROM monthly_tasks WHERE monthly_task_id = ?'
        : 'SELECT mt.specific_objective_detail_id FROM weekly_tasks wt JOIN monthly_tasks mt ON wt.monthly_task_id = mt.monthly_task_id WHERE wt.weekly_task_id = ?';

    con.query(getDetailIdQuery, [taskId], (err, results) => {
        if (err || results.length === 0) {
            console.error('Error finding parent detail:', err);
            return res.status(500).json({ success: false, message: 'Could not find parent plan' });
        }

        const detailId = results[0].specific_objective_detail_id;

        // 2. Perform the update
        let query = `UPDATE ${table} SET updated_at = CURRENT_TIMESTAMP`;
        const params = [];

        if (progress !== undefined) {
            query += `, progress = ?`;
            params.push(progress);
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

            // 3. Sync the parent plan's progress
            try {
                await syncPlanProgress(detailId);
                res.status(200).json({
                    success: true,
                    message: 'Task details updated successfully',
                    attachment: attachment
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

module.exports = {
    getTasksByDetailId,
    addTasksToDetail,
    updateTasksToDetail,
    addWeeklyTasks,
    updateMonthlyTaskWeight,
    updateWeeklyTaskWeight,
    updateTaskWeightsBatch,
    updateTaskProgress
};
