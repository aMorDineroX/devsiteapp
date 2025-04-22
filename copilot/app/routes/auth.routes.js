const express = require('express');
const router = express.Router();

// Login route
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Connexion',
    layout: 'layouts/auth' // Layout spécifique pour les pages d'authentification
  });
});

router.post('/login', (req, res) => {
  // À implémenter avec authentification réelle
  // Redirection vers le dashboard après connexion réussie
  res.redirect('/dashboard');
});

// Register route
router.get('/register', (req, res) => {
  res.render('auth/register', { 
    title: 'Inscription',
    layout: 'layouts/auth'
  });
});

router.post('/register', (req, res) => {
  // À implémenter avec enregistrement réel
  res.redirect('/auth/login');
});

// Logout route
router.get('/logout', (req, res) => {
  // Supprimer le cookie d'authentification et rediriger vers la page d'accueil
  res.clearCookie('user');
  res.redirect('/');
});

module.exports = router;