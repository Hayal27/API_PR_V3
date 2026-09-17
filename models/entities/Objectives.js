const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Objectives = sequelize.define('Objectives', {
  objective_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  quarter: {
    type: DataTypes.STRING(2),
    allowNull: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  goal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  weight: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
    defaultValue: "100",
  },
}, {
  tableName: 'objectives',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Objectives;
