const { Service } = require('../models');
const { AppError } = require('../middleware/error.middleware');

/**
 * Obtenir tous les services
 * @route GET /api/v1/services
 * @access Public
 */
exports.getAllServices = async (req, res, next) => {
  try {
    // Construire la requête
    const query = {};
    
    // Filtrer par catégorie si spécifiée
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    // Filtrer par popularité si spécifiée
    if (req.query.isPopular === 'true') {
      query.isPopular = true;
    }
    
    // Filtrer par statut actif par défaut
    if (!req.query.includeInactive) {
      query.isActive = true;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Exécuter la requête
    const services = await Service.find(query)
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit);
    
    // Compter le nombre total de services
    const total = await Service.countDocuments(query);
    
    // Envoyer la réponse
    res.status(200).json({
      status: 'success',
      results: services.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        services
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir un service par ID
 * @route GET /api/v1/services/:id
 * @access Public
 */
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate({
      path: 'reviews',
      select: 'review rating user'
    });
    
    if (!service) {
      return next(new AppError('Aucun service trouvé avec cet ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer un nouveau service
 * @route POST /api/v1/services
 * @access Private (Admin)
 */
exports.createService = async (req, res, next) => {
  try {
    // Ajouter l'ID de l'utilisateur créateur
    req.body.createdBy = req.user.id;
    
    const newService = await Service.create(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        service: newService
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un service
 * @route PATCH /api/v1/services/:id
 * @access Private (Admin)
 */
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!service) {
      return next(new AppError('Aucun service trouvé avec cet ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un service
 * @route DELETE /api/v1/services/:id
 * @access Private (Admin)
 */
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    
    if (!service) {
      return next(new AppError('Aucun service trouvé avec cet ID', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les statistiques des services
 * @route GET /api/v1/services/stats
 * @access Private (Admin)
 */
exports.getServiceStats = async (req, res, next) => {
  try {
    const stats = await Service.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4 } }
      },
      {
        $group: {
          _id: '$category',
          numServices: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activer/désactiver un service
 * @route PATCH /api/v1/services/:id/toggle-active
 * @access Private (Admin)
 */
exports.toggleServiceActive = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return next(new AppError('Aucun service trouvé avec cet ID', 404));
    }
    
    service.isActive = !service.isActive;
    await service.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer/démarquer un service comme populaire
 * @route PATCH /api/v1/services/:id/toggle-popular
 * @access Private (Admin)
 */
exports.toggleServicePopular = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return next(new AppError('Aucun service trouvé avec cet ID', 404));
    }
    
    service.isPopular = !service.isPopular;
    await service.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};
