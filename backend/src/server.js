require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 5000;

// Stocker le io dans app pour l'utiliser dans les routes
app.io = io;

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
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// servir index.html pour les routes non-API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/client/index.html'));
});

// servir index.html admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/admin/index.html'));
});

// Socket.io connections
io.on('connection', (socket) => {
  console.log('Nouveau client connecté:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
  
  // Événement pour notifier une nouvelle commande
  socket.on('new_order', (data) => {
    io.emit('new_order_notification', data);
  });
  
  // Événement pour notifier qu'une commande est en préparation
  socket.on('order_preparing', (data) => {
    io.emit('order_preparing_notification', data);
  });
  
  // Événement pour notifier qu'une commande est servie
  socket.on('order_served', (data) => {
    io.emit('order_served_notification', data);
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Serveur lancé sur http://localhost:${PORT}`);
});

