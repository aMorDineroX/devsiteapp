const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

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

// Configuration du moteur de templates EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

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

// Utilisation des routes
app.use('/auth', authRoutes);
app.use('/services', serviceRoutes);
app.use('/projects', projectRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});