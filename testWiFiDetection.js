// Test de détection de la carte WiFi/Ethernet réelle
const os = require('os');

console.log('\n' + '='.repeat(70));
console.log('  TEST DE DÉTECTION DE CARTE RÉSEAU RÉELLE');
console.log('='.repeat(70) + '\n');

const interfaces = os.networkInterfaces();
const blocklist = ['vEthernet', 'docker', 'vbox', 'virtualbox', 'lo', 'tun', 'tap', 'br-', 'veth', 'ovs-', 'vnet'];

console.log('📋 TOUTES les interfaces réseau détectées:\n');

// Afficher tout
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4') {
      const isVirtual = blocklist.some(v => name.toLowerCase().includes(v.toLowerCase()));
      const isBlockedIP = iface.address.startsWith('192.168.10.') || iface.address.startsWith('172.17.');
      const isInternal = iface.internal;
      
      let status = '';
      if (isInternal) status = '🔵 INTERNE (ignorée)';
      else if (isBlockedIP) status = '❌ IP VIRTUELLE (VirtualBox/Docker) - IGNORÉE';
      else if (isVirtual) status = '❌ INTERFACE VIRTUELLE - IGNORÉE';
      else status = '✅ INTERFACE RÉELLE - UTILISÉE';
      
      console.log(`  ${name.padEnd(20)} ${iface.address.padEnd(18)} ${status}`);
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log('✅ RÉSUMÉ: Cherchez une interface avec "UTILISÉE" = votre WiFi/Ethernet réelle');
console.log('='.repeat(70) + '\n');
