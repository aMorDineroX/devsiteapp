const express = require('express');
const orderController = require('../controllers/order.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour tous les utilisateurs authentifiés
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrder);
router.post('/', orderController.createOrder);

// Routes réservées aux administrateurs
router.use(restrictTo('admin'));

router.patch('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);
router.patch('/:id/status', orderController.updateOrderStatus);
router.post('/:id/invoice', orderController.generateInvoice);
router.get('/stats', orderController.getOrderStats);

module.exports = router;
