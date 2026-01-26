const pool = require('../config/db');

// Récupérer tous les plats du menu
const getAllMenu = async () => {
  const res = await pool.query('SELECT * FROM menu ORDER BY id');
  return res.rows;
};

// Ajouter un plat
const addMenuItem = async (name, price, available) => {
  const res = await pool.query(
    'INSERT INTO menu (name, price, available) VALUES ($1, $2, $3) RETURNING *',
    [name, price, available]
  );
  return res.rows[0];
};

// Modifier un plat
const updateMenuItem = async (id, name, price, available) => {
  const res = await pool.query(
    'UPDATE menu SET name=$1, price=$2, available=$3 WHERE id=$4 RETURNING *',
    [name, price, available, id]
  );
  return res.rows[0];
};

// Supprimer un plat
const deleteMenuItem = async (id) => {
  const res = await pool.query(
    'DELETE FROM menu WHERE id=$1 RETURNING *',
    [id]
  );
  return res.rows[0];
};

module.exports = { getAllMenu, addMenuItem, updateMenuItem, deleteMenuItem };
