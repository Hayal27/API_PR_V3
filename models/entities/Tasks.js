const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Tasks = sequelize.define('Tasks', {
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priority: {
    type: DataTypes.ENUM('low','medium','high'),
    allowNull: true,
    defaultValue: "medium",
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "general",
  },
  tags: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending','in_progress','completed'),
    allowNull: true,
    defaultValue: "pending",
  },
  completed_subtasks: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  total_subtasks: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  tableName: 'tasks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Tasks;
