const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ActionPlanQuarterActivations = sequelize.define('ActionPlanQuarterActivations', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  specific_objective_detail_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quarter: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  is_active: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'action_plan_quarter_activations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ActionPlanQuarterActivations;
