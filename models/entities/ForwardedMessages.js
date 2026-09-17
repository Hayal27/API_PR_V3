const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ForwardedMessages = sequelize.define('ForwardedMessages', {
  forward_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  original_message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  forwarded_message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  forwarded_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  forwarded_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'forwarded_messages',
  timestamps: false,
});

module.exports = ForwardedMessages;
