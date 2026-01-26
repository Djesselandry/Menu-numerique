const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');

router.get('/', menuController.getMenu);          // Récupérer menu
router.post('/', menuController.addMenuItem);     // Ajouter plat
router.put('/:id', menuController.updateMenuItem); // Modifier plat
router.delete('/:id', menuController.deleteMenuItem); // Supprimer plat

module.exports = router;
