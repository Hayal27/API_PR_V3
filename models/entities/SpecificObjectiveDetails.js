const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SpecificObjectiveDetails = sequelize.define('SpecificObjectiveDetails', {
  specific_objective_detail_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  specific_objective_detailname: {
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
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  day: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
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
  description: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  outcome: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  progress: {
    type: DataTypes.ENUM('started','on going','completed'),
    allowNull: false,
    defaultValue: "started",
  },
  created_by: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  specific_objective_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  plan_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  income_exchange: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  cost_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  employment_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  incomeName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  costName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  CIbaseline: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  CIplan: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  CIoutcome: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  CIexecution_percentage: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  editing_status: {
    type: DataTypes.ENUM('active','deactivate'),
    allowNull: false,
    defaultValue: "active",
  },
  reporting: {
    type: DataTypes.ENUM('active','deactivate'),
    allowNull: false,
    defaultValue: "active",
  },
  goal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  project_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  income_plan_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  employee_of: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  weight: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
    defaultValue: "0.00",
  },
  starting_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'specific_objective_details',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SpecificObjectiveDetails;
