const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/auth.controller').dashboard;
const analyticsController = require('../controllers/analytics.controller');

// Middleware d'authentification (à implémenter)
const authMiddleware = (req, res, next) => {
  // Cette fonction vérifiera si l'utilisateur est authentifié
  // Pour l'instant, on laisse passer tout le monde pour les tests
  next();
};

// Page d'accueil du dashboard
router.get('/', authMiddleware, dashboardController);

// Routes pour la section Analytics
router.get('/analytics', authMiddleware, analyticsController.getAnalyticsPage);
router.get('/api/analytics', authMiddleware, analyticsController.getAnalyticsData);
router.get('/api/analytics/export', authMiddleware, analyticsController.exportAnalytics);

// Routes pour les projets
router.get('/projects', authMiddleware, (req, res) => {
  const user = req.user || { name: 'Utilisateur', role: 'client' };
  res.render('dashboard/projects', { title: 'Mes Projets', user });
});

// Routes pour les commandes
router.get('/orders', authMiddleware, (req, res) => {
  const user = req.user || { name: 'Utilisateur', role: 'client' };
  res.render('dashboard/orders', { title: 'Mes Commandes', user });
});

// Routes pour les messages
router.get('/messages', authMiddleware, (req, res) => {
  const user = req.user || { name: 'Utilisateur', role: 'client' };
  res.render('dashboard/messages', { title: 'Messages', user });
});

// Routes pour les paramètres
router.get('/settings', authMiddleware, (req, res) => {
  const user = req.user || { name: 'Utilisateur', role: 'client' };
  res.render('dashboard/settings', { title: 'Paramètres', user });
});

module.exports = router;