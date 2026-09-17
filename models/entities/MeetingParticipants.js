const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const MeetingParticipants = sequelize.define('MeetingParticipants', {
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('organizer','required','optional'),
    allowNull: true,
    defaultValue: "required",
  },
  response_status: {
    type: DataTypes.ENUM('pending','accepted','declined','tentative'),
    allowNull: true,
    defaultValue: "pending",
  },
  attended: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  email_sent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  reminder_sent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  left_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'meeting_participants',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = MeetingParticipants;
