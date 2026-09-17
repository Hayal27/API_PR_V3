const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MeetingReminders = sequelize.define('MeetingReminders', {
  reminder_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reminder_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reminder_type: {
    type: DataTypes.ENUM('email','notification','both'),
    allowNull: true,
    defaultValue: "both",
  },
  sent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'meeting_reminders',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = MeetingReminders;
