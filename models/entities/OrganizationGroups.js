const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const OrganizationGroups = sequelize.define('OrganizationGroups', {
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  organization_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  group_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  group_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  group_icon: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  tableName: 'organization_groups',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = OrganizationGroups;
