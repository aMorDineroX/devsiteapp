const express = require('express');
const projectController = require('../controllers/project.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour tous les utilisateurs authentifiés
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProject);
router.post('/', projectController.createProject);
router.patch('/:id', projectController.updateProject);

// Routes pour les tâches
router.post('/:id/tasks', projectController.addTask);
router.patch('/:id/tasks/:taskId', projectController.updateTask);
router.delete('/:id/tasks/:taskId', projectController.deleteTask);

// Routes pour les documents
router.post('/:id/documents', projectController.addDocument);

// Routes réservées aux administrateurs
router.use(restrictTo('admin'));

router.delete('/:id', projectController.deleteProject);
router.patch('/:id/status', projectController.updateProjectStatus);

module.exports = router;
