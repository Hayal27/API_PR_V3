const cron = require('node-cron');
const db = require('../models/db');
const NotificationService = require('./notificationService');
const util = require('util');

class ReminderScheduler {
    static init() {
        // 1. Daily Task Summary - Every morning at 8:00 AM
        cron.schedule('0 8 * * *', () => {
            console.log('🌅 Running daily task summary check...');
            this.sendDailySummaries();
        });

        // 2. Meeting Reminders - Every 5 minutes (checks for meetings in 15 mins)
        cron.schedule('*/5 * * * *', () => {
            console.log('⏱️ Checking for upcoming meetings...');
            this.checkUpcomingMeetings();
        });

        // 3. Hourly Overdue Task Alerts - Every 1 hour interval
        cron.schedule('0 * * * *', () => {
            console.log('⚠️ Running hourly overdue task alert check...');
            this.checkHourlyOverdueAlerts();
        });

        // Initial run on startup (after 10s)
        setTimeout(() => {
            console.log('🚀 Running initial reminder and overdue checks...');
            this.sendDailySummaries();
            this.checkUpcomingMeetings();
            this.checkHourlyOverdueAlerts();
        }, 10000);
    }

    static async sendDailySummaries() {
        try {
            const query = util.promisify(db.query).bind(db);
            
            // Get all users who have linked Telegram
            const linkedUsers = await query(`
                SELECT u.user_id, e.name, e.telegram_chat_id 
                FROM users u
                JOIN employees e ON u.employee_id = e.employee_id
                WHERE e.telegram_chat_id IS NOT NULL
            `);

            for (const user of linkedUsers) {
                // Get pending assignments
                const assignments = await query(`
                    SELECT title, priority 
                    FROM task_assignments 
                    WHERE assigned_to = ? AND status IN ('pending', 'in_progress')
                `, [user.user_id]);

                // Get today's daily tasks
                const dailyTasks = await query(`
                    SELECT title, priority 
                    FROM daily_tasks 
                    WHERE user_id = ? AND task_date = CURDATE() AND status IN ('todo', 'in_progress')
                `, [user.user_id]);

                if (assignments.length > 0 || dailyTasks.length > 0) {
                    let message = `Good morning, ${user.name}! ☀️\n\nHere is your task summary for today:\n\n`;
                    
                    if (assignments.length > 0) {
                        message += `*Assigned Tasks (${assignments.length}):*\n`;
                        assignments.forEach(t => message += `• [${t.priority.toUpperCase()}] ${t.title}\n`);
                        message += `\n`;
                    }

                    if (dailyTasks.length > 0) {
                        message += `*Personal Daily Tasks (${dailyTasks.length}):*\n`;
                        dailyTasks.forEach(t => message += `• [${t.priority.toUpperCase()}] ${t.title}\n`);
                    }

                    message += `\nHave a productive day! 🚀`;

                    await NotificationService.sendTelegramNotification(user.user_id, "Daily Task Summary", message, "task");
                }
            }
        } catch (error) {
            console.error('Error in sendDailySummaries:', error);
        }
    }

