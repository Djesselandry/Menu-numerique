require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./config/db');
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// rendre uploads accessibles
app.use("/uploads", express.static("uploads"));
// servir le frontend client
app.use(express.static(path.join(__dirname, '../../frontend/client')));
// servir le frontend admin
app.use("/admin", express.static(path.join(__dirname, '../../frontend/admin')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes)

// servir index.html pour les routes non-API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/client/index.html'));
});

// servir index.html admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/admin/index.html'));
});




/*
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
*/
app.listen(PORT, () => {
  console.log(`🌐 Serveur lancé sur http://localhost:${PORT}`);
});

