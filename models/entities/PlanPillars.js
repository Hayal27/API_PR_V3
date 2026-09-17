const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PlanPillars = sequelize.define('PlanPillars', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "10",
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
  tableName: 'plan_pillars',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = PlanPillars;
