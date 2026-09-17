const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Employees = sequelize.define('Employees', {
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  supervisor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fname: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  lname: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  sex: {
    type: DataTypes.ENUM('M','F'),
    allowNull: true,
  },
  telegram_username: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  telegram_chat_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  position: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'employees',
  timestamps: false,
});

module.exports = Employees;
