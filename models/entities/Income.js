const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Income = sequelize.define('Income', {
  income_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  income_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  income_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  income_exchange_dollar: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
  income_exchange_etb: {
    type: DataTypes.DECIMAL(15, 4),
    allowNull: true,
  },
}, {
  tableName: 'income',
  timestamps: false,
});

module.exports = Income;
