const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ChatParticipants = sequelize.define('ChatParticipants', {
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  last_read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  is_admin: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  is_muted: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
}, {
  tableName: 'chat_participants',
  timestamps: false,
});

module.exports = ChatParticipants;
