const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Approvalhierarchy = sequelize.define('Approvalhierarchy', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  next_role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'approvalhierarchy',
  timestamps: false,
});

module.exports = Approvalhierarchy;
