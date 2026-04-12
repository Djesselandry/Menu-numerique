const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

console.log("authRoutes.js loaded");

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register (create new admin account)
router.post('/register', authController.register);

// GET /api/auth/verify (verify token validity)
router.get('/verify', authController.verify);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;
