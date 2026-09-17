const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Approvalworkflow = sequelize.define('Approvalworkflow', {
  approvalworkflow_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('completed','in progress','Pending','Approved','Declined'),
    allowNull: true,
    defaultValue: "Pending",
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approval_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  report_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  report_status: {
    type: DataTypes.ENUM('Pending','Approved','Declined'),
    allowNull: true,
    defaultValue: "Pending",
  },
  rating: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  comment_writer: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'approvalworkflow',
  timestamps: false,
});

module.exports = Approvalworkflow;
