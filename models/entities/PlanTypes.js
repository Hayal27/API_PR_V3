const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PlanTypes = sequelize.define('PlanTypes', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  value: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  label_en: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: "bg-gray-50 text-gray-700 border-gray-200",
  },
  is_default: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "100",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  field_config: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'plan_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = PlanTypes;
