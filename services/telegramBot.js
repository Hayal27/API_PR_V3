const { Telegraf } = require('telegraf');
const con = require('../models/db');
const util = require('util');

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (token && token !== "YOUR_BOT_TOKEN_HERE") {
    bot = new Telegraf(token);
    const query = util.promisify(con.query).bind(con);

    bot.start(async (ctx) => {
        const username = ctx.from.username;
        const chatId = ctx.chat.id;

        if (!username) {
            return ctx.reply("❌ Your Telegram account does not have a username. Please set one in Telegram settings and update it in the ITPR system.");
        }

        try {
            // Normalize and search for multiple variants
            const cleanUsername = username.replace(/^@/, '');
            const variants = [
                cleanUsername,
                `@${cleanUsername}`,
                `https://t.me/${cleanUsername}`,
                `https://t.me/${cleanUsername}/` // Handle optional trailing slash
            ];

            const employees = await query(
                "SELECT employee_id, name FROM employees WHERE telegram_username IN (?, ?, ?, ?)",
                variants
            );

            if (employees.length > 0) {
                const employee = employees[0];
                await query(
                    "UPDATE employees SET telegram_chat_id = ? WHERE employee_id = ?",
                    [chatId, employee.employee_id]
                );

                ctx.reply(`✅ Hello ${employee.name}! Your Telegram account has been successfully linked to the ITPR system. You will now receive real-time notifications here.`);
            } else {
                ctx.reply(`❌ I couldn't find an employee with the Telegram username "@${username}" in our system.\n\nPlease ensure your Telegram username is correctly entered in your ITPR profile using the Update User form.`);
            }
        } catch (error) {
            console.error("Telegram Bot Error:", error);
            ctx.reply("⚠️ An error occurred while linking your account. Please try again later.");
        }
    });

    bot.launch()
        .then(() => console.log('✅ Telegram Bot started'))
        .catch(err => console.error('❌ Telegram Bot failed to start:', err.message));

    // Graceful stop — wrapped in try/catch to prevent Windows libuv signal assertion crash
    const stopBot = (signal) => {
        try { bot.stop(signal); } catch (e) { /* suppress Windows signal assertion errors */ }
    };
    try { process.once('SIGINT',  () => stopBot('SIGINT'));  } catch (e) {}
    try { process.once('SIGTERM', () => stopBot('SIGTERM')); } catch (e) {}
} else {
    console.warn('⚠️ Telegram Bot Token not found or invalid in .env. Telegram notifications will be disabled.');
}

module.exports = bot;
