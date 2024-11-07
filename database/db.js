require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  // host: process.env.DB_HOST,
  // ssl: true,
  // port: process.env.DB_PORT,
  // user: process.env.DB_USER,
  // database: process.env.DB_DATABASE,
  // password: process.env.DB_PASSWORD,
  // dialect: 'postgres'
  connectionString: process.env.DB_CONNECTION_STRING
});

pool.connect();

module.exports = pool;