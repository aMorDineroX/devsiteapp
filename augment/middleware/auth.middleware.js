const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const { AppError } = require('./error.middleware');

/**
 * Middleware pour protéger les routes et vérifier l'authentification
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1) Vérifier si le token existe
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Token dans le header Authorization
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      // Token dans les cookies
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.'
      });
    }

    // 2) Vérifier la validité du token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3) Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'L\'utilisateur associé à ce token n\'existe plus.'
      });
    }

    // 4) Vérifier si l'utilisateur a changé son mot de passe après l'émission du token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'Votre mot de passe a été modifié récemment. Veuillez vous reconnecter.'
      });
    }

    // 5) Ajouter l'utilisateur à la requête
    req.user = currentUser;
    req.userId = currentUser._id;

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token invalide ou expiré'
    });
  }
};

/**
 * Middleware pour restreindre l'accès à certains rôles
 * @param  {...String} roles - Les rôles autorisés
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas la permission d\'effectuer cette action'
      });
    }

    next();
  };
};

/**
 * Middleware pour vérifier si l'utilisateur est connecté (pour les vues)
 * Contrairement à protect, ne bloque pas l'accès si non connecté
 */
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      // 1) Vérifier le token
      const decoded = jwt.verify(req.cookies.jwt, config.jwt.secret);

      // 2) Vérifier si l'utilisateur existe toujours
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Vérifier si l'utilisateur a changé son mot de passe après l'émission du token
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // 4) L'utilisateur est connecté
      res.locals.user = currentUser;
      res.locals.isAuthenticated = true;
    } else {
      res.locals.isAuthenticated = false;
    }

    next();
  } catch (error) {
    // Token invalide
    res.locals.isAuthenticated = false;
    next();
  }
};
