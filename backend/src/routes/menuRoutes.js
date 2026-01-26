const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');
const upload = require("../middlewares/upload");
console.log("menu.routes.js chargé");

router.get('/', menuController.getMenu);          // Récupérer menu
router.post('/', menuController.createMenuItem);     // Ajouter plat
router.put('/:id', menuController.updateMenuItem); // Modifier plat
router.delete('/:id', menuController.deleteMenuItem); // Supprimer plat

router.post(
  "/",
  upload.single("image"),
  menuController.createMenuItem
);


module.exports = router;
