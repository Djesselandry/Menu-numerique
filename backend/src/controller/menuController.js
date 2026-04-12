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
    const price = parseInt(req.body?.price, 10);
    const category = req.body?.category?.trim() || 'Tous';
    const is_active = req.body?.available === "true" || req.body?.available === true;
    const description = req.body?.description?.trim() || null;
    const image_url = req.file ? `/menu/${req.file.filename}` : null;

    if (!name || isNaN(price)) {
      return res.status(400).json({
        error: "Données invalides",
        details: { name, price }
      });
    }

    const item = await Menu.createMenuItem({
      name,
      price,
      is_active,
      description,
      image_url,
      category,
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
    const name = req.body?.name?.trim();
    const price = parseInt(req.body?.price, 10);
    const category = req.body?.category?.trim() || 'Tous';
    const is_active = req.body?.available === "true" || req.body?.available === true;
    const description = req.body?.description?.trim() || null;
    const image_url = req.file ? `/menu/${req.file.filename}` : null;

    if (!name || isNaN(price)) {
      return res.status(400).json({
        error: "Données invalides",
        details: { name, price }
      });
    }

    // Si pas de nouvelle image, récupérer l'ancienne
    let finalImageUrl = image_url;
    if (!image_url) {
      const existingItem = await Menu.getMenuById(id);
      finalImageUrl = existingItem?.image_url || null;
    }

    const item = await Menu.updateMenuItem(id, name, description, price, is_active, finalImageUrl, category);
    
    if (!item) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    
    res.json(item);
  } catch (err) {
    console.error('Error updateMenuItem:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier s'il y a des commandes actives avec cet article
    const activeOrdersCount = await Menu.checkActiveOrders(id);
    
    if (activeOrdersCount && activeOrdersCount > 0) {
      // Il y a des commandes actives, proposer la désactivation
      return res.status(409).json({ 
        error: "Cet article a des commandes actives",
        activeOrdersCount: activeOrdersCount,
        suggestion: "Désactivez l'article plutôt que de le supprimer pour garder l'historique"
      });
    }
    
    const item = await Menu.deleteMenuItem(id);
    
    if (!item) {
      return res.status(404).json({ error: "Article non trouvé" });
    }
    
    res.json({ success: true, id: item.id, message: "Article supprimé avec succès" });
  } catch (err) {
    console.error('Error deleteMenuItem:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMenu, createMenuItem, updateMenuItem, deleteMenuItem };
