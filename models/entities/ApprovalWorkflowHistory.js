const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ApprovalWorkflowHistory = sequelize.define('ApprovalWorkflowHistory', {
  history_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approver_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  approver_role: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending','Approved','Declined'),
    allowNull: false,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  action_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  step_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_current_step: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  created_by_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_by_name: {
    type: DataTypes.STRING(255),
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
  tableName: 'approval_workflow_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ApprovalWorkflowHistory;
