// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Test connexion
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erreur connexion PostgreSQL', err.stack);
  }
  console.log('✅ Connecté à PostgreSQL');
  release();
});

module.exports = pool;
