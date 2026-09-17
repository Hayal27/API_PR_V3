const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SystemSettings = sequelize.define('SystemSettings', {
  setting_key: {
    type: DataTypes.STRING(255),
    allowNull: false,
    primaryKey: true,
  },
  setting_value: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'system_settings',
  timestamps: false,
});

module.exports = SystemSettings;
