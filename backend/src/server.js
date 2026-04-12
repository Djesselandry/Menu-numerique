require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const os = require('os');
const { Server } = require('socket.io');
const pool = require('./config/db');
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const tableRoutes = require('./routes/tableRoutes');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 5000;

// Fonction pour obtenir l'adresse IP locale avec amélioration intelligente
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const realInterfaces = [];
  const virtualInterfaces = [];
  
  // Interfaces virtuelles EXCLUES (VirtualBox, Docker, VPN, etc)
  const blocklist = ['vEthernet', 'docker', 'vbox', 'virtualbox', 'lo', 'tun', 'tap', 'br-', 'veth', 'ovs-', 'vnet'];
  
  // Collecter les interfaces réelles (exclure les virtuelles)
  for (const name of Object.keys(interfaces)) {
    // Vérifier si c'est une interface virtuelle CONNUE
    const isVirtual = blocklist.some(v => name.toLowerCase().includes(v.toLowerCase()));
    if (isVirtual) {
      virtualInterfaces.push(name);
      continue;
    }
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Exclure aussi les plages IP typiques de VirtualBox
        if (iface.address.startsWith('192.168.10.') || iface.address.startsWith('172.17.')) {
          virtualInterfaces.push(`${name} (${iface.address})`);
          continue;
        }
        
        realInterfaces.push({
          name: name,
          address: iface.address,
          mac: iface.mac
        });
      }
    }
  }
  
  // Chercher d'abord WiFi ou Ethernet
  const priorityOrder = ['WiFi', 'wlan', 'Ethernet', 'eth', 'en', 'wlo'];
  
  for (const priority of priorityOrder) {
    const match = realInterfaces.find(ip => ip.name.toLowerCase().includes(priority.toLowerCase()));
    if (match) {
      console.log(`\n✅ Carte WiFi/Ethernet détectée: ${match.name} → ${match.address}\n`);
      if (virtualInterfaces.length > 0) {
        console.log(`⚠️  Interfaces virtuelles ignorées: ${virtualInterfaces.join(', ')}\n`);
      }
      return match.address;
    }
  }
  
  // Sinon, retourner la première vraie interface trouvée
  if (realInterfaces.length > 0) {
    console.log(`\n✅ Interface réseau détectée: ${realInterfaces[0].name} → ${realInterfaces[0].address}\n`);
    return realInterfaces[0].address;
  }
  
  // Si AUCUNE interface réelle trouvée, afficher erreur
  if (virtualInterfaces.length > 0) {
    console.log(`\n❌ ERREUR: Seules des interfaces virtuelles trouvées (VirtualBox, Docker...)`);
    console.log(`   Interfaces rejetées: ${virtualInterfaces.join(', ')}\n`);
  }
  
  // Fallback
  return '127.0.0.1';
}
 
// NOTE: Local IP is now detected DYNAMICALLY in the /api/config endpoint
// Do NOT set these as constants here - they would be fixed at startup
// Only detect once at startup for logging purposes

// Option: Force une IP spécifique via variable d'environnement
// SET SERVER_IP=192.168.x.x && npm start
const STARTUP_IP = process.env.SERVER_IP || getLocalIPAddress();
const STARTUP_URL = `http://${STARTUP_IP}:${PORT}`;

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
// servir le frontend client sur root ET sur /client
app.use(express.static(path.join(__dirname, '../../frontend/client')));
app.use("/client", express.static(path.join(__dirname, '../../frontend/client')));
// servir le frontend admin
app.use("/admin", express.static(path.join(__dirname, '../../frontend/admin')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);

// Configuration endpoint - pour obtenir l'IP locale DYNAMIQUEMENT
app.get('/api/config', (req, res) => {
  // Utiliser SERVER_IP si défini, sinon détecter automatiquement
  const currentIP = process.env.SERVER_IP || getLocalIPAddress();
  const apiUrl = `http://${currentIP}:${PORT}`;
  
  res.json({
    api_url: apiUrl,
    local_ip: currentIP,
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    ip_source: process.env.SERVER_IP ? 'manual (SERVER_IP env var)' : 'auto-detected'
  });
});

// servir index.html pour les routes non-API
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/client/index.html'));
});

// servir la page client via /client (depuis le QR code)
app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/client/index.html'));
});

// servir la page de configuration/setup QR
app.get('/qr_setup', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/client/qr_setup.html'));
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

// Écouter sur 0.0.0.0 pour accepter les connexions du réseau local
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 Serveur Restaurant lancé!');
  console.log('='.repeat(70));
  console.log(`📍 Adresse IP locale: ${STARTUP_IP}`);
  console.log(`🌐 URL locale: ${STARTUP_URL}`);
  console.log(`📱 Port: ${PORT}`);
  console.log(`🔗 Admin: ${STARTUP_URL}/admin`);
  console.log(`📋 Client: ${STARTUP_URL}/client`);
  console.log('='.repeat(70) + '\n');
  console.log('💡 Utilisez cette adresse IP pour configurer votre réseau local:');
  console.log(`   http://${STARTUP_IP}:${PORT}\n`);
});

