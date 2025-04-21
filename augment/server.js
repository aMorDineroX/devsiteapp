const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const config = require('./config');
const errorMiddleware = require('./middleware/error.middleware');
const { cacheMiddleware, cacheViewMiddleware } = require('./middleware/cache.middleware');
const { i18nMiddleware } = require('./middleware/i18n.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const serviceRoutes = require('./routes/service.routes');
const projectRoutes = require('./routes/project.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');
const messageRoutes = require('./routes/message.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Initialisation de l'application Express
const app = express();

// Configuration des middlewares
app.use(helmet()); // Sécurité HTTP headers
app.use(compression()); // Compression gzip
app.use(express.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 86400000 // 1 jour en millisecondes
}));

// Internationalisation
app.use(i18nMiddleware);

// Configuration du moteur de templates EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour ajouter la date de la requête
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Connexion à MongoDB
mongoose.connect(config.database.uri)
  .then(() => console.log('✅ Connexion à MongoDB réussie'))
  .catch(err => console.error('❌ Erreur de connexion à MongoDB:', err));

// Documentation API avec Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DevCraft API Documentation'
}));

// Routes API
// Les routes d'authentification et de paiement ne sont pas mises en cache
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Routes API avec cache
app.use('/api/v1/users', cacheMiddleware(config.cache.apiTTL), userRoutes);
app.use('/api/v1/services', cacheMiddleware(config.cache.apiTTL), serviceRoutes);
app.use('/api/v1/projects', cacheMiddleware(config.cache.apiTTL), projectRoutes);
app.use('/api/v1/orders', cacheMiddleware(config.cache.apiTTL), orderRoutes);
app.use('/api/v1/notifications', cacheMiddleware(config.cache.apiTTL), notificationRoutes);
app.use('/api/v1/messages', cacheMiddleware(config.cache.apiTTL), messageRoutes);
app.use('/api/v1/analytics', cacheMiddleware(config.cache.apiTTL), analyticsRoutes);

// Routes pour les vues
app.get('/', cacheViewMiddleware(config.cache.viewsTTL), (req, res) => {
  res.render('index', {
    title: 'DevCraft - Solutions Web Sur Mesure',
    user: req.user,
    showHeader: true,
    showFooter: true,
    currentPage: 'home'
  });
});

// Route pour le tableau de bord
app.get('/dashboard', (req, res) => {
  // Cette route sera protégée plus tard
  res.render('dashboard/index', {
    title: 'Tableau de bord',
    user: req.user,
    showSidebar: true
  });
});

// Gestion des routes non trouvées
app.all('*', (req, res, next) => {
  const err = new errorMiddleware.AppError(
    `Impossible de trouver ${req.originalUrl} sur ce serveur!`,
    404
  );
  next(err);
});

// Middleware de gestion des erreurs
app.use(errorMiddleware);

// Démarrage du serveur
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT} en mode ${config.env}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});
