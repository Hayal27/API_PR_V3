const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const SupervisorComments = sequelize.define('SupervisorComments', {
  comment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parent_comment_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  comment_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  comment_type: {
    type: DataTypes.ENUM('comment','reply'),
    allowNull: false,
    defaultValue: "comment",
  },
  is_edited: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'supervisor_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SupervisorComments;
