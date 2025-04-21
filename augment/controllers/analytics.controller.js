const { Project, Order, Service, User, Message } = require('../models');
const { AppError } = require('../middleware/error.middleware');

/**
 * Obtenir les statistiques générales
 * @route GET /api/v1/analytics/overview
 * @access Private (Admin)
 */
exports.getOverview = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à ces statistiques', 403));
    }
    
    // Statistiques des projets
    const projectStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);
    
    // Statistiques des commandes
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Statistiques des services
    const serviceStats = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$ratingsAverage' }
        }
      }
    ]);
    
    // Statistiques des utilisateurs
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Statistiques des messages
    const messageStats = await Message.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 30
      }
    ]);
    
    // Revenus mensuels
    const monthlyRevenue = await Order.aggregate([
      {
        $match: { status: 'payée' }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 12
      }
    ]);
    
    // Projets par client
    const projectsByClient = await Project.aggregate([
      {
        $group: {
          _id: '$client',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: '$client'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          totalAmount: 1,
          'client.firstName': 1,
          'client.lastName': 1,
          'client.email': 1
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        projectStats,
        orderStats,
        serviceStats,
        userStats,
        messageStats,
        monthlyRevenue,
        projectsByClient
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les statistiques des projets
 * @route GET /api/v1/analytics/projects
 * @access Private (Admin)
 */
exports.getProjectStats = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à ces statistiques', 403));
    }
    
    // Statistiques par statut
    const statsByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);
    
    // Statistiques par mois
    const statsByMonth = await Project.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 12
      }
    ]);
    
    // Durée moyenne des projets
    const avgDuration = await Project.aggregate([
      {
        $match: {
          status: 'terminé',
          startDate: { $exists: true },
          endDate: { $exists: true }
        }
      },
      {
        $project: {
          duration: {
            $divide: [
              { $subtract: ['$endDate', '$startDate'] },
              1000 * 60 * 60 * 24 // Convertir en jours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);
    
    // Top 5 des projets les plus rentables
    const topProjects = await Project.aggregate([
      {
        $sort: { totalAmount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: 'client',
          foreignField: '_id',
          as: 'client'
        }
      },
      {
        $unwind: '$client'
      },
      {
        $project: {
          _id: 1,
          name: 1,
          status: 1,
          totalAmount: 1,
          progress: 1,
          'client.firstName': 1,
          'client.lastName': 1
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        statsByStatus,
        statsByMonth,
        avgDuration: avgDuration.length > 0 ? avgDuration[0].avgDuration : 0,
        topProjects
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les statistiques des commandes
 * @route GET /api/v1/analytics/orders
 * @access Private (Admin)
 */
exports.getOrderStats = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à ces statistiques', 403));
    }
    
    // Statistiques par statut
    const statsByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Statistiques par méthode de paiement
    const statsByPaymentMethod = await Order.aggregate([
      {
        $match: { status: 'payée' }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    // Revenus mensuels
    const monthlyRevenue = await Order.aggregate([
      {
        $match: { status: 'payée' }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 12
      }
    ]);
    
    // Services les plus vendus
    const topServices = await Order.aggregate([
      {
        $unwind: '$services'
      },
      {
        $group: {
          _id: '$services.service',
          count: { $sum: '$services.quantity' },
          totalAmount: { $sum: { $multiply: ['$services.price', '$services.quantity'] } }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'service'
        }
      },
      {
        $unwind: '$service'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          totalAmount: 1,
          'service.title': 1,
          'service.price': 1,
          'service.category': 1
        }
      }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        statsByStatus,
        statsByPaymentMethod,
        monthlyRevenue,
        topServices
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les statistiques des clients
 * @route GET /api/v1/analytics/clients
 * @access Private (Admin)
 */
exports.getClientStats = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à ces statistiques', 403));
    }
    
    // Nombre de clients par mois
    const clientsByMonth = await User.aggregate([
      {
        $match: { role: 'client' }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 12
      }
    ]);
    
    // Top clients par montant dépensé
    const topClients = await Order.aggregate([
      {
        $match: { status: 'payée' }
      },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          totalSpent: 1,
          orderCount: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.email': 1,
          'user.company': 1
        }
      }
    ]);
    
    // Taux de conversion (clients avec au moins une commande / total clients)
    const clientsWithOrders = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          orderCount: { $sum: 1 }
        }
      }
    ]);
    
    const totalClients = await User.countDocuments({ role: 'client' });
    const conversionRate = totalClients > 0 ? (clientsWithOrders.length / totalClients) * 100 : 0;
    
    // Valeur moyenne des clients (montant total / nombre de clients avec commandes)
    const totalRevenue = await Order.aggregate([
      {
        $match: { status: 'payée' }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const avgClientValue = clientsWithOrders.length > 0 && totalRevenue.length > 0
      ? totalRevenue[0].total / clientsWithOrders.length
      : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        clientsByMonth,
        topClients,
        conversionRate,
        avgClientValue,
        totalClients,
        clientsWithOrders: clientsWithOrders.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les données pour le tableau de bord
 * @route GET /api/v1/analytics/dashboard
 * @access Private
 */
exports.getDashboardData = async (req, res, next) => {
  try {
    let data = {};
    
    if (req.user.role === 'admin') {
      // Statistiques pour les administrateurs
      
      // Projets actifs
      const activeProjects = await Project.countDocuments({ status: { $in: ['nouveau', 'en cours', 'en revue'] } });
      
      // Revenus du mois en cours
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = await Order.aggregate([
        {
          $match: {
            status: 'payée',
            createdAt: {
              $gte: new Date(`${currentMonth}-01T00:00:00.000Z`),
              $lte: new Date(`${currentMonth}-31T23:59:59.999Z`)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      // Nouveaux clients ce mois-ci
      const newClients = await User.countDocuments({
        role: 'client',
        createdAt: {
          $gte: new Date(`${currentMonth}-01T00:00:00.000Z`),
          $lte: new Date(`${currentMonth}-31T23:59:59.999Z`)
        }
      });
      
      // Tâches
      const projects = await Project.find();
      let totalTasks = 0;
      let completedTasks = 0;
      
      projects.forEach(project => {
        totalTasks += project.tasks.length;
        completedTasks += project.tasks.filter(task => task.status === 'terminée').length;
      });
      
      // Projets récents
      const recentProjects = await Project.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client');
      
      // Données pour les graphiques
      const revenueData = await Order.aggregate([
        {
          $match: { status: 'payée' }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $limit: 12
        }
      ]);
      
      // Calcul des variations par rapport au mois précédent
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const prevMonthStr = previousMonth.toISOString().slice(0, 7);
      
      const prevMonthProjects = await Project.countDocuments({
        createdAt: {
          $gte: new Date(`${prevMonthStr}-01T00:00:00.000Z`),
          $lte: new Date(`${prevMonthStr}-31T23:59:59.999Z`)
        }
      });
      
      const prevMonthRevenue = await Order.aggregate([
        {
          $match: {
            status: 'payée',
            createdAt: {
              $gte: new Date(`${prevMonthStr}-01T00:00:00.000Z`),
              $lte: new Date(`${prevMonthStr}-31T23:59:59.999Z`)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      const prevMonthClients = await User.countDocuments({
        role: 'client',
        createdAt: {
          $gte: new Date(`${prevMonthStr}-01T00:00:00.000Z`),
          $lte: new Date(`${prevMonthStr}-31T23:59:59.999Z`)
        }
      });
      
      const currentMonthProjects = await Project.countDocuments({
        createdAt: {
          $gte: new Date(`${currentMonth}-01T00:00:00.000Z`),
          $lte: new Date(`${currentMonth}-31T23:59:59.999Z`)
        }
      });
      
      // Calcul des variations
      const projectsChange = prevMonthProjects > 0
        ? ((currentMonthProjects - prevMonthProjects) / prevMonthProjects) * 100
        : 100;
      
      const revenueChange = prevMonthRevenue.length > 0 && prevMonthRevenue[0].total > 0
        ? ((monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0) - prevMonthRevenue[0].total) / prevMonthRevenue[0].total * 100
        : 100;
      
      const clientsChange = prevMonthClients > 0
        ? ((newClients - prevMonthClients) / prevMonthClients) * 100
        : 100;
      
      data = {
        stats: {
          activeProjects,
          revenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
          totalTasks,
          completedTasks,
          tasksCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          newClients,
          projectsChange: Math.round(projectsChange),
          revenueChange: Math.round(revenueChange),
          clientsChange: Math.round(clientsChange)
        },
        recentProjects,
        charts: {
          revenue: {
            labels: revenueData.map(item => {
              const [year, month] = item._id.split('-');
              return `${month}/${year.slice(2)}`;
            }),
            data: revenueData.map(item => item.revenue)
          }
        }
      };
    } else {
      // Statistiques pour les clients
      
      // Projets du client
      const clientProjects = await Project.find({ client: req.user.id });
      
      // Projets actifs
      const activeProjects = clientProjects.filter(project => 
        ['nouveau', 'en cours', 'en revue'].includes(project.status)
      ).length;
      
      // Montant total dépensé
      const totalSpent = await Order.aggregate([
        {
          $match: {
            user: req.user._id,
            status: 'payée'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);
      
      // Tâches
      let totalTasks = 0;
      let completedTasks = 0;
      
      clientProjects.forEach(project => {
        totalTasks += project.tasks.length;
        completedTasks += project.tasks.filter(task => task.status === 'terminée').length;
      });
      
      // Projets récents
      const recentProjects = await Project.find({ client: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Données pour les graphiques
      const projectProgress = clientProjects.map(project => ({
        name: project.name,
        progress: project.progress
      }));
      
      data = {
        stats: {
          activeProjects,
          totalProjects: clientProjects.length,
          totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
          totalTasks,
          completedTasks,
          tasksCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        },
        recentProjects,
        charts: {
          projectProgress
        }
      };
    }
    
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};
