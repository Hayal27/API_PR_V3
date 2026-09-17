const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const OrganizationStructure = sequelize.define('OrganizationStructure', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  name_amharic: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  head_employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active','inactive'),
    allowNull: true,
    defaultValue: "active",
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
  tableName: 'organization_structure',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = OrganizationStructure;
