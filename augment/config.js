/**
 * Configuration globale de l'application
 */
require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Configuration de la base de données
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/devcraft',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'devcraft_jwt_secret',
    expiresIn: '90d', // 90 jours
    cookieExpiresIn: 90 // 90 jours
  },
  
  // Configuration Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  },
  
  // Configuration Email
  email: {
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  
  // Configuration Session
  session: {
    secret: process.env.SESSION_SECRET || 'devcraft_secret_key',
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000 // 14 jours
    }
  }
};
