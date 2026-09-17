const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Conversations = sequelize.define('Conversations', {
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  conversation_type: {
    type: DataTypes.ENUM('direct','group','channel'),
    allowNull: true,
    defaultValue: "direct",
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_archived: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'conversations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Conversations;
