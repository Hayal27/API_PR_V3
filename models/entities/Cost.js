const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Cost = sequelize.define('Cost', {
  cost_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  cost_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  cost_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  exchange: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: false,
  },
}, {
  tableName: 'cost',
  timestamps: false,
});

module.exports = Cost;
