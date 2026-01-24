// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // Pour développement, front peut se connecter
});

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('🚀 Backend Restaurant QR fonctionnel !');
});

// Socket.IO pour notifications temps réel
io.on('connection', (socket) => {
  console.log('⚡ Client connecté :', socket.id);

  socket.on('disconnect', () => {
    console.log('⚡ Client déconnecté :', socket.id);
  });
});

// Exemple : envoyer notification
// io.emit('newOrder', { orderId: 123, table: 5 });

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🌐 Serveur lancé sur http://localhost:${PORT}`);
});
