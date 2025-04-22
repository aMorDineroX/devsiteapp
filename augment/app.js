require('dotenv').config();
const express = require('express');
// const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
// const MongoStore = require('connect-mongo');
const i18n = require('i18n');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure i18n
i18n.configure({
  locales: ['fr', 'en', 'es'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'fr',
  cookie: 'locale'
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(i18n.init);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'devcraft_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));

// Database connection - commented out for now
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devcraft', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.render('index', {
    title: 'DevCraft - Services de Développement Web',
    user: req.session.user || null
  });
});

// Import routes
// const authRoutes = require('./routes/auth');
// const serviceRoutes = require('./routes/services');
// const projectRoutes = require('./routes/projects');
// const orderRoutes = require('./routes/orders');
// const dashboardRoutes = require('./routes/dashboard');

// Use routes
// app.use('/auth', authRoutes);
// app.use('/services', serviceRoutes);
// app.use('/projects', projectRoutes);
// app.use('/orders', orderRoutes);
// app.use('/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('404', {
    title: '404 - Page Not Found',
    user: req.session.user || null
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Error',
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {},
    user: req.session.user || null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
