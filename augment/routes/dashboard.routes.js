const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/', dashboardController.getDashboard);
router.get('/projects', dashboardController.getProjects);
router.get('/orders', dashboardController.getOrders);
router.get('/messages', dashboardController.getMessages);
router.get('/messages/conversations/:conversationId', dashboardController.getMessages);
router.get('/payments', dashboardController.getPayments);
router.get('/notifications', dashboardController.getNotifications);
router.get('/profile', dashboardController.getProfile);

// Routes réservées aux administrateurs
router.get('/services', restrictTo('admin'), dashboardController.getServices);
router.get('/analytics', restrictTo('admin'), dashboardController.getAnalytics);

module.exports = router;
