const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Routes protégées
router.use(protect);
router.post('/create-checkout-session', paymentController.createCheckoutSession);
router.get('/check-session/:sessionId', paymentController.checkSession);

// Route publique pour le webhook Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;
