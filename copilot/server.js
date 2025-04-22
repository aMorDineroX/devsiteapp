const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const viewHelpers = require('./app/utils/view-helpers');

// Chargement des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration des middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

// Configuration du moteur de templates EJS avec les fonctions d'aide
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));
app.set('layout', 'layouts/main');

// Ajout des fonctions d'aide aux templates
app.use((req, res, next) => {
  res.locals.formatDate = viewHelpers.formatDate;
  res.locals.getStatusColor = viewHelpers.getStatusColor;
  res.locals.getProjectColor = viewHelpers.getProjectColor;
  res.locals.getProjectIcon = viewHelpers.getProjectIcon;
  res.locals.getOrderStatusColor = viewHelpers.getOrderStatusColor;
  res.locals.truncate = viewHelpers.truncate;
  // Ajout de l'utilisateur connecté aux templates (à remplacer par votre logique d'authentification)
  res.locals.user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  next();
});

// Connexion à MongoDB (à configurer avec votre base de données)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/devcraft')
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(err => console.error('Erreur de connexion à MongoDB', err));

// Routes principales
app.get('/', (req, res) => {
  res.render('index', { title: 'DevCraft - Solutions Web Sur Mesure' });
});

// Importation des routes
const authRoutes = require('./app/routes/auth.routes');
const serviceRoutes = require('./app/routes/service.routes');
const projectRoutes = require('./app/routes/project.routes');
const orderRoutes = require('./app/routes/order.routes');
const adminRoutes = require('./app/routes/admin.routes');
const dashboardRoutes = require('./app/routes/dashboard.routes'); // Nouvelle importation

// Utilisation des routes
app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);
app.use('/projects', projectRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/dashboard', dashboardRoutes); // Ajout des routes du dashboard

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

// Démarrage du serveur
const startServer = (port) => {
  // Convertir le port en nombre pour garantir le bon incrément
  const portNumber = parseInt(port, 10);
  
  app.listen(portNumber, () => {
    console.log(`Serveur démarré sur le port ${portNumber}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Le port ${portNumber} est déjà utilisé, tentative sur le port ${portNumber + 1}...`);
      startServer(portNumber + 1);
    } else {
      console.error('Erreur lors du démarrage du serveur:', err);
    }
  });
};

// Lancement du serveur sur le port initial
startServer(PORT);