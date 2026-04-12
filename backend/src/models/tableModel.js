const pool = require('../config/db');

// Générer un code QR unique pour une table
const generateQRCode = (tableNumber) => {
  // Format: TABLE_123
  return `TABLE_${tableNumber}`;
};

// Créer ou mettre à jour le code QR pour une table
const assignQRCodeToTable = async (tableNumber) => {
  const qrCode = generateQRCode(tableNumber);
  
  const res = await pool.query(
    `INSERT INTO tables (table_number, qr_code)
     VALUES ($1, $2)
     ON CONFLICT (table_number)
     DO UPDATE SET qr_code = EXCLUDED.qr_code
     RETURNING id, table_number, qr_code`,
    [tableNumber, qrCode]
  );
  
  return res.rows[0];
};

// Récupérer toutes les tables avec leurs codes QR
const getAllTables = async () => {
  const res = await pool.query(
    'SELECT id, table_number, qr_code FROM tables ORDER BY table_number ASC'
  );
  return res.rows;
};

// Récupérer une table spécifique
const getTableByNumber = async (tableNumber) => {
  const res = await pool.query(
    'SELECT id, table_number, qr_code FROM tables WHERE table_number = $1',
    [tableNumber]
  );
  return res.rows[0];
};

// Récupérer une table par code QR
const getTableByQRCode = async (qrCode) => {
  const res = await pool.query(
    'SELECT id, table_number, qr_code FROM tables WHERE qr_code = $1',
    [qrCode]
  );
  return res.rows[0];
};

module.exports = {
  generateQRCode,
  assignQRCodeToTable,
  getAllTables,
  getTableByNumber,
  getTableByQRCode
};
