const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Messages = sequelize.define('Messages', {
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  message_type: {
    type: DataTypes.ENUM('text','image','file','system','plan'),
    allowNull: true,
    defaultValue: "text",
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_edited: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  edited_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_deleted: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  parent_message_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reaction_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'messages',
  timestamps: false,
});

module.exports = Messages;
