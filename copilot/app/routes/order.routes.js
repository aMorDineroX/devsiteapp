const express = require('express');
const router = express.Router();

// Middleware d'authentification (à implémenter)
const authMiddleware = (req, res, next) => {
  // Pour le développement, on laisse passer
  next();
};

// Liste des commandes (uniquement utilisateurs authentifiés)
router.get('/', authMiddleware, (req, res) => {
  // Dans un cas réel, on récupérerait les commandes de l'utilisateur depuis la base de données
  const orders = [
    {
      id: 1,
      orderNumber: 'ORD-001',
      serviceName: 'Développement E-commerce',
      amount: 2800,
      status: 'payé',
      createdAt: new Date()
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      serviceName: 'Développement Mobile',
      amount: 4500,
      status: 'en attente',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 jours avant
    }
  ];
  
  res.render('orders/index', { 
    title: 'Mes Commandes',
    orders
  });
});

// Détails d'une commande
router.get('/:id', authMiddleware, (req, res) => {
  const orderId = parseInt(req.params.id);
  
  // Commande factice
  const order = {
    id: orderId,
    orderNumber: `ORD-00${orderId}`,
    serviceName: 'Développement E-commerce',
    description: 'Création d\'une boutique en ligne complète avec système de paiement et gestion des stocks.',
    amount: 2800,
    status: 'payé',
    createdAt: new Date(),
    paidAt: new Date(),
    items: [
      {
        name: 'Développement Frontend',
        description: 'Interfaces utilisateur avec React',
        price: 1200
      },
      {
        name: 'Développement Backend',
        description: 'API et base de données',
        price: 1400
      },
      {
        name: 'Intégration paiement',
        description: 'Stripe et PayPal',
        price: 200
      }
    ],
    client: {
      name: 'Sophie Martin',
      email: 'sophie@example.com',
      company: 'FashionHub SAS'
    }
  };
  
  if (orderId > 0 && orderId < 3) {
    res.render('orders/details', { 
      title: `Commande: ${order.orderNumber}`,
      order
    });
  } else {
    res.status(404).render('404', { title: 'Commande non trouvée' });
  }
});

module.exports = router;