const pool = require('../config/db');

// Récupérer tous les plats du menu
const getAllMenu = async () => {
  const res = await pool.query('SELECT * FROM menu ORDER BY id');
  return res.rows;
};

// Ajouter un plat

const createMenuItem = async (data) => {
  const { name, price, available,image_url } = data;

  const result = await pool.query(
    `INSERT INTO menu (name, price, available, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, price, available, image_url]
  );

  return result.rows[0];
};

module.exports = {
  createMenuItem
};


// Modifier un plat
const updateMenuItem = async (id, name, price, available) => {
  const res = await pool.query(
    'UPDATE menu SET name=$1, price=$2, is_active=$3 WHERE id=$4 RETURNING *',
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

module.exports = { getAllMenu, createMenuItem, updateMenuItem, deleteMenuItem };
