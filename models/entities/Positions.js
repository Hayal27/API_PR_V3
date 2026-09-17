const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Positions = sequelize.define('Positions', {
  position_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'positions',
  timestamps: true,
  createdAt: 'created_at',
});

module.exports = Positions;
