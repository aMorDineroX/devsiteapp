const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Route pour le tableau de bord (accessible à tous les utilisateurs authentifiés)
router.get('/dashboard', analyticsController.getDashboardData);

// Routes réservées aux administrateurs
router.use(restrictTo('admin'));

router.get('/overview', analyticsController.getOverview);
router.get('/projects', analyticsController.getProjectStats);
router.get('/orders', analyticsController.getOrderStats);
router.get('/clients', analyticsController.getClientStats);

module.exports = router;
