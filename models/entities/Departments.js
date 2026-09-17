const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Departments = sequelize.define('Departments', {
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
}, {
  tableName: 'departments',
  timestamps: false,
});

module.exports = Departments;
