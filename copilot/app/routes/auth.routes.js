const express = require('express');
const router = express.Router();

// Ici nous importerons le contrôleur d'authentification
// const authController = require('../controllers/auth.controller');

// Routes d'inscription et de connexion
router.post('/register', (req, res) => {
  // Temporaire jusqu'à la création du contrôleur
  res.status(201).json({ message: 'Inscription réussie!' });
});

router.post('/login', (req, res) => {
  // Temporaire jusqu'à la création du contrôleur
  res.status(200).json({ message: 'Connexion réussie!', token: 'jwt_token_temporaire' });
});

router.get('/logout', (req, res) => {
  res.status(200).json({ message: 'Déconnexion réussie!' });
});

router.post('/reset-password', (req, res) => {
  res.status(200).json({ message: 'Email de réinitialisation envoyé!' });
});

module.exports = router;