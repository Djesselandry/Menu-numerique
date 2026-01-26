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
const createMenuItem = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const name = req.body?.name?.trim();
    const price = (req.body?.price);
    const available =
      req.body?.available === "true" || req.body?.available === true;

    if (!name || isNaN(price)) {
      return res.status(400).json({
        error: "Données invalides",
        details: { name, price }
      });
    }

    const imageUrl = req.file
      ? `/uploads/menu/${req.file.filename}`
      : null;

    const item = await MenuModel.createMenuItem({
      name,
      price,
      available,
      image_url: imageUrl
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
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

module.exports = { getMenu, createMenuItem, updateMenuItem, deleteMenuItem };
