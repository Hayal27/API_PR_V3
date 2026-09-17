const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MessageAttachments = sequelize.define('MessageAttachments', {
  attachment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'message_attachments',
  timestamps: false,
});

module.exports = MessageAttachments;
