const { Project, User } = require('../models');
const { AppError } = require('../middleware/error.middleware');

/**
 * Obtenir tous les projets
 * @route GET /api/v1/projects
 * @access Private
 */
exports.getAllProjects = async (req, res, next) => {
  try {
    // Construire la requête
    let query = {};
    
    // Si l'utilisateur n'est pas admin, il ne peut voir que ses propres projets
    if (req.user.role !== 'admin') {
      query.client = req.user.id;
    }
    
    // Filtrer par statut si spécifié
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filtrer par client si spécifié (admin uniquement)
    if (req.query.client && req.user.role === 'admin') {
      query.client = req.query.client;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Exécuter la requête
    const projects = await Project.find(query)
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit);
    
    // Compter le nombre total de projets
    const total = await Project.countDocuments(query);
    
    // Envoyer la réponse
    res.status(200).json({
      status: 'success',
      results: projects.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        projects
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir un projet par ID
 * @route GET /api/v1/projects/:id
 * @access Private
 */
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('Aucun projet trouvé avec cet ID', 404));
    }
    
    // Vérifier si l'utilisateur a le droit de voir ce projet
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à ce projet', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau projet
 * @route POST /api/v1/projects
 * @access Private
 */
exports.createProject = async (req, res, next) => {
  try {
    // Si l'utilisateur n'est pas admin, il ne peut créer que des projets pour lui-même
    if (req.user.role !== 'admin') {
      req.body.client = req.user.id;
    }
    
    // Ajouter l'ID de l'utilisateur créateur
    req.body.createdBy = req.user.id;
    
    const newProject = await Project.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        project: newProject
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un projet
 * @route PATCH /api/v1/projects/:id
 * @access Private
 */
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('Aucun projet trouvé avec cet ID', 404));
    }
    
    // Vérifier si l'utilisateur a le droit de modifier ce projet
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à modifier ce projet', 403));
    }
    
    // Si l'utilisateur n'est pas admin, il ne peut pas changer le client
    if (req.user.role !== 'admin' && req.body.client) {
      delete req.body.client;
    }
    
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un projet
 * @route DELETE /api/v1/projects/:id
 * @access Private (Admin)
 */
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('Aucun projet trouvé avec cet ID', 404));
    }
    
    // Seul un admin peut supprimer un projet
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à supprimer ce projet', 403));
    }
    
    await Project.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter une tâche à un projet
 * @route POST /api/v1/projects/:id/tasks
 * @access Private
 */
exports.addTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('Aucun projet trouvé avec cet ID', 404));
    }
    
    // Vérifier si l'utilisateur a le droit de modifier ce projet
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à modifier ce projet', 403));
    }
    
    // Ajouter la tâche
    project.tasks.push(req.body);
    await project.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une tâche
 * @route PATCH /api/v1/projects/:id/tasks/:taskId
 * @access Private
 */
exports.updateTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('Aucun projet trouvé avec cet ID', 404));
    }
    
    // Vérifier si l'utilisateur a le droit de modifier ce projet
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à modifier ce projet', 403));
    }
    
    // Trouver la tâche
    const taskIndex = project.tasks.findIndex(task => task._id.toString() === req.params.taskId);
    
    if (taskIndex === -1) {
      return next(new AppError('Aucune tâche trouvée avec cet ID', 404));
    }
    
    // Mettre à jour la tâche
    Object.keys(req.body).forEach(key => {
      project.tasks[taskIndex][key] = req.body[key];
    });
    
    // Si la tâche est marquée comme terminée, ajouter la date de complétion
    if (req.body.status === 'terminée' && !project.tasks[taskIndex].completedAt) {
      project.tasks[taskIndex].completedAt = Date.now();
    }
    
    await project.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une tâche
 * @route DELETE /api/v1/projects/:id/tasks/:taskId
 * @access Private
 */
exports.deleteTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('Aucun projet trouvé avec cet ID', 404));
    }
    
    // Vérifier si l'utilisateur a le droit de modifier ce projet
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à modifier ce projet', 403));
    }
    
    // Supprimer la tâche
    project.tasks = project.tasks.filter(task => task._id.toString() !== req.params.taskId);
    await project.save();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter un document à un projet
 * @route POST /api/v1/projects/:id/documents
 * @access Private
 */
exports.addDocument = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('Aucun projet trouvé avec cet ID', 404));
    }
    
    // Vérifier si l'utilisateur a le droit de modifier ce projet
    if (req.user.role !== 'admin' && project.client.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à modifier ce projet', 403));
    }
    
    // Ajouter le document
    project.documents.push({
      name: req.body.name,
      path: req.body.path,
      uploadedBy: req.user.id
    });
    
    await project.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le statut d'un projet
 * @route PATCH /api/v1/projects/:id/status
 * @access Private (Admin)
 */
exports.updateProjectStatus = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('Aucun projet trouvé avec cet ID', 404));
    }
    
    // Seul un admin peut changer le statut d'un projet
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à changer le statut de ce projet', 403));
    }
    
    project.status = req.body.status;
    
    // Mettre à jour les dates en fonction du statut
    if (req.body.status === 'en cours' && !project.startDate) {
      project.startDate = Date.now();
    } else if (req.body.status === 'terminé' && !project.endDate) {
      project.endDate = Date.now();
    }
    
    await project.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};
