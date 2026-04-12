#!/usr/bin/env node

/**
 * Test et Diagnostic - Système QR Dynamique
 * 
 * Usage:
 *   node testDynamicQR.js
 * 
 * Vérifie que tous les composants du système QR dynamique fonctionnent correctement
 */

const http = require('http');
const os = require('os');

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Configuration
const CONFIG = {
  hostname: 'localhost',
  port: process.env.PORT || 5000,
  timeout: 5000
};

// Utilitaires
function log(type, message) {
  const prefix = {
    'success': `${colors.green}✅${colors.reset}`,
    'error': `${colors.red}❌${colors.reset}`,
    'warn': `${colors.yellow}⚠️ ${colors.reset}`,
    'info': `${colors.cyan}ℹ️${colors.reset}`,
    'test': `${colors.blue}🧪${colors.reset}`
  };
  console.log(`${prefix[type]} ${message}`);
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// Fonction pour faire une requête HTTP
function makeRequest(hostname, path, port) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: port,
      path: path,
      method: 'GET',
      timeout: CONFIG.timeout
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Tests
async function runTests() {
  console.log(`\n${colors.cyan}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}🧪 Diagnostic Sistem QR Dynamique${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}\n`);

  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Local IP Detection
  console.log(`${colors.blue}Test 1: Détection IP Locale${colors.reset}`);
  try {
    const localIP = getLocalIP();
    log('success', `IP Locale détectée: ${colors.cyan}${localIP}${colors.reset}`);
    testsPassed++;
  } catch (err) {
    log('error', `Impossible de détecter l'IP locale: ${err.message}`);
    testsFailed++;
  }
  testsRun++;

  // Test 2: Server Connectivity
  console.log(`\n${colors.blue}Test 2: Connectivité Serveur${colors.reset}`);
  console.log(`Tentative de connexion à http://${CONFIG.hostname}:${CONFIG.port}...`);
  
  try {
    const response = await makeRequest(CONFIG.hostname, '/', CONFIG.port);
    if (response.status === 200 || response.status === 304) {
      log('success', `Serveur accessible sur le port ${CONFIG.port}`);
      testsPassed++;
    } else {
      log('error', `Serveur retourne le status ${response.status}`);
      testsFailed++;
    }
  } catch (err) {
    log('error', `Impossible de se connecter: ${err.message}`);
    log('warn', `Assurez-vous que le serveur is in running (npm start)`);
    testsFailed++;
  }
  testsRun++;

  // Test 3: API Config Endpoint
  console.log(`\n${colors.blue}Test 3: Endpoint /api/config${colors.reset}`);
  
  try {
    const response = await makeRequest(CONFIG.hostname, '/api/config', CONFIG.port);
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      log('success', `Endpoint /api/config accessible`);
      console.log(`  - API URL: ${colors.cyan}${data.api_url || 'N/A'}${colors.reset}`);
      console.log(`  - Local IP: ${colors.cyan}${data.local_ip || 'N/A'}${colors.reset}`);
      console.log(`  - Port: ${colors.cyan}${data.port || 'N/A'}${colors.reset}`);
      console.log(`  - Environment: ${colors.cyan}${data.environment || 'N/A'}${colors.reset}`);
      testsPassed++;
    } else {
      log('error', `Endpoint retourne le status ${response.status}`);
      testsFailed++;
    }
  } catch (err) {
    log('error', `Impossible d'accéder à /api/config: ${err.message}`);
    testsFailed++;
  }
  testsRun++;

  // Test 4: QR Setup Page
  console.log(`\n${colors.blue}Test 4: Page qr_setup.html${colors.reset}`);
  
  try {
    const response = await makeRequest(CONFIG.hostname, '/qr_setup', CONFIG.port);
    if (response.status === 200) {
      const hasQRGrid = response.body.includes('qrCodesGrid');
      const hasDynamicQR = response.body.includes('generateQRCodesGrid');
      
      if (hasQRGrid && hasDynamicQR) {
        log('success', `Page qr_setup.html chargée avec code QR dynamique`);
        testsPassed++;
      } else {
        log('warn', `Page chargée but missing dynamic QR features`);
        testsFailed++;
      }
    } else {
      log('error', `Page retourne le status ${response.status}`);
      testsFailed++;
    }
  } catch (err) {
    log('error', `Impossible d'accéder à /qr_setup: ${err.message}`);
    testsFailed++;
  }
  testsRun++;

  // Test 5: Dynamic QR API
  console.log(`\n${colors.blue}Test 5: API Dynamique /api/tables/dynamic-qr/1${colors.reset}`);
  
  try {
    const response = await makeRequest(CONFIG.hostname, '/api/tables/dynamic-qr/1', CONFIG.port);
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      if (data.success && data.clientUrl) {
        log('success', `API dynamique retourne un QR valide`);
        console.log(`  - Table: ${colors.cyan}${data.tableNumber}${colors.reset}`);
        console.log(`  - QR Code: ${colors.cyan}${data.qrCode}${colors.reset}`);
        console.log(`  - Client URL: ${colors.cyan}${data.clientUrl}${colors.reset}`);
        testsPassed++;
      } else {
        log('warn', `API retourne une réponse inattendue`);
        testsFailed++;
      }
    } else if (response.status === 404) {
      log('warn', `Route /api/tables/dynamic-qr not found (404)`);
      log('info', `Vérifiez que tableController.js a la fonction generateDynamicQR`);
      testsFailed++;
    } else {
      log('error', `API retourne le status ${response.status}`);
      testsFailed++;
    }
  } catch (err) {
    log('error', `Impossible d'accéder à /api/tables/dynamic-qr/1: ${err.message}`);
    testsFailed++;
  }
  testsRun++;

  // Test 6: Client App
  console.log(`\n${colors.blue}Test 6: Interface Client${colors.reset}`);
  
  try {
    const response = await makeRequest(CONFIG.hostname, '/client/?qr=TABLE_1', CONFIG.port);
    if (response.status === 200) {
      const hasWindowLocation = response.body.includes('window.location.origin');
      
      if (hasWindowLocation) {
        log('success', `Client utilise window.location.origin (dynamique)`);
        testsPassed++;
      } else {
        log('warn', `Client peut ne pas être complètement dynamique`);
        testsFailed++;
      }
    } else {
      log('error', `Client page retourne le status ${response.status}`);
      testsFailed++;
    }
  } catch (err) {
    log('error', `Impossible d'accéder à /client: ${err.message}`);
    testsFailed++;
  }
  testsRun++;

  // Résumé
  console.log(`\n${colors.cyan}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}📊 Résumé des Tests${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}`);
  console.log(`Total: ${testsRun} tests`);
  console.log(`${colors.green}✅ Réussis: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Échoués: ${testsFailed}${colors.reset}`);
  
  if (testsFailed === 0) {
    console.log(`\n${colors.green}🎉 Tous les tests réussis!${colors.reset}`);
    console.log(`${colors.green}Système QR dynamique prêt pour utilisation${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.yellow}⚠️ Certains tests ont échoué${colors.reset}`);
    console.log(`${colors.yellow}Vérifiez les erreurs ci-dessus${colors.reset}\n`);
    process.exit(1);
  }
}

// Main
runTests().catch((err) => {
  log('error', `Erreur non gérée: ${err.message}`);
  process.exit(1);
});
