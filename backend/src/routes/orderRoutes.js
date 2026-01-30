const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

// POST /api/orders - Créer une nouvelle commande
router.post('/', orderController.createOrder);

// GET /api/orders - Récupérer toutes les commandes (pour l'admin)
router.get('/', orderController.getAllOrders);

module.exports = router;