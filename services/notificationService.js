const db = require('../models/db');
const telegramService = require('./telegramService');
const util = require('util');

class NotificationService {
  // Create a new notification
  static async createNotification({
    user_id,
    plan_id = null,
    type,
    title,
    message,
    data = null,
    priority = 'medium',
    expires_at = null
  }) {
    // Send Telegram Notification in background
    this.sendTelegramNotification(user_id, title, message, type).catch(err => 
      console.error(`Telegram notification failed for user ${user_id}:`, err.message)
    );

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO notifications 
        (user_id, plan_id, type, title, message, data, priority, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        user_id,
        plan_id,
        type,
        title,
        message,
        data ? JSON.stringify(data) : null,
        priority,
        expires_at
      ];

      db.query(query, values, (error, results) => {
        if (error) {
          console.error('Error creating notification:', error);
          reject(error);
        } else {
          console.log(`✅ Notification created for user ${user_id}: ${title}`);
          resolve(results.insertId);
        }
      });
    });
  }

  // Create comment notification
  static async createCommentNotification(commentData, planData) {
    try {
      // Get plan owner and supervisors to notify
      const usersToNotify = await this.getUsersToNotifyForPlan(planData.plan_id, commentData.user_id);
      
      const notifications = usersToNotify.map(userId => 
        this.createNotification({
          user_id: userId,
          plan_id: planData.plan_id,
          type: 'comment',
          title: 'New Comment on Your Plan',
          message: `${commentData.user_name} commented on plan "${planData.goal_name}": ${commentData.comment_text.substring(0, 100)}${commentData.comment_text.length > 100 ? '...' : ''}`,
          data: {
            comment_id: commentData.comment_id,
            commenter_name: commentData.user_name,
            plan_name: planData.goal_name,
            comment_preview: commentData.comment_text.substring(0, 200)
          },
          priority: 'medium'
        })
      );

      await Promise.all(notifications);
    } catch (error) {
      console.error('Error creating comment notifications:', error);
    }
  }

  // Create reply notification
  static async createReplyNotification(replyData, parentCommentData, planData) {
    try {
      // Notify the parent comment author (if different from reply author)
      if (parentCommentData.user_id !== replyData.user_id) {
        await this.createNotification({
          user_id: parentCommentData.user_id,
          plan_id: planData.plan_id,
          type: 'reply',
          title: 'New Reply to Your Comment',
          message: `${replyData.user_name} replied to your comment on plan "${planData.goal_name}": ${replyData.comment_text.substring(0, 100)}${replyData.comment_text.length > 100 ? '...' : ''}`,
          data: {
            reply_id: replyData.comment_id,
            parent_comment_id: parentCommentData.comment_id,
            replier_name: replyData.user_name,
            plan_name: planData.goal_name,
            reply_preview: replyData.comment_text.substring(0, 200)
          },
          priority: 'medium'
        });
      }

      // Also notify other stakeholders (plan owner, supervisors) except the reply author
      const usersToNotify = await this.getUsersToNotifyForPlan(planData.plan_id, replyData.user_id);
      const otherNotifications = usersToNotify
        .filter(userId => userId !== parentCommentData.user_id) // Don't duplicate notification
        .map(userId => 
          this.createNotification({
            user_id: userId,
            plan_id: planData.plan_id,
            type: 'reply',
            title: 'New Reply on Plan Discussion',
            message: `${replyData.user_name} replied in the discussion for plan "${planData.goal_name}"`,
            data: {
              reply_id: replyData.comment_id,
              parent_comment_id: parentCommentData.comment_id,
              replier_name: replyData.user_name,
              plan_name: planData.goal_name,
              reply_preview: replyData.comment_text.substring(0, 200)
            },
            priority: 'low'
          })
        );

      await Promise.all(otherNotifications);
    } catch (error) {
      console.error('Error creating reply notifications:', error);
    }
  }

  // Create status change notification
  static async createStatusChangeNotification(planData, oldStatus, newStatus, changedBy) {
    try {
      const usersToNotify = await this.getUsersToNotifyForPlan(planData.plan_id);
      
      const priority = this.getStatusChangePriority(newStatus);
      const notifications = usersToNotify.map(userId => 
        this.createNotification({
          user_id: userId,
          plan_id: planData.plan_id,
          type: 'status_change',
          title: `Plan Status Changed: ${newStatus}`,
          message: `Plan "${planData.goal_name}" status changed from "${oldStatus}" to "${newStatus}" by ${changedBy}`,
          data: {
            old_status: oldStatus,
            new_status: newStatus,
            changed_by: changedBy,
            plan_name: planData.goal_name
          },
          priority: priority
        })
      );

      await Promise.all(notifications);
    } catch (error) {
      console.error('Error creating status change notifications:', error);
    }
  }

  // Create deadline alert notification
  static async createDeadlineAlertNotification(planData, daysUntilDeadline) {
    try {
      const usersToNotify = await this.getUsersToNotifyForPlan(planData.plan_id);
      
      const priority = daysUntilDeadline <= 1 ? 'urgent' : daysUntilDeadline <= 3 ? 'high' : 'medium';
      const title = daysUntilDeadline <= 0 ? 'Plan Deadline Passed!' : `Plan Deadline Alert: ${daysUntilDeadline} days remaining`;
      const message = daysUntilDeadline <= 0 
        ? `Plan "${planData.goal_name}" deadline has passed. Immediate action required.`
        : `Plan "${planData.goal_name}" deadline is approaching in ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}. Please review and take necessary action.`;

      const notifications = usersToNotify.map(userId => 
        this.createNotification({
          user_id: userId,
          plan_id: planData.plan_id,
          type: 'deadline_alert',
          title: title,
          message: message,
          data: {
            deadline: planData.deadline,
            days_until_deadline: daysUntilDeadline,
            plan_name: planData.goal_name,
            execution_percentage: planData.execution_percentage || 0
          },
          priority: priority,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in 7 days
        })
      );

      await Promise.all(notifications);
    } catch (error) {
      console.error('Error creating deadline alert notifications:', error);
    }
  }

  // Get users to notify for a plan (plan owner, supervisors, etc.)
  static async getUsersToNotifyForPlan(planId, excludeUserId = null) {
    return new Promise((resolve, reject) => {
      // Get plan owner, current approver, and all approvers in the hierarchy steps
      const query = `
        SELECT DISTINCT u.user_id
        FROM users u
        WHERE u.user_id IN (
          SELECT user_id FROM plans WHERE plan_id = ?
          UNION
          SELECT u2.user_id FROM approvalworkflow aw 
          JOIN users u2 ON aw.approver_id = u2.employee_id 
          WHERE aw.plan_id = ?
          UNION
          SELECT u3.user_id FROM plan_approval_steps pas
          JOIN users u3 ON pas.approver_employee_id = u3.employee_id
          WHERE pas.plan_id = ?
        )
        ${excludeUserId ? 'AND u.user_id != ?' : ''}
      `;

      const params = [planId, planId, planId];
      if (excludeUserId) params.push(excludeUserId);

      db.query(query, params, (error, results) => {
        if (error) {
          console.error('Error fetching users to notify:', error);
          reject(error);
        } else {
          const userIds = results.map(row => row.user_id);
          resolve(userIds);
        }
      });
    });
  }

  // Get status change priority
  static getStatusChangePriority(status) {
    switch (status.toLowerCase()) {
      case 'approved': return 'high';
      case 'declined': return 'high';
      case 'pending': return 'medium';
      case 'in progress': return 'medium';
      default: return 'low';
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId, limit = 50, offset = 0, unreadOnly = false) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          n.*,
          p.goal_id,
          p.user_id as plan_creator_id,
          g.name as plan_name,
          CASE WHEN p.user_id = ? THEN 1 ELSE 0 END as is_creator
        FROM notifications n
        LEFT JOIN plans p ON n.plan_id = p.plan_id
        LEFT JOIN goals g ON p.goal_id = g.goal_id
        WHERE n.user_id = ?
      `;
      
      if (unreadOnly) {
        query += ' AND n.is_read = 0';
      }
      
      query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';

      db.query(query, [userId, userId, limit, offset], (error, results) => {
        if (error) {
          reject(error);
        } else {
          try {
            // Parse JSON data field safely and add is_creator to data
            const notifications = (results || []).map(notification => {
              let parsedData = {};
              if (notification.data) {
                try {
                  parsedData = typeof notification.data === 'string'
                    ? JSON.parse(notification.data)
                    : notification.data;
                } catch (parseErr) {
                  console.error(`⚠️ Error parsing data for notification_id ${notification.notification_id}:`, parseErr.message);
                  parsedData = {};
                }
              }
              return {
                ...notification,
                data: {
                  ...parsedData,
                  is_creator: notification.is_creator
                }
              };
            });
            resolve(notifications);
          } catch (err) {
            console.error('Error processing notifications:', err);
            reject(err);
          }
        }
      });
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP 
        WHERE notification_id = ? AND user_id = ?
      `;

      db.query(query, [notificationId, userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows > 0);
        }
      });
    });
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE notifications 
        SET is_read = 1, read_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND is_read = 0
      `;

      db.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.affectedRows);
        }
      });
    });
  }

  // Get unread notification count
  static async getUnreadCount(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0';

      db.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          try {
            resolve(results && results.length > 0 ? (results[0].count || 0) : 0);
          } catch (err) {
            reject(err);
          }
        }
      });
    });
  }

  // Delete old notifications (cleanup)
  static async cleanupOldNotifications(daysOld = 30) {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM notifications 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        OR (expires_at IS NOT NULL AND expires_at < NOW())
      `;

      db.query(query, [daysOld], (error, results) => {
        if (error) {
          reject(error);
        } else {
          console.log(`🧹 Cleaned up ${results.affectedRows} old notifications`);
          resolve(results.affectedRows);
        }
      });
    });
  }

  // Send Telegram Notification helper
  static async sendTelegramNotification(userId, title, message, type) {
    try {
      const query = util.promisify(db.query).bind(db);
      const results = await query(`
        SELECT e.telegram_chat_id 
        FROM employees e
        JOIN users u ON e.employee_id = u.employee_id
        WHERE u.user_id = ? AND e.telegram_chat_id IS NOT NULL
      `, [userId]);

      if (results.length > 0 && results[0].telegram_chat_id) {
        await telegramService.sendNotification(
          { telegram_chat_id: results[0].telegram_chat_id }, 
          title, 
          message, 
          type
        );
      }
    } catch (error) {
      // Don't throw, just log
      console.error('Error in sendTelegramNotification helper:', error);
    }
  }
}

module.exports = NotificationService;
