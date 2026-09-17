const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ReportAttachments = sequelize.define('ReportAttachments', {
  attachment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  report_id: {
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
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'report_attachments',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = ReportAttachments;
