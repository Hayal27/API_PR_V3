const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const UserPresence = sequelize.define('UserPresence', {
  presence_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  is_online: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: "0",
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('online','away','offline','do_not_disturb'),
    allowNull: true,
    defaultValue: "offline",
  },
}, {
  tableName: 'user_presence',
  timestamps: false,
});

module.exports = UserPresence;
