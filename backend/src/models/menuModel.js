const pool = require('../config/db');

// Récupérer tous les plats du menu
const getAllMenu = async () => {
  const res = await pool.query('SELECT * FROM menu ORDER BY id');
  return res.rows;
};

// Ajouter un plat

const createMenuItem = async (data) => {
  const { name, price, is_active } = data;

  const result = await pool.query(
    `INSERT INTO menu (name, price, is_active)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, price, is_active]
  );

  return result.rows[0];
};

module.exports = {
  createMenuItem
};


// Modifier un plat
const updateMenuItem = async (id, name, price, is_active) => {
  const res = await pool.query(
    'UPDATE menu SET name=$1, price=$2, is_active=$3 WHERE id=$4 RETURNING *',
    [name, price, is_active, id]
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

module.exports = { getAllMenu, createMenuItem, updateMenuItem, deleteMenuItem };
