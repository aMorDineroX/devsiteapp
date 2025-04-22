/**
 * Controller pour la gestion des analytics
 */

// Fonction pour afficher la page d'analytics
exports.getAnalyticsPage = (req, res) => {
  // Dans un cas réel, on récupérerait les données depuis une API d'analytics ou une base de données
  const user = req.user || { name: 'Utilisateur', role: 'client' };
  
  res.render('dashboard/analytics', { 
    title: 'Analytics', 
    user
  });
};

// Fonction pour récupérer les données d'analytics en format JSON (pour les appels AJAX)
exports.getAnalyticsData = (req, res) => {
  const { period = 30, projectId } = req.query;

  // Dans un cas réel, ces données seraient dynamiques et proviendraient d'une base de données ou d'une API
  const analyticsData = {
    visitors: {
      count: 5842,
      growth: 12.3,
      data: [520, 680, 595, 810, 750, 920, 870, 940, 780, 650, 720, 810, 850, 910, 870, 920, 980, 1050, 920, 880, 940, 1020, 980, 920, 890, 950, 1010, 980, 1040, 1080]
    },
    conversionRate: {
      value: 3.2,
      growth: 0.8
    },
    averageRevenue: {
      value: 2150,
      growth: -2.1
    },
    totalRevenue: {
      value: 76430,
      growth: 18.4
    },
    sources: [
      { name: 'Google', visits: 2542, conversion: 3.8, growth: 12.4 },
      { name: 'Direct', visits: 1845, conversion: 4.2, growth: 5.1 },
      { name: 'LinkedIn', visits: 854, conversion: 5.7, growth: 24.8 },
      { name: 'Facebook', visits: 601, conversion: 2.1, growth: -8.3 },
      { name: 'Twitter', visits: 412, conversion: 1.8, growth: 3.2 },
      { name: 'Autres', visits: 588, conversion: 2.4, growth: -1.7 }
    ],
    topPages: [
      { name: 'Page d\'accueil', visits: 3241, bounceRate: 32, conversion: 4.8 },
      { name: 'Services', visits: 1845, bounceRate: 28, conversion: 5.2 },
      { name: 'Portfolio', visits: 1542, bounceRate: 35, conversion: 3.1 },
      { name: 'Contact', visits: 968, bounceRate: 15, conversion: 8.7 }
    ]
  };

  // Filtre par projet si un ID est fourni
  if (projectId && projectId !== 'all') {
    // Simulation de données différentes pour chaque projet
    analyticsData.visitors.count = Math.round(analyticsData.visitors.count * (0.8 + (parseInt(projectId) * 0.2)));
    analyticsData.conversionRate.value = parseFloat((analyticsData.conversionRate.value * (0.9 + (parseInt(projectId) * 0.15))).toFixed(1));
  }

  res.json({
    success: true,
    data: analyticsData
  });
};

// Fonction pour exporter les données d'analytics en CSV
exports.exportAnalytics = (req, res) => {
  const { format = 'csv' } = req.query;
  
  // Dans un cas réel, générer un vrai fichier CSV ou PDF basé sur les données
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=analytics-export.csv');
  
  // Créer un contenu CSV basique pour la démo
  let csvContent = 'Date,Visiteurs,Taux de conversion,Revenus\n';
  csvContent += '2023-09-01,520,2.9%,3450€\n';
  csvContent += '2023-09-02,580,3.1%,3780€\n';
  csvContent += '2023-09-03,595,3.0%,3520€\n';
  // ... ajout d'autres lignes pour la démo
  
  res.send(csvContent);
};