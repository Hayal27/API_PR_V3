const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MeetingAttachments = sequelize.define('MeetingAttachments', {
  attachment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  meeting_id: {
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
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  tableName: 'meeting_attachments',
  timestamps: false,
});

module.exports = MeetingAttachments;
