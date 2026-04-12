#!/usr/bin/env node

/**
 * Script de détection d'IP
 * Affiche toutes les interfaces réseau disponibles
 * et aide à identifier la bonne IP pour le serveur
 */

const os = require('os');

console.log('\n' + '='.repeat(70));
console.log('🔍 Détecteur d\'Adresses IP Réseau');
console.log('='.repeat(70) + '\n');

const interfaces = os.networkInterfaces();
let count = 0;

for (const name of Object.keys(interfaces)) {
  console.log(`\n📡 Interface: ${name}`);
  console.log('   ' + '-'.repeat(50));
  
  for (const iface of interfaces[name]) {
    const icon = iface.family === 'IPv4' ? '🔹' : '🔹';
    const internal = iface.internal ? ' (loopback - LOCAL)' : '';
    
    console.log(`   ${icon} ${iface.family}: ${iface.address}${internal}`);
    
    // Marquer les IPs utiles
    if (iface.family === 'IPv4' && !iface.internal) {
      count++;
      console.log(`      ✓ Cette IP peut être utilisée pour le réseau!`);
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('📋 Résumé:');
console.log('='.repeat(70));

// Obtenir la première IPv4 non-loopback
let selectedIP = null;
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      selectedIP = iface.address;
      break;
    }
  }
  if (selectedIP) break;
}

console.log(`\n✅ IP sélectionnée par défaut: ${selectedIP || 'Aucune trouvée'}`);

if (count > 1) {
  console.log(`\n⚠️  ${count} adresses IPv4 trouvées!`);
  console.log(`\nSi ce n'est pas la bonne, vous pouvez:

Option 1: Définir manuellement dans un fichier .env
  Créez un fichier .env et ajoutez:
  SERVER_IP=192.168.x.x

Option 2: Passer par variable d'environnement
  SET SERVER_IP=192.168.x.x && npm start  (Windows)
  OR
  SERVER_IP=192.168.x.x npm start  (Linux/Mac)
`);
}

console.log('\n💡 Conseil:');
console.log('   Si vous connectez via WiFi, cherchez "WiFi", "wlan" ou "en0/en1"');
console.log('   Si vous connectez via Ethernet, cherchez "eth" ou "Ethernet"\n');

console.log('='.repeat(70) + '\n');
