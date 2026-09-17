const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Evaluations = sequelize.define('Evaluations', {
  evaluation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.ENUM('mid_term','annual','thematic'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  timing: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  key_questions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  led_by: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('planned','in_progress','completed'),
    allowNull: true,
    defaultValue: "planned",
  },
  findings: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  period_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'evaluations',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = Evaluations;
