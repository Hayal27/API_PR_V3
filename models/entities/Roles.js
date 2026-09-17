const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Roles = sequelize.define('Roles', {
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  role_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  hierarchy_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
  },
}, {
  tableName: 'roles',
  timestamps: false,
});

module.exports = Roles;
