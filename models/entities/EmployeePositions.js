const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const EmployeePositions = sequelize.define('EmployeePositions', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  org_node_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  is_delegation: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  position_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'employee_positions',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = EmployeePositions;
