const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RiskFlags = sequelize.define('RiskFlags', {
  risk_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  action_plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  risk_level: {
    type: DataTypes.ENUM('critical','high','medium','low'),
    allowNull: false,
    defaultValue: "medium",
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mitigation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  escalation_target: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('open','monitoring','resolved'),
    allowNull: true,
    defaultValue: "open",
  },
  reported_by: {
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
  tableName: 'risk_flags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = RiskFlags;
