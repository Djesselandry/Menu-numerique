#!/usr/bin/env node

/**
 * Script pour générer les codes QR pour les tables
 * Usage: node generateQRCodes.js [nombre_de_tables] [--ip=adresse_ip]
 * 
 * Exemple:
 *   node generateQRCodes.js 10
 *   node generateQRCodes.js 10 --ip=192.168.1.5
 */

const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Configuration
const API_PORT = process.env.API_PORT || 5000;
let API_HOST = process.env.API_HOST || 'localhost';
let CUSTOM_IP = null;
const TABLES_COUNT = parseInt(process.argv[2]) || 10;

// Parser les arguments
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--ip=')) {
    CUSTOM_IP = process.argv[i].split('=')[1];
  }
}

// Fonction pour obtenir l'adresse IP locale (exclure les interfaces virtuelles)
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  const blocklist = ['vEthernet', 'docker', 'vbox', 'virtualbox', 'lo', 'tun', 'tap', 'br-', 'veth', 'ovs-', 'vnet'];
  
  const realInterfaces = [];
  
  for (const name of Object.keys(interfaces)) {
    const isVirtual = blocklist.some(v => name.toLowerCase().includes(v.toLowerCase()));
    if (isVirtual) continue;
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Exclure aussi les plages IP typiques de VirtualBox
        if (iface.address.startsWith('192.168.10.') || iface.address.startsWith('172.17.')) {
          continue;
        }
        realInterfaces.push({ name, address: iface.address });
      }
    }
  }
  
  // Chercher WiFi ou Ethernet d'abord
  const priorityOrder = ['WiFi', 'wlan', 'Ethernet', 'eth', 'en', 'wlo'];
  for (const priority of priorityOrder) {
    const match = realInterfaces.find(ip => ip.name.toLowerCase().includes(priority.toLowerCase()));
    if (match) return match.address;
  }
  
  return realInterfaces.length > 0 ? realInterfaces[0].address : '127.0.0.1';
}

// Déterminer l'IP à utiliser
const IP_ADDRESS = CUSTOM_IP || getLocalIPAddress();
const BASE_URL = `http://${IP_ADDRESS}:${API_PORT}`;

console.log(`\n🚀 Génération des codes QR pour ${TABLES_COUNT} tables...`);
console.log(`📍 Adresse IP: ${IP_ADDRESS}`);
console.log(`🌐 URL de base: ${BASE_URL}\n`);

async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: IP_ADDRESS,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function generateQRCodes() {
  const results = [];
  const errors = [];

  for (let i = 1; i <= TABLES_COUNT; i++) {
    try {
      console.log(`📱 Génération de la table ${i}...`);
      const response = await makeRequest('POST', `/api/tables/${i}/generate-qr`);

      if (response.status === 200 && response.data.success) {
        const qrData = response.data.table;
        
        results.push({
          table_number: qrData.table_number,
          qr_code: qrData.qr_code,
          client_url: `${BASE_URL}/client/?qr=${qrData.qr_code}`,
          qr_image_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${BASE_URL}/client/?qr=${qrData.qr_code}`)}`
        });

        console.log(`✅ Table ${i}: ${qrData.qr_code}`);
      } else {
        console.log(`❌ Erreur pour la table ${i}`);
        errors.push(i);
      }
    } catch (err) {
      console.log(`❌ Erreur pour la table ${i}: ${err.message}`);
      errors.push(i);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`\nRésumé: ${results.length}/${TABLES_COUNT} tables générées avec succès`);

  if (errors.length > 0) {
    console.log(`❌ Tables avec erreurs: ${errors.join(', ')}`);
  }

  // Sauvegarder les résultats dans un fichier JSON
  const outputFile = path.join(__dirname, 'qr_codes.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\n💾 Données sauvegardées dans: ${outputFile}`);

  // Créer un fichier HTML pour visualiser les codes QR
  const htmlContent = generateHTMLQRPage(results, IP_ADDRESS);
  const htmlFile = path.join(__dirname, 'qr_codes.html');
  fs.writeFileSync(htmlFile, htmlContent);
  console.log(`🌐 Page HTML générée: ${htmlFile}`);

  // Afficher un aperçu
  console.log('\n📋 Aperçu des 3 premières tables:');
  results.slice(0, 3).forEach(result => {
    console.log(`\n  Table ${result.table_number}:`);
    console.log(`    Code QR: ${result.qr_code}`);
    console.log(`    URL Client: ${result.client_url}`);
  });

  if (results.length > 3) {
    console.log(`\n  ... et ${results.length - 3} autres tables`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📖 Instructions:');
  console.log('');
  console.log('1️⃣  Sur un téléphone du réseau local, connectez-vous à:');
  console.log(`    http://${IP_ADDRESS}:${API_PORT}/qr_setup`);
  console.log('');
  console.log('2️⃣  Vous verrez les codes QR à imprimer');
  console.log('');
  console.log('3️⃣  Ou imprimez directement depuis le fichier HTML:');
  console.log(`    ${htmlFile}`);
  console.log('');
  console.log('4️⃣  Testez un QR code en scannant sur le même réseau local');
  console.log('\n' + '='.repeat(70) + '\n');
}

function generateHTMLQRPage(results, ip) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codes QR - Restaurant</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      margin-bottom: 10px;
      color: #333;
    }
    .info {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .qr-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .qr-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
      page-break-inside: avoid;
    }
    .qr-card h2 {
      margin-bottom: 15px;
      color: #f97316;
      font-size: 24px;
    }
    .qr-code {
      margin: 15px 0;
      background: white;
      padding: 10px;
      border-radius: 4px;
    }
    .qr-code img {
      max-width: 100%;
      height: auto;
    }
    .table-number {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      padding: 10px;
      background: #f97316;
      color: white;
      border-radius: 4px;
    }
    .print-button {
      display: block;
      margin: 20px auto;
      padding: 10px 30px;
      background: #f97316;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .print-button:hover {
      background: #e56700;
    }
    @media print {
      body { background: white; }
      .print-button { display: none; }
      .qr-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🍽️ Codes QR - Système de Commande</h1>
    <div class="info">
      <p>Adresse serveur: <strong>http://${ip}</strong></p>
      <p>Imprimez cette page et découpez les codes QR pour les coller sur les tables</p>
    </div>
    
    <button class="print-button" onclick="window.print()">🖨️ Imprimer les codes QR</button>
    
    <div class="qr-grid">
      ${results.map(result => `
        <div class="qr-card">
          <div class="table-number">Table ${result.table_number}</div>
          <div class="qr-code">
            <img src="${result.qr_image_url}" alt="Code QR Table ${result.table_number}">
          </div>
          <small>${result.qr_code}</small>
        </div>
      `).join('')}
    </div>
    
    <button class="print-button" onclick="window.print()">🖨️ Imprimer les codes QR</button>
  </div>
</body>
</html>`;
}

// Vérifier la connexion au serveur
console.log('🔗 Vérification de la connexion au serveur...');
makeRequest('GET', '/api/config')
  .then((response) => {
    if (response.status === 200) {
      console.log('✅ Serveur prêt!\n');
      generateQRCodes();
    } else {
      console.error('❌ Le serveur n\'a pas répondu correctement');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error(`❌ Impossible de se connecter au serveur: ${err.message}`);
    console.error(`   Assurez-vous que le serveur est en cours d'exécution sur ${API_HOST}:${API_PORT}`);
    process.exit(1);
  });
