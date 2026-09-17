const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DataQualityChecks = sequelize.define('DataQualityChecks', {
  check_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  action_plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reporting_period: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  is_valid: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  is_reliable: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  is_timely: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  is_complete: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  is_accurate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  is_integral: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  supervisor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  supervisor_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  signed_off_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'data_quality_checks',
  timestamps: false,
});

module.exports = DataQualityChecks;
