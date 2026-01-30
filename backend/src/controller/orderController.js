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

module.exports = {
  createOrder,
  getAllOrders,
};