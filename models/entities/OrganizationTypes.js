const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const OrganizationTypes = sequelize.define('OrganizationTypes', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: "from-gray-600 to-gray-700",
  },
  level_order: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'organization_types',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = OrganizationTypes;
