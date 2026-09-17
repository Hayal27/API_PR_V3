const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MeetingMinutes = sequelize.define('MeetingMinutes', {
  minute_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  action_items: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  decisions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  next_steps: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recorded_by: {
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
}, {
  tableName: 'meeting_minutes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = MeetingMinutes;
