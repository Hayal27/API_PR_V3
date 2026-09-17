const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MonthlyTaskAssignees = sequelize.define('MonthlyTaskAssignees', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  monthly_task_id: {
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
  tableName: 'monthly_task_assignees',
  timestamps: false,
});

module.exports = MonthlyTaskAssignees;
