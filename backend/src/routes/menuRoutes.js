const express = require('express');
const router = express.Router();
const menuController = require('../controller/menuController');
const upload = require("../middlewares/upload");
console.log("menu.routes.js chargé");

router.get('/', menuController.getMenu);          // Récupérer menu

router.post(
  "/",
  upload.single("image"),
  menuController.createMenuItem
);

router.put(
  "/:id",
  upload.single("image"),
  menuController.updateMenuItem
);

router.delete('/:id', menuController.deleteMenuItem); // Supprimer plat


module.exports = router;
