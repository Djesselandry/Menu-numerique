const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

// POST /api/orders - Créer une nouvelle commande
router.post('/', orderController.createOrder);

// GET /api/orders - Récupérer toutes les commandes (pour l'admin)
router.get('/', orderController.getAllOrders);

// GET /api/orders/:id - Récupérer une commande spécifique (pour le client)
router.get('/:id', orderController.getOrderById);

// PUT /api/orders/:id/status - Mettre à jour le statut d'une commande
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;