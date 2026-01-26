const Menu = require('../models/menuModel');

// GET /api/menu
const getMenu = async (req, res) => {
  try {
    const menu = await Menu.getAllMenu();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/menu
const addMenuItem = async (req, res) => {
  try {
    const { name, price, available } = req.body;
    const item = await Menu.addMenuItem(name, price, available);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, available } = req.body;
    const item = await Menu.updateMenuItem(id, name, price, available);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.deleteMenuItem(id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMenu, addMenuItem, updateMenuItem, deleteMenuItem };
