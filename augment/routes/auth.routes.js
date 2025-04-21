const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Routes publiques
router.post('/register', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Routes de réinitialisation de mot de passe
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Routes protégées
router.patch('/update-password', protect, authController.updatePassword);

module.exports = router;
