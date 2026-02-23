const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

// POST /api/orders - Créer une nouvelle commande
router.post('/', orderController.createOrder);

// GET /api/orders - Récupérer toutes les commandes actives
router.get('/', orderController.getActiveOrders);

// GET /api/orders/:id - Récupérer les détails d'une commande
router.get('/:id', orderController.getOrderDetails);

// GET /api/orders/table/:tableNumber - Récupérer les commandes d'une table
router.get('/table/:tableNumber', orderController.getOrdersByTable);

// PUT /api/orders/:id/status - Changer le statut d'une commande
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
