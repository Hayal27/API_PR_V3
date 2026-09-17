const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Users = sequelize.define('Users', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('1','0'),
    allowNull: true,
    defaultValue: "1",
  },
  online_flag: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  password_changed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_password_change: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Users;
