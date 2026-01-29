const pool = require('../config/db');

// Récupérer tous les plats du menu
const getAllMenu = async () => {
  const res = await pool.query('SELECT * FROM menu ORDER BY id');
  return res.rows;
};

// Récupérer un plat par ID
const getMenuById = async (id) => {
  const res = await pool.query('SELECT * FROM menu WHERE id = $1', [id]);
  return res.rows[0];
};

// Ajouter un plat
const createMenuItem = async (data) => {
  const { name, price, is_active, description, image_url } = data;

  const result = await pool.query(
    `INSERT INTO menu (name, description, price, image_url, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, description || null, price, image_url || null, is_active]
  );

  return result.rows[0];
};

// Modifier un plat
const updateMenuItem = async (id, name, description, price, is_active, image_url) => {
  const res = await pool.query(
    'UPDATE menu SET name=$1, description=$2, price=$3, is_active=$4, image_url=$5 WHERE id=$6 RETURNING *',
    [name, description || null, price, is_active, image_url || null, id]
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

module.exports = { getAllMenu, getMenuById, createMenuItem, updateMenuItem, deleteMenuItem };
