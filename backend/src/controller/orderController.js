const Order = require('../models/orderModel');

// POST /api/orders - Créer une nouvella commande
const createOrder = async (req, res) => {
  try {
    const { tableNumber, items } = req.body;

    if (!tableNumber || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Données invalides',
        details: { tableNumber, items }
      });
    }

    const order = await Order.createOrder(tableNumber, items);
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/orders - Récupérer toutes les commandes actives
const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.getActiveOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/:id - Récupérer les détails d'une commande
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.getOrderDetails(id);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/table/:tableNumber - Récupérer les commandes d'une table
const getOrdersByTable = async (req, res) => {
  try {
    const { tableNumber } = req.params;
    const orders = await Order.getOrdersByTable(tableNumber);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/orders/:id/status - Changer le statut d'une commande
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ['PENDING', 'PREPARING', 'SERVED', 'ARCHIVED'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        error: 'Statut invalide',
        validStatuses: validStatus
      });
    }

    const order = await Order.updateOrderStatus(id, status);

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getActiveOrders,
  getOrderDetails,
  updateOrderStatus,
  getOrdersByTable
};
