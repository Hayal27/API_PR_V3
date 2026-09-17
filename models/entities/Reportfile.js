const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Reportfile = sequelize.define('Reportfile', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  specific_objective_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  file_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  uploaded_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'reportfile',
  timestamps: false,
});

module.exports = Reportfile;
