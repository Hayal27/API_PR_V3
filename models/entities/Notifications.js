const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Notifications = sequelize.define('Notifications', {
  notification_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('comment','reply','status_change','deadline_alert','plan_update','meeting','task','message'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_read: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  priority: {
    type: DataTypes.ENUM('low','medium','high','urgent'),
    allowNull: true,
    defaultValue: "medium",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = Notifications;
