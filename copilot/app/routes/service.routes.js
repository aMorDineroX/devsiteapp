const express = require('express');
const router = express.Router();

// Ici nous importerons le contrôleur des services
// const serviceController = require('../controllers/service.controller');

// Routes pour la gestion des services
router.get('/', (req, res) => {
  // Liste tous les services
  res.status(200).json({ message: 'Liste des services' });
});

router.get('/:id', (req, res) => {
  // Récupère les détails d'un service spécifique
  res.status(200).json({ message: `Détails du service ${req.params.id}` });
});

router.post('/', (req, res) => {
  // Crée un nouveau service (admin)
  res.status(201).json({ message: 'Service créé avec succès' });
});

router.put('/:id', (req, res) => {
  // Met à jour un service (admin)
  res.status(200).json({ message: `Service ${req.params.id} mis à jour` });
});

router.delete('/:id', (req, res) => {
  // Supprime un service (admin)
  res.status(200).json({ message: `Service ${req.params.id} supprimé` });
});

module.exports = router;