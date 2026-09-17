const { Sequelize } = require('sequelize');
require('dotenv').config();

let rawHost = (process.env.DB_HOST || '127.0.0.1').trim();
if (!rawHost || rawHost === 'localhost' || rawHost === '.' || rawHost === 'localhost.' || rawHost.startsWith('.')) {
  rawHost = '127.0.0.1';
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'itpr',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: rawHost,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 25,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: false,
      freezeTableName: true,
      underscored: false,
    },
  }
);

module.exports = {
  sequelize,
  Sequelize,
};
