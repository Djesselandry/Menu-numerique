const express = require('express');
const router = express.Router();
const tableController = require('../controller/tableController');

// GET /api/tables/dynamic-qr/:tableNumber - Générer un code QR dynamique
router.get('/dynamic-qr/:tableNumber', tableController.generateDynamicQR);

// POST /api/tables/:tableNumber/generate-qr - Générer un code QR pour une table
router.post('/:tableNumber/generate-qr', tableController.generateTableQR);

// GET /api/tables - Récupérer toutes les tables
router.get('/', tableController.getAllTables);

// GET /api/tables/:tableNumber - Récupérer les informations d'une table
router.get('/:tableNumber', tableController.getTableByNumber);

// GET /api/tables/qr/:qrCode - Récupérer une table par code QR
router.get('/qr/:qrCode', tableController.getTableByQRCode);

module.exports = router;
