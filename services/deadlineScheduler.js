const cron = require('node-cron');
const db = require('../models/db');
const NotificationService = require('./notificationService');

class DeadlineScheduler {
  static init() {
    // Run daily at 9:00 AM to check for deadline alerts
    cron.schedule('0 9 * * *', () => {
      console.log('🕘 Running daily deadline check...');
      this.checkDeadlines();
    });

    // Also run immediately on startup for testing
    setTimeout(() => {
      console.log('🚀 Running initial deadline check...');
      this.checkDeadlines();
    }, 5000);
  }

  static async checkDeadlines() {
    try {
      const query = `
        SELECT 
          p.plan_id,
          p.user_id,
          sod.deadline,
          sod.execution_percentage,
          g.name as goal_name,
          sod.details as plan_details,
          DATEDIFF(sod.deadline, CURDATE()) as days_until_deadline
        FROM plans p
        LEFT JOIN goals g ON p.goal_id = g.goal_id
        LEFT JOIN specific_objective_details sod ON p.specific_objective_detail_id = sod.specific_objective_detail_id
        LEFT JOIN approvalworkflow aw ON p.plan_id = aw.plan_id
        WHERE sod.deadline IS NOT NULL
        AND sod.deadline >= CURDATE() - INTERVAL 1 DAY  -- Include overdue by 1 day
        AND sod.deadline <= CURDATE() + INTERVAL 7 DAY   -- Include upcoming within 7 days
        AND (aw.status = 'Approved' OR aw.status = 'in progress')  -- Only active plans
        AND (sod.execution_percentage < 100 OR sod.execution_percentage IS NULL)  -- Not completed
      `;

      db.query(query, async (error, results) => {
        if (error) {
          console.error('Error checking deadlines:', error);
          return;
        }

        console.log(`📅 Found ${results.length} plans with upcoming/overdue deadlines`);

        for (const plan of results) {
          const daysUntilDeadline = plan.days_until_deadline;

          // 1. Rule: if Deadline passed -> Auto complete plan
          if (daysUntilDeadline < 0) {
            console.log(`⏱️  Deadline passed for plan ${plan.plan_id}. Auto-completing...`);
            await this.autoCompletePlan(plan.plan_id);
          }

          // 2. Send notification based on days remaining
          if (this.shouldSendDeadlineNotification(daysUntilDeadline)) {
            // Check if we already sent a notification for this plan today
            const alreadySentToday = await this.checkIfNotificationSentToday(plan.plan_id, 'deadline_alert');

            if (!alreadySentToday) {
              console.log(`⚠️  Sending deadline notification for plan ${plan.plan_id}: ${daysUntilDeadline} days remaining`);
              await NotificationService.createDeadlineAlertNotification(plan, daysUntilDeadline);
            }
          }
        }

        // Cleanup old notifications
        await NotificationService.cleanupOldNotifications(30);
      });
    } catch (error) {
      console.error('Error in deadline check:', error);
    }
  }

  static async autoCompletePlan(planId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE approvalworkflow 
        SET status = 'completed', 
            comment = CONCAT(IFNULL(comment, ''), '\n[System: Auto-completed due to deadline pass]')
        WHERE plan_id = ? AND status != 'completed'
      `;
      db.query(query, [planId], (error, results) => {
        if (error) {
          console.error(`Error auto-completing plan ${planId}:`, error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  static shouldSendDeadlineNotification(daysUntilDeadline) {
    // Send notifications for:
    // - Overdue plans (negative days)
    // - Plans due today (0 days)
    // - Plans due in 1 day
    // - Plans due in 3 days
    // - Plans due in 7 days
    return daysUntilDeadline <= 0 ||
      daysUntilDeadline === 1 ||
      daysUntilDeadline === 3 ||
      daysUntilDeadline === 7;
  }

  static async checkIfNotificationSentToday(planId, notificationType) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE plan_id = ? 
        AND type = ? 
        AND DATE(created_at) = CURDATE()
      `;

      db.query(query, [planId, notificationType], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0].count > 0);
        }
      });
    });
  }

  // Manual trigger for testing
  static async triggerDeadlineCheck() {
    console.log('🔧 Manually triggering deadline check...');
    await this.checkDeadlines();
  }
}

module.exports = DeadlineScheduler;
