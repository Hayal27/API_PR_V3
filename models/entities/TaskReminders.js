const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TaskReminders = sequelize.define('TaskReminders', {
  reminder_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reminder_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reminder_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "notification",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'task_reminders',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = TaskReminders;
