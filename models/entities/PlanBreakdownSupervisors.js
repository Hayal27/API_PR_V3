const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PlanBreakdownSupervisors = sequelize.define('PlanBreakdownSupervisors', {
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
  supervisor_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'plan_breakdown_supervisors',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = PlanBreakdownSupervisors;
