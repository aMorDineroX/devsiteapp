const config = require('../config');

/**
 * Classe pour gérer les erreurs opérationnelles
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Gestionnaire d'erreurs pour les erreurs de développement
 */
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  
  // Rendu de page
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Une erreur s\'est produite',
    msg: err.message
  });
};

/**
 * Gestionnaire d'erreurs pour les erreurs de production
 */
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Erreur opérationnelle, connue: envoyer le message à l'utilisateur
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    
    // Erreur de programmation ou inconnue: ne pas divulguer les détails
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Une erreur s\'est produite'
    });
  }
  
  // Rendu de page
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Une erreur s\'est produite',
      msg: err.message
    });
  }
  
  // Erreur de programmation ou inconnue: ne pas divulguer les détails
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Une erreur s\'est produite',
    msg: 'Veuillez réessayer plus tard.'
  });
};

/**
 * Gestionnaire d'erreurs pour les erreurs MongoDB
 */
const handleCastErrorDB = err => {
  const message = `Valeur invalide ${err.value} pour le champ ${err.path}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valeur en doublon: ${value}. Veuillez utiliser une autre valeur.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Données invalides. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Gestionnaire d'erreurs pour les erreurs JWT
 */
const handleJWTError = () => 
  new AppError('Token invalide. Veuillez vous reconnecter.', 401);

const handleJWTExpiredError = () => 
  new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);

/**
 * Middleware de gestion globale des erreurs
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (config.env === 'development') {
    sendErrorDev(err, req, res);
  } else if (config.env === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Exporter la classe AppError pour l'utiliser ailleurs
module.exports.AppError = AppError;
