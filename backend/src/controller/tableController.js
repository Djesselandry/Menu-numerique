const Table = require('../models/tableModel');

// GET /api/tables/dynamic-qr/:tableNumber - Générer un code QR dynamique basé sur l'IP actuelle
const generateDynamicQR = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    if (!tableNumber || tableNumber <= 0) {
      return res.status(400).json({
        error: 'Numéro de table invalide'
      });
    }

    // Construire l'URL dynamique basée sur le host du requête (adapte à toute IP)
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    const clientUrl = `${serverUrl}/client/?qr=TABLE_${tableNumber}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(clientUrl)}`;

    res.json({
      success: true,
      tableNumber: tableNumber,
      qrCode: `TABLE_${tableNumber}`,
      clientUrl: clientUrl,
      qrImageUrl: qrImageUrl,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/tables/:tableNumber/generate-qr - Générer un code QR pour une table
const generateTableQR = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    if (!tableNumber || tableNumber <= 0) {
      return res.status(400).json({
        error: 'Numéro de table invalide'
      });
    }

    const table = await Table.assignQRCodeToTable(parseInt(tableNumber));
    
    res.json({
      success: true,
      table: table,
      qrUrl: `${req.protocol}://${req.get('host')}/client/?qr=${table.qr_code}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/tables - Récupérer toutes les tables
const getAllTables = async (req, res) => {
  try {
    const tables = await Table.getAllTables();
    res.json(tables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/tables/:tableNumber - Récupérer les informations d'une table
const getTableByNumber = async (req, res) => {
  try {
    const { tableNumber } = req.params;

    if (!tableNumber || tableNumber <= 0) {
      return res.status(400).json({
        error: 'Numéro de table invalide'
      });
    }

    const table = await Table.getTableByNumber(parseInt(tableNumber));
    
    if (!table) {
      return res.status(404).json({
        error: 'Table non trouvée'
      });
    }

    res.json(table);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/tables/qr/:qrCode - Récupérer une table par code QR
const getTableByQRCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    if (!qrCode) {
      return res.status(400).json({
        error: 'Code QR invalide'
      });
    }

    const table = await Table.getTableByQRCode(qrCode);
    
    if (!table) {
      return res.status(404).json({
        error: 'Table non trouvée'
      });
    }

    res.json(table);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  generateDynamicQR,
  generateTableQR,
  getAllTables,
  getTableByNumber,
  getTableByQRCode
};
