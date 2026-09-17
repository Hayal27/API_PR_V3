const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PlanApprovalSteps = sequelize.define('PlanApprovalSteps', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  step_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  org_node_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  org_node_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  approver_employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approver_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending','Approved','Declined','Skipped'),
    allowNull: true,
    defaultValue: "Pending",
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'plan_approval_steps',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = PlanApprovalSteps;
