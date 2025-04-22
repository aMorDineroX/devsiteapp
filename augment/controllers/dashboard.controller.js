const { Project, Order, Service, User, Message } = require('../models');
const { AppError } = require('../middleware/error.middleware');

/**
 * Afficher la page d'accueil du tableau de bord
 * @route GET /dashboard
 * @access Private
 */
exports.getDashboard = async (req, res, next) => {
  try {
    // Données communes pour tous les utilisateurs
    let stats = {};
    let recentProjects = [];
    let charts = {
      revenue: { labels: [], data: [] },
      projectStatus: { labels: [], data: [] }
    };

    // Données spécifiques au rôle de l'utilisateur
    if (req.user.role === 'admin') {
      // Statistiques pour les administrateurs
      
      // Projets actifs et nouveaux
      const activeProjects = await Project.countDocuments({ 
        status: { $in: ['nouveau', 'en cours', 'en revue'] } 
      });
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      const newProjects = await Project.countDocuments({
        createdAt: { $gte: lastWeek }
      });
      
      // Tâches complétées
      const projects = await Project.find();
      let totalTasks = 0;
      let completedTasks = 0;
      let newCompletedTasks = 0;
      
      projects.forEach(project => {
        if (project.tasks && project.tasks.length > 0) {
          totalTasks += project.tasks.length;
          project.tasks.forEach(task => {
            if (task.status === 'terminée') {
              completedTasks++;
              if (task.completedAt && task.completedAt >= lastWeek) {
                newCompletedTasks++;
              }
            }
          });
        }
      });
      
      // Revenus mensuels
      const currentMonth = new Date().toISOString().slice(0, 7);
      const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
      
      const currentMonthRevenue = await Order.aggregate([
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
      
      const previousMonthRevenue = await Order.aggregate([
        {
          $match: {
            status: 'payée',
            createdAt: {
              $gte: new Date(`${previousMonth}-01T00:00:00.000Z`),
              $lte: new Date(`${previousMonth}-31T23:59:59.999Z`)
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
      
      const monthlyRevenue = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].total : 0;
      const prevMonthlyRevenue = previousMonthRevenue.length > 0 ? previousMonthRevenue[0].total : 0;
      
      const revenueChangePercentage = prevMonthlyRevenue === 0 
        ? 100 
        : Math.round(((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100);
      
      // Clients actifs et nouveaux
      const activeClients = await User.countDocuments({ role: 'client', active: true });
      const newClients = await User.countDocuments({
        role: 'client',
        createdAt: { $gte: lastWeek }
      });
      
      // Projets récents
      recentProjects = await Project.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('client', 'firstName lastName email');
      
      // Tâches récentes
      const recentTasks = [];
      projects.forEach(project => {
        if (project.tasks && project.tasks.length > 0) {
          project.tasks.forEach(task => {
            if (task.status !== 'terminée') {
              recentTasks.push({
                ...task.toObject(),
                project: {
                  _id: project._id,
                  name: project.name
                }
              });
            }
          });
        }
      });
      
      recentTasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
      });
      
      const limitedRecentTasks = recentTasks.slice(0, 5);
      
      // Données pour les graphiques
      // Revenus des 6 derniers mois
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      
      const monthlyRevenues = await Order.aggregate([
        {
          $match: {
            status: 'payée',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: { $substr: ['$createdAt', 0, 7] },
            revenue: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      const months = [];
      const revenues = [];
      
      // Créer un tableau de tous les mois
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthYear = d.toISOString().slice(0, 7);
        months.unshift(monthYear);
      }
      
      // Remplir les données de revenus
      months.forEach(month => {
        const found = monthlyRevenues.find(item => item._id === month);
        const monthName = new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'short' });
        charts.revenue.labels.push(monthName);
        charts.revenue.data.push(found ? found.revenue : 0);
      });
      
      // Statut des projets
      const projectStatusCounts = await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      const statusMap = {
        'nouveau': 'Nouveau',
        'en cours': 'En cours',
        'en revue': 'En revue',
        'terminé': 'Terminé',
        'annulé': 'Annulé'
      };
      
      projectStatusCounts.forEach(status => {
        charts.projectStatus.labels.push(statusMap[status._id] || status._id);
        charts.projectStatus.data.push(status.count);
      });
      
      stats = {
        activeProjects,
        newProjects,
        completedTasks,
        totalTasks,
        newCompletedTasks,
        monthlyRevenue,
        currencySymbol: '€',
        revenueChangePercentage,
        activeClients,
        newClients
      };
    } else {
      // Statistiques pour les clients
      
      // Projets du client
      const clientProjects = await Project.find({ client: req.user.id });
      const activeProjects = clientProjects.filter(p => 
        ['nouveau', 'en cours', 'en revue'].includes(p.status)
      ).length;
      
      // Calcul du changement de projets (simulé)
      const projectsChange = 0; // À implémenter avec des données réelles
      
      // Tâches
      let totalTasks = 0;
      let completedTasks = 0;
      
      clientProjects.forEach(project => {
        if (project.tasks && project.tasks.length > 0) {
          totalTasks += project.tasks.length;
          completedTasks += project.tasks.filter(task => task.status === 'terminée').length;
        }
      });
      
      const tasksCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Dépenses totales
      const clientOrders = await Order.find({ user: req.user.id, status: 'payée' });
      const totalSpent = clientOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Projets récents
      recentProjects = await Project.find({ client: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Données pour les graphiques
      // Dépenses mensuelles
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      
      const monthlyExpenses = await Order.aggregate([
        {
          $match: {
            user: req.user._id,
            status: 'payée',
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: { $substr: ['$createdAt', 0, 7] },
            expense: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);
      
      const months = [];
      const expenses = [];
      
      // Créer un tableau de tous les mois
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthYear = d.toISOString().slice(0, 7);
        months.unshift(monthYear);
      }
      
      // Remplir les données de dépenses
      months.forEach(month => {
        const found = monthlyExpenses.find(item => item._id === month);
        const monthName = new Date(`${month}-01`).toLocaleDateString('fr-FR', { month: 'short' });
        charts.revenue.labels.push(monthName);
        charts.revenue.data.push(found ? found.expense : 0);
      });
      
      // Progression des projets
      clientProjects.forEach(project => {
        if (project.name && project.progress !== undefined) {
          charts.projectStatus.labels.push(project.name);
          charts.projectStatus.data.push(project.progress);
        }
      });
      
      stats = {
        activeProjects,
        totalProjects: clientProjects.length,
        projectsChange,
        completedTasks,
        totalTasks,
        tasksCompletion,
        totalSpent
      };
    }
    
    res.render('dashboard/index', {
      title: 'Tableau de bord',
      user: req.user,
      stats,
      recentProjects,
      recentTasks: req.user.role === 'admin' ? limitedRecentTasks : [],
      charts,
      formatDate: (date) => {
        if (!date) return 'Non définie';
        return new Date(date).toLocaleDateString('fr-FR');
      },
      getRandomColor: (id) => {
        const colors = ['blue-500', 'green-500', 'purple-500', 'red-500', 'yellow-500', 'pink-500'];
        const hash = String(id).split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Afficher la page des projets
 * @route GET /dashboard/projects
 * @access Private
 */
exports.getProjects = async (req, res, next) => {
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
      .limit(limit)
      .populate('client', 'firstName lastName email company')
      .populate('services', 'title price');
    
    // Compter le nombre total de projets
    const total = await Project.countDocuments(query);
    
    // Obtenir la liste des clients pour le filtre (admin uniquement)
    let clients = [];
    if (req.user.role === 'admin') {
      clients = await User.find({ role: 'client' })
        .sort('firstName lastName')
        .select('firstName lastName email company');
    }
    
    res.render('dashboard/projects', {
      title: 'Projets',
      user: req.user,
      projects,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      clients,
      filters: {
        status: req.query.status || '',
        client: req.query.client || ''
      },
      formatDate: (date) => {
        if (!date) return 'Non définie';
        return new Date(date).toLocaleDateString('fr-FR');
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Afficher la page des commandes
 * @route GET /dashboard/orders
 * @access Private
 */
exports.getOrders = async (req, res, next) => {
  try {
    // Construire la requête
    let query = {};
    
    // Si l'utilisateur n'est pas admin, il ne peut voir que ses propres commandes
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    // Filtrer par statut si spécifié
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Filtrer par utilisateur si spécifié (admin uniquement)
    if (req.query.user && req.user.role === 'admin') {
      query.user = req.query.user;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Exécuter la requête
    const orders = await Order.find(query)
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('user', 'firstName lastName email')
      .populate('services.service', 'title price')
      .populate('project', 'name');
    
    // Compter le nombre total de commandes
    const total = await Order.countDocuments(query);
    
    // Obtenir la liste des utilisateurs pour le filtre (admin uniquement)
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.find({ role: 'client' })
        .sort('firstName lastName')
        .select('firstName lastName email');
    }
    
    res.render('dashboard/orders', {
      title: 'Commandes',
      user: req.user,
      orders,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      users,
      filters: {
        status: req.query.status || '',
        user: req.query.user || ''
      },
      formatDate: (date) => {
        if (!date) return 'Non définie';
        return new Date(date).toLocaleDateString('fr-FR');
      },
      formatCurrency: (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Afficher la page des services
 * @route GET /dashboard/services
 * @access Private (Admin)
 */
exports.getServices = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette page', 403));
    }
    
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
    
    // Inclure les services inactifs si spécifié
    if (req.query.includeInactive === 'true') {
      // Ne pas filtrer par statut actif
    } else {
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
    
    res.render('dashboard/services', {
      title: 'Services',
      user: req.user,
      services,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      filters: {
        category: req.query.category || '',
        isPopular: req.query.isPopular === 'true',
        includeInactive: req.query.includeInactive === 'true'
      },
      categories: [
        { value: 'frontend', label: 'Frontend' },
        { value: 'backend', label: 'Backend' },
        { value: 'mobile', label: 'Mobile' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'seo', label: 'SEO' },
        { value: 'maintenance', label: 'Maintenance' }
      ],
      formatCurrency: (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Afficher la page des messages
 * @route GET /dashboard/messages
 * @access Private
 */
exports.getMessages = async (req, res, next) => {
  try {
    // Obtenir les conversations de l'utilisateur
    const conversations = await Conversation.find({
      participants: req.user.id,
      archived: req.query.archived === 'true'
    })
      .sort({ lastMessageDate: -1 })
      .populate('participants', 'firstName lastName email profileImage role')
      .populate('lastMessage');
    
    // Obtenir les messages de la conversation active (si spécifiée)
    let activeConversation = null;
    let messages = [];
    
    if (req.params.conversationId) {
      activeConversation = await Conversation.findById(req.params.conversationId)
        .populate('participants', 'firstName lastName email profileImage role')
        .populate('project', 'name');
      
      if (activeConversation) {
        // Vérifier si l'utilisateur fait partie de cette conversation
        if (!activeConversation.participants.some(p => p._id.toString() === req.user.id)) {
          return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette conversation', 403));
        }
        
        messages = await Message.find({ conversation: activeConversation._id })
          .sort('createdAt')
          .populate('sender', 'firstName lastName email profileImage role');
      }
    }
    
    // Obtenir la liste des utilisateurs pour créer une nouvelle conversation
    let users = [];
    if (req.user.role === 'admin') {
      users = await User.find({ _id: { $ne: req.user.id } })
        .sort('firstName lastName')
        .select('firstName lastName email role');
    } else {
      users = await User.find({ role: 'admin' })
        .sort('firstName lastName')
        .select('firstName lastName email role');
    }
    
    // Obtenir la liste des projets de l'utilisateur
    let projects = [];
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .sort('-createdAt')
        .select('name client')
        .populate('client', 'firstName lastName');
    } else {
      projects = await Project.find({ client: req.user.id })
        .sort('-createdAt')
        .select('name');
    }
    
    res.render('dashboard/messages', {
      title: 'Messages',
      user: req.user,
      conversations,
      activeConversation,
      messages,
      users,
      projects,
      filters: {
        archived: req.query.archived === 'true'
      },
      formatDate: (date) => {
        if (!date) return '';
        
        const now = new Date();
        const messageDate = new Date(date);
        
        // Si c'est aujourd'hui, afficher l'heure
        if (messageDate.toDateString() === now.toDateString()) {
          return messageDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Si c'est cette semaine, afficher le jour
        const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
          return messageDate.toLocaleDateString('fr-FR', { weekday: 'long' });
        }
        
        // Sinon afficher la date complète
        return messageDate.toLocaleDateString('fr-FR');
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Afficher la page des paiements
 * @route GET /dashboard/payments
 * @access Private
 */
exports.getPayments = async (req, res, next) => {
  try {
    // Obtenir les commandes avec paiement
    let query = { 
      status: { $in: ['payée', 'en cours', 'livrée'] }
    };
    
    // Si l'utilisateur n'est pas admin, il ne peut voir que ses propres paiements
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }
    
    const payments = await Order.find(query)
      .sort('-paymentDate')
      .populate('user', 'firstName lastName email')
      .populate('services.service', 'title');
    
    res.render('dashboard/payments', {
      title: 'Paiements',
      user: req.user,
      payments,
      formatDate: (date) => {
        if (!date) return 'Non définie';
        return new Date(date).toLocaleDateString('fr-FR');
      },
      formatCurrency: (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Afficher la page des notifications
 * @route GET /dashboard/notifications
 * @access Private
 */
exports.getNotifications = async (req, res, next) => {
  try {
    // Obtenir les notifications de l'utilisateur
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort('-createdAt');
    
    res.render('dashboard/notifications', {
      title: 'Notifications',
      user: req.user,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Afficher la page des statistiques
 * @route GET /dashboard/analytics
 * @access Private (Admin)
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette page', 403));
    }
    
    // Obtenir les statistiques générales
    const overview = {
      // Statistiques des projets par statut
      projectStats: await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Statistiques des commandes par statut
      orderStats: await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Statistiques des utilisateurs par rôle
      userStats: await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Revenus mensuels
      monthlyRevenue: await Order.aggregate([
        {
          $match: { status: 'payée' }
        },
        {
          $group: {
            _id: { $substr: ['$createdAt', 0, 7] },
            revenue: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      
      // Nouveaux clients par mois
      clientStats: await User.aggregate([
        {
          $match: { role: 'client' }
        },
        {
          $group: {
            _id: { $substr: ['$createdAt', 0, 7] },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
      
      // Services les plus populaires
      popularServices: await Service.find({ isPopular: true })
        .sort('-ratingsAverage')
        .limit(5)
    };
    
    res.render('dashboard/analytics', {
      title: 'Statistiques',
      user: req.user,
      overview,
      formatCurrency: (amount) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Afficher la page de profil
 * @route GET /dashboard/profile
 * @access Private
 */
exports.getProfile = async (req, res, next) => {
  try {
    res.render('dashboard/profile', {
      title: 'Profil',
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};
