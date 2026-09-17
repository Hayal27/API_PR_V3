const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const KpiQuarterActivations = sequelize.define('KpiQuarterActivations', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  specific_objective_id: {
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
  tableName: 'kpi_quarter_activations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = KpiQuarterActivations;
