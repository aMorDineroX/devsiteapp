const express = require('express');
const serviceController = require('../controllers/service.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Routes publiques
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getService);

// Routes protégées (admin uniquement)
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', serviceController.createService);
router.patch('/:id', serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.get('/stats', serviceController.getServiceStats);
router.patch('/:id/toggle-active', serviceController.toggleServiceActive);
router.patch('/:id/toggle-popular', serviceController.toggleServicePopular);

module.exports = router;
