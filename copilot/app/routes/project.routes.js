const express = require('express');
const router = express.Router();

// Ici nous importerons le contrôleur des projets
// const projectController = require('../controllers/project.controller');

// Routes pour la gestion des projets
router.get('/', (req, res) => {
  // Liste tous les projets
  res.status(200).json({ message: 'Liste des projets' });
});

router.get('/:id', (req, res) => {
  // Récupère les détails d'un projet spécifique
  res.status(200).json({ message: `Détails du projet ${req.params.id}` });
});

router.post('/', (req, res) => {
  // Crée un nouveau projet
  res.status(201).json({ message: 'Projet créé avec succès' });
});

router.put('/:id', (req, res) => {
  // Met à jour un projet
  res.status(200).json({ message: `Projet ${req.params.id} mis à jour` });
});

router.delete('/:id', (req, res) => {
  // Supprime un projet
  res.status(200).json({ message: `Projet ${req.params.id} supprimé` });
});

// Route pour ajouter des étapes/tâches au projet
router.post('/:id/tasks', (req, res) => {
  res.status(201).json({ message: `Tâche ajoutée au projet ${req.params.id}` });
});

// Route pour mettre à jour le statut d'un projet
router.patch('/:id/status', (req, res) => {
  res.status(200).json({ message: `Statut du projet ${req.params.id} mis à jour` });
});

module.exports = router;