const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Plans = sequelize.define('Plans', {
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  supervisor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  goal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  objective_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  specific_objective_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  specific_objective_detail_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending','Approved'),
    allowNull: false,
    defaultValue: "Pending",
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  report_status: {
    type: DataTypes.ENUM('Pending','Approved','Declined'),
    allowNull: true,
    defaultValue: "Approved",
  },
  department_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  editing_status: {
    type: DataTypes.ENUM('active','deactivate'),
    allowNull: false,
    defaultValue: "deactivate",
  },
  reporting: {
    type: DataTypes.ENUM('active','deactivate'),
    allowNull: false,
    defaultValue: "deactivate",
  },
  report_progress: {
    type: DataTypes.ENUM('on_progress','completed'),
    allowNull: true,
  },
}, {
  tableName: 'plans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Plans;
