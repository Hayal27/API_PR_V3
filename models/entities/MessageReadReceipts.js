const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MessageReadReceipts = sequelize.define('MessageReadReceipts', {
  receipt_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'message_read_receipts',
  timestamps: false,
});

module.exports = MessageReadReceipts;
