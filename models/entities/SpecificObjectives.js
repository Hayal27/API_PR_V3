const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SpecificObjectives = sequelize.define('SpecificObjectives', {
  specific_objective_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  objective_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  specific_objective_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  baseline: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  plan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  measurement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  execution_percentage: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
    defaultValue: "0.00",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  deadline_quarter: {
    type: DataTypes.ENUM('Q1','Q2','Q3','Q4'),
    allowNull: false,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  progress: {
    type: DataTypes.ENUM('started','on going','completed'),
    allowNull: false,
    defaultValue: "started",
  },
  income_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cost_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  view: {
    type: DataTypes.ENUM('የፋይናንስ ዕይታ','የተገልጋይ ዕይታ','የውስጥ አሰራር ዕይታ','የመማማርና ዕድገት ዕይታ'),
    allowNull: true,
  },
  org_node_ids: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  supportive_org_node_ids: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  weight: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
    defaultValue: "100.00",
  },
  plan_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: "general",
  },
}, {
  tableName: 'specific_objectives',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SpecificObjectives;
