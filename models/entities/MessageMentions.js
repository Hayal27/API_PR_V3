const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MessageMentions = sequelize.define('MessageMentions', {
  mention_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mentioned_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'message_mentions',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = MessageMentions;
