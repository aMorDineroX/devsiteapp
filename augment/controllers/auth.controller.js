const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');
const { AppError } = require('../middleware/error.middleware');
const { User } = require('../models');

/**
 * Génère un token JWT
 * @param {String} id - ID de l'utilisateur
 * @returns {String} - Token JWT
 */
const signToken = id => {
  return jwt.sign(
    { id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Crée et envoie un token JWT
 * @param {Object} user - Utilisateur
 * @param {Number} statusCode - Code de statut HTTP
 * @param {Object} res - Réponse Express
 */
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Options pour le cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  };

  // Envoyer le cookie
  res.cookie('jwt', token, cookieOptions);

  // Supprimer le mot de passe de la sortie
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

/**
 * Inscription d'un nouvel utilisateur
 */
exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role === 'admin' ? 'client' : req.body.role, // Empêcher la création d'admin
      company: req.body.company,
      phoneNumber: req.body.phoneNumber,
      address: req.body.address
    });

    createSendToken(newUser, 201, req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Connexion d'un utilisateur
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Vérifier si l'email et le mot de passe existent
    if (!email || !password) {
      return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
    }

    // 2) Vérifier si l'utilisateur existe et si le mot de passe est correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Email ou mot de passe incorrect', 401));
    }

    // 3) Si tout est ok, envoyer le token au client
    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Déconnexion d'un utilisateur
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
};

/**
 * Demande de réinitialisation du mot de passe
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Obtenir l'utilisateur basé sur l'email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('Aucun utilisateur avec cette adresse email', 404));
    }

    // 2) Générer un token aléatoire
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Envoyer le token par email
    try {
      const resetURL = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;

      // TODO: Implémenter l'envoi d'email
      // await sendPasswordResetEmail(user, resetURL);

      // Pour le développement, afficher le token dans la réponse
      res.status(200).json({
        status: 'success',
        message: 'Token envoyé par email',
        resetToken,
        resetURL
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('Une erreur s\'est produite lors de l\'envoi de l\'email. Veuillez réessayer plus tard.', 500));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Réinitialisation du mot de passe
 */
exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Obtenir l'utilisateur basé sur le token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    // 2) Si le token n'a pas expiré et qu'il y a un utilisateur, définir le nouveau mot de passe
    if (!user) {
      return next(new AppError('Token invalide ou expiré', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Mettre à jour changedPasswordAt pour l'utilisateur
    // Fait automatiquement via middleware mongoose

    // 4) Connecter l'utilisateur, envoyer le JWT
    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Mise à jour du mot de passe (utilisateur connecté)
 */
exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Obtenir l'utilisateur
    const user = await User.findById(req.userId).select('+password');

    // 2) Vérifier si le mot de passe actuel est correct
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Votre mot de passe actuel est incorrect', 401));
    }

    // 3) Mettre à jour le mot de passe
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Connecter l'utilisateur, envoyer le JWT
    createSendToken(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};