    static async checkUpcomingMeetings() {
        try {
            const query = util.promisify(db.query).bind(db);

            // Find meetings starting in the next 15-20 minutes that haven't had a reminder sent
            const upcomingMeetings = await query(`
                SELECT m.meeting_id, m.title, m.start_time, m.location, m.meeting_link
                FROM meetings m
                WHERE m.status = 'scheduled'
                AND m.start_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 20 MINUTE)
                AND m.meeting_id NOT IN (
                    SELECT DISTINCT meeting_id FROM meeting_reminders WHERE sent = 1 AND reminder_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                )
            `);

            for (const meeting of upcomingMeetings) {
                // Get linked participants
                const participants = await query(`
                    SELECT mp.user_id, e.telegram_chat_id
                    FROM meeting_participants mp
                    JOIN users u ON mp.user_id = u.user_id
                    JOIN employees e ON u.employee_id = e.employee_id
                    WHERE mp.meeting_id = ? AND e.telegram_chat_id IS NOT NULL
                `, [meeting.meeting_id]);

                for (const p of participants) {
                    const timeStr = new Date(meeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const locationStr = meeting.location ? `\n📍 Location: ${meeting.location}` : '';
                    const linkStr = meeting.meeting_link ? `\n🔗 Link: ${meeting.meeting_link}` : '';
                    
                    const message = `Reminder: Your meeting "*${meeting.title}*" starts at *${timeStr}*!${locationStr}${linkStr}`;

                    await NotificationService.sendTelegramNotification(p.user_id, "Upcoming Meeting Reminder", message, "meeting");

                    // Log that we sent the reminder to prevent duplicates
                    await query(`
                        INSERT INTO meeting_reminders (meeting_id, user_id, reminder_time, sent, sent_at)
                        VALUES (?, ?, NOW(), 1, NOW())
                    `, [meeting.meeting_id, p.user_id]);
                }
            }
        } catch (error) {
            console.error('Error in checkUpcomingMeetings:', error);
        }
    }

    static async checkHourlyOverdueAlerts() {
        try {
            const query = util.promisify(db.query).bind(db);

            // Find all active task assignments that are overdue (due_date < NOW() and not completed/confirmed)
            const overdueAssignments = await query(`
                SELECT 
                    ta.assignment_id, ta.title, ta.priority, ta.due_date, ta.assigned_to, ta.assigned_by,
                    DATEDIFF(NOW(), ta.due_date) as days_overdue,
                    CONCAT(COALESCE(e.fname,''), ' ', COALESCE(e.lname,'')) as assignee_name
                FROM task_assignments ta
                JOIN users u ON ta.assigned_to = u.user_id
                JOIN employees e ON u.employee_id = e.employee_id
                WHERE ta.due_date IS NOT NULL
                  AND ta.due_date < NOW()
                  AND ta.status NOT IN ('completed', 'confirmed', 'cancelled')
            `);

            if (!overdueAssignments || overdueAssignments.length === 0) {
                console.log('✅ Hourly overdue check: No overdue task assignments found.');
                return;
            }

            // Group overdue tasks by assigned_to
            const userOverdueMap = {};
            for (const task of overdueAssignments) {
                if (!userOverdueMap[task.assigned_to]) {
                    userOverdueMap[task.assigned_to] = [];
                }
                userOverdueMap[task.assigned_to].push(task);
            }

            // Dispatch alert for each user (max 1 alert per 55 minutes to avoid spam)
            for (const [userId, tasks] of Object.entries(userOverdueMap)) {
                const recentAlerts = await query(`
                    SELECT COUNT(*) as count 
                    FROM notifications 
                    WHERE user_id = ? 
                      AND type = 'overdue_alert' 
                      AND created_at >= DATE_SUB(NOW(), INTERVAL 55 MINUTE)
                `, [userId]);

                if (recentAlerts[0]?.count > 0) {
                    continue; // Already alerted within this 1-hour interval
                }

                const taskCount = tasks.length;
                const topTasks = tasks.slice(0, 3).map(t => `• [${(t.priority || 'medium').toUpperCase()}] ${t.title} (${t.days_overdue}d overdue)`).join('\n');
                const title = `⚠️ Overdue Task Alert (${taskCount} pending)`;
                const message = `You have ${taskCount} task(s) past deadline requiring immediate completion:\n${topTasks}${taskCount > 3 ? `\n...and ${taskCount - 3} more` : ''}`;

                await NotificationService.createNotification({
                    user_id: Number(userId),
                    type: 'overdue_alert',
                    title: title,
                    message: message,
                    data: {
                        task_count: taskCount,
                        overdue_ids: tasks.map(t => t.assignment_id),
                        timestamp: new Date().toISOString()
                    },
                    priority: 'urgent'
                });

                console.log(`📢 Dispatched hourly overdue alert for user ${userId} (${taskCount} overdue tasks)`);
            }
        } catch (error) {
            console.error('Error in checkHourlyOverdueAlerts:', error);
        }
    }
}

module.exports = ReminderScheduler;
