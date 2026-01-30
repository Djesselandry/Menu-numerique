const orderModel = require('../models/orderModel');

const createOrder = async (req, res) => {
  const { table_id, items, total } = req.body;

  if (!table_id || !items || items.length === 0 || !total) {
    return res.status(400).json({ message: 'Données de commande invalides.' });
  }

  try {
    const newOrder = await orderModel.createOrderWithItems({
      table_id,
      total_price: total,
      items,
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la commande.' });
  }
};

const getAllOrders = async (req, res) => {
    try {
      const orders = await orderModel.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération des commandes.' });
    }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await orderModel.updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderModel.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
};