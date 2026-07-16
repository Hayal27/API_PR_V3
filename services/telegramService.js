const bot = require('./telegramBot');

/**
 * Send a message via Telegram bot
 * @param {number|string} chatId - The Telegram chat ID
 * @param {string} text - The message text (Markdown supported)
 * @param {object} extra - Extra options for Telegraf
 */
const sendMessage = async (chatId, text, extra = {}) => {
    if (!bot) {
        console.warn('⚠️ Telegram Bot not initialized. Skipping message.');
        return false;
    }

    try {
        await bot.telegram.sendMessage(chatId, text, {
            parse_mode: 'Markdown',
            ...extra
        });
        return true;
    } catch (error) {
        console.error(`❌ Error sending Telegram message to ${chatId}:`, error.message);
        return false;
    }
};

/**
 * Format and send a notification message
 * @param {object} employee - Employee object containing telegram_chat_id
 * @param {string} title - Notification title
 * @param {string} message - Notification body
 * @param {string} type - Notification type (e.g., 'plan', 'task', 'meeting')
 */
const sendNotification = async (employee, title, message, type) => {
    if (!employee || !employee.telegram_chat_id) return false;

    let icon = '🔔';
    if (type === 'plan') icon = '📋';
    if (type === 'task') icon = '✅';
    if (type === 'meeting') icon = '📅';
    if (type === 'deadline') icon = '⏰';

    const text = `*${icon} ${title}*\n\n${message}`;

    return await sendMessage(employee.telegram_chat_id, text);
};

module.exports = {
    sendMessage,
    sendNotification
};
