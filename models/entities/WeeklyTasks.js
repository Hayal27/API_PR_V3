const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const WeeklyTasks = sequelize.define('WeeklyTasks', {
  weekly_task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  monthly_task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  weight: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
    defaultValue: "0.00",
  },
  plan_amount: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
    defaultValue: "0.00",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  progress: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
    defaultValue: "0.00",
  },
  plan_progress: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
    defaultValue: "0.00",
  },
  status: {
    type: DataTypes.ENUM('Pending','In Progress','Completed'),
    allowNull: false,
    defaultValue: "Pending",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  attachment: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  actual_amount: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'weekly_tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = WeeklyTasks;
