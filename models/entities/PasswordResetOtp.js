const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const PasswordResetOtp = sequelize.define('PasswordResetOtp', {
  otp_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  otp_code: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  is_used: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'password_reset_otp',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = PasswordResetOtp;
