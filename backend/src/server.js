require('dotenv').config();
const express = require('express');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    const res = await pool.query('SELECT NOW() AS heure');
    console.log('✅ PostgreSQL prêt — Heure DB :', res.rows[0].heure);
  } catch (err) {
    console.error('❌ PostgreSQL indisponible :', err.message);
    process.exit(1); // stop serveur si DB KO
  }
})();

app.get('/', (req, res) => {
  res.send('API Restaurant OK');
});

app.listen(PORT, () => {
  console.log(`🌐 Serveur lancé sur http://localhost:${PORT}`);
});

