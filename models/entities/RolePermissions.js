const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const RolePermissions = sequelize.define('RolePermissions', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  menu_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  can_view: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
  },
  can_create: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  can_edit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  can_delete: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = RolePermissions;
