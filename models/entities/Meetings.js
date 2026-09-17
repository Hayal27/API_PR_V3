const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Meetings = sequelize.define('Meetings', {
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  meeting_type: {
    type: DataTypes.ENUM('one-on-one','team','department','company-wide','client','other'),
    allowNull: true,
    defaultValue: "team",
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  meeting_link: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  zoom_meeting_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  zoom_passcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('scheduled','in-progress','completed','cancelled','rescheduled'),
    allowNull: true,
    defaultValue: "scheduled",
  },
  priority: {
    type: DataTypes.ENUM('low','medium','high','urgent'),
    allowNull: true,
    defaultValue: "medium",
  },
  is_recurring: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  recurrence_pattern: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  reminder_sent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  agenda: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'meetings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Meetings;
