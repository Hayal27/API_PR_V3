const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const WeeklyTaskAssignees = sequelize.define('WeeklyTaskAssignees', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  weekly_task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'weekly_task_assignees',
  timestamps: false,
});

module.exports = WeeklyTaskAssignees;
