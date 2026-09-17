const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const TaskAssignments = sequelize.define('TaskAssignments', {
  assignment_id: {
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
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priority: {
    type: DataTypes.ENUM('low','medium','high','urgent'),
    allowNull: false,
    defaultValue: "medium",
  },
  status: {
    type: DataTypes.ENUM('pending','in_progress','completed','confirmed','rejected'),
    allowNull: false,
    defaultValue: "pending",
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: "general",
  },
  attachment: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  completion_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
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
  tableName: 'task_assignments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = TaskAssignments;
