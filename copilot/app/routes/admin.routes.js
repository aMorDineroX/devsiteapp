const express = require('express');
const router = express.Router();

// Middleware d'authentification admin
const adminMiddleware = (req, res, next) => {
  // Dans un cas réel, on vérifierait que l'utilisateur est admin
  // Pour le développement, on laisse passer
  next();
};

// Tableau de bord admin
router.get('/', adminMiddleware, (req, res) => {
  const stats = {
    totalUsers: 256,
    newUsers: 12,
    totalRevenue: 56780,
    monthlyRevenue: 8950,
    totalProjects: 36,
    activeProjects: 18,
    completedProjects: 14,
    pendingProjects: 4
  };
  
  res.render('admin/dashboard', { 
    title: 'Administration', 
    layout: false, 
    stats 
  });
});

// Gestion des utilisateurs
router.get('/users', adminMiddleware, (req, res) => {
  const users = [
    { id: 1, name: 'Sophie Martin', email: 'sophie@example.com', role: 'client', status: 'active' },
    { id: 2, name: 'Thomas Leroy', email: 'thomas@example.com', role: 'client', status: 'active' },
    { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' }
  ];
  
  res.render('admin/users', { 
    title: 'Gestion des utilisateurs', 
    layout: false, 
    users 
  });
});

// Gestion des services
router.get('/services', adminMiddleware, (req, res) => {
  const services = [
    {
      id: 1,
      title: 'Développement Frontend',
      price: 2500,
      status: 'active'
    },
    {
      id: 2,
      title: 'Développement Backend',
      price: 3200,
      status: 'active'
    },
    {
      id: 3,
      title: 'Applications Mobiles',
      price: 4500,
      status: 'active'
    }
  ];
  
  res.render('admin/services', { 
    title: 'Gestion des services', 
    layout: false, 
    services 
  });
});

// Gestion des projets
router.get('/projects', adminMiddleware, (req, res) => {
  const projects = [
    {
      id: 1,
      name: 'E-commerce FashionHub',
      client: 'Sophie Martin',
      status: 'en cours',
      progress: 65
    },
    {
      id: 2,
      name: 'Dashboard DataVision',
      client: 'Thomas Leroy',
      status: 'en révision',
      progress: 90
    },
    {
      id: 3,
      name: 'App FitTrack',
      client: 'Émilie Dubois',
      status: 'en cours',
      progress: 40
    }
  ];
  
  res.render('admin/projects', { 
    title: 'Gestion des projets', 
    layout: false, 
    projects 
  });
});

// Gestion des commandes
router.get('/orders', adminMiddleware, (req, res) => {
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD-001',
      client: 'Sophie Martin',
      serviceName: 'Développement E-commerce',
      amount: 2800,
      status: 'payé',
      createdAt: new Date()
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      client: 'Thomas Leroy',
      serviceName: 'Développement Mobile',
      amount: 4500,
      status: 'en attente',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  ];
  
  res.render('admin/orders', { 
    title: 'Gestion des commandes', 
    layout: false, 
    orders 
  });
});

// Paramètres du site
router.get('/settings', adminMiddleware, (req, res) => {
  const settings = {
    siteName: 'DevCraft',
    siteDescription: 'Solutions Web Sur Mesure',
    contactEmail: 'contact@devcraft.com',
    contactPhone: '+33 1 23 45 67 89',
    socialLinks: {
      twitter: 'https://twitter.com/devcraft',
      linkedin: 'https://linkedin.com/company/devcraft',
      github: 'https://github.com/devcraft',
      facebook: 'https://facebook.com/devcraft'
    }
  };
  
  res.render('admin/settings', { 
    title: 'Paramètres du site', 
    layout: false, 
    settings 
  });
});

module.exports = router;