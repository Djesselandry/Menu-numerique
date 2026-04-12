require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
const os = require('os');
const menuRoutes = require('./routes/menuRoutes');
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

// Stocker l'IP du serveur pour la génération des QR codes
app.locals.serverIP = STARTUP_IP;
app.locals.serverPort = PORT;
app.locals.serverUrl = STARTUP_URL;

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
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);

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

// API Configuration endpoint - Retourne l'IP locale du serveur
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    serverIP: STARTUP_IP,
    port: PORT,
    serverUrl: STARTUP_URL,
    timestamp: new Date().toISOString()
  });
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
  // Récupérer l'adresse IP locale pour faciliter la création des QR codes
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
      }
    });
  });
  console.log(`🌐 Serveur lancé sur http://${localIp}:${PORT}`);
});
  