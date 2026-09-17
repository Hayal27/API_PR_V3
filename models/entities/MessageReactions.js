const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MessageReactions = sequelize.define('MessageReactions', {
  reaction_id: {
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
  emoji: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'message_reactions',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = MessageReactions;
