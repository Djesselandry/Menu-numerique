#!/usr/bin/env node

/**
 * Configuration des Tables QR
 * 
 * Cet script permet de configurer facilement:
 * - Nombre de tables (1-100)
 * - Préfixe du code QR
 * - Mise à jour du fichier qr_setup.html
 * 
 * Usage:
 *   node configureTables.js --count=20
 *   node configureTables.js --count=15 --prefix=TABLE
 */

const fs = require('fs');
const path = require('path');

// Coleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(type, message) {
  const prefix = {
    'success': `${colors.green}✅${colors.reset}`,
    'error': `${colors.red}❌${colors.reset}`,
    'warn': `${colors.yellow}⚠️ ${colors.reset}`,
    'info': `${colors.cyan}ℹ️${colors.reset}`
  };
  console.log(`${prefix[type]} ${message}`);
}

// Parser arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    count: 10,
    prefix: 'TABLE'
  };

  for (const arg of args) {
    if (arg.startsWith('--count=')) {
      const count = parseInt(arg.split('=')[1]);
      if (count > 0 && count <= 100) {
        config.count = count;
      } else {
        log('error', `Count doit être entre 1 et 100 (reçu: ${count})`);
        process.exit(1);
      }
    } else if (arg.startsWith('--prefix=')) {
      config.prefix = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }

  return config;
}

function showHelp() {
  console.log(`
${colors.cyan}Configuration des Tables QR${colors.reset}

Usage:
  node configureTables.js [options]

Options:
  --count=N        Nombre de tables (1-100) [default: 10]
  --prefix=PRE     Préfixe du code QR [default: TABLE]
  --help, -h       Afficher cette aide

Exemples:
  node configureTables.js
  node configureTables.js --count=20
  node configureTables.js --count=15 --prefix=SALLE
  node configureTables.js --count=5 --prefix=TABLE

Résultat:
  Met à jour qr_setup.html pour générer N codes QR au lieu de 10.
  `);
}

// Mettre à jour qr_setup.html
function updateQRSetupFile(count, prefix) {
  const filePath = path.join(__dirname, 'frontend', 'client', 'qr_setup.html');

  if (!fs.existsSync(filePath)) {
    log('error', `Fichier non trouvé: ${filePath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Remplacer la boucle de génération
  const oldPattern = /for \(let i = 1; i <= \d+; i\+\+\)/;
  const newLoop = `for (let i = 1; i <= ${count}; i++)`;

  if (!oldPattern.test(content)) {
    log('error', `Pattern de boucle non trouvé dans qr_setup.html`);
    log('info', `Vérifiez que qr_setup.html contient: for (let i = 1; i <= X; i++)`);
    process.exit(1);
  }

  content = content.replace(oldPattern, newLoop);

  // Remplacer les références au préfixe si différent
  content = content.replace(/TABLE_\$/g, `${prefix}_$`);
  content = content.replace(/TABLE </g, `${prefix} <`);

  // Écrire le fichier
  fs.writeFileSync(filePath, content, 'utf-8');

  log('success', `qr_setup.html mis à jour`);
  log('info', `Nombre de tables: ${count}`);
  log('info', `Préfixe QR: ${prefix}`);
}

// Générer un rapport
function generateReport(count, prefix) {
  console.log(`\n${colors.cyan}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}📊 Configuration des Tables - Rapport${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}\n`);

  console.log(`Paramètres configurés:`);
  console.log(`  Nombre de tables: ${colors.blue}${count}${colors.reset}`);
  console.log(`  Préfixe QR: ${colors.blue}${prefix}${colors.reset}`);

  console.log(`\nCodes QR générés:`);
  for (let i = 1; i <= Math.min(count, 5); i++) {
    console.log(`  - ${prefix}_${i}`);
  }
  if (count > 5) {
    console.log(`  ... ${count - 5} autres tables ...`);
  }

  console.log(`\nURLs des QR codes:`);
  console.log(`  http://[IP]:5000/client/?qr=${prefix}_1`);
  console.log(`  http://[IP]:5000/client/?qr=${prefix}_2`);
  console.log(`  ...`);
  console.log(`  http://[IP]:5000/client/?qr=${prefix}_${count}`);

  console.log(`\nProchaines étapes:`);
  console.log(`  1. Démarrez le serveur: ${colors.cyan}npm start${colors.reset}`);
  console.log(`  2. Accédez à: ${colors.cyan}http://[IP]:5000/qr_setup${colors.reset}`);
  console.log(`  3. Vous verrez ${count} codes QR`);
  console.log(`\n${colors.green}✅ Configuration complète!${colors.reset}\n`);
}

// Main
function main() {
  console.log(`\n${colors.cyan}════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}⚙️  Configuration des Tables QR${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════${colors.reset}\n`);

  try {
    const config = parseArgs();

    log('info', `Configuration en cours...`);
    updateQRSetupFile(config.count, config.prefix);

    generateReport(config.count, config.prefix);
  } catch (err) {
    log('error', `Erreur: ${err.message}`);
    process.exit(1);
  }
}

main();
