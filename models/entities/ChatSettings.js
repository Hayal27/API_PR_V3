const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ChatSettings = sequelize.define('ChatSettings', {
  setting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  notification_enabled: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
  },
  sound_enabled: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
  },
  desktop_notifications: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
  },
  message_preview: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "1",
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
  tableName: 'chat_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ChatSettings;
