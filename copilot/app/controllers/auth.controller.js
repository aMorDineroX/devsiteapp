const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
// Simuler l'envoi d'email (à remplacer par un vrai service d'envoi d'email)
const sendEmail = async (to, subject, text) => {
  console.log(`Email envoyé à ${to}: ${subject} - ${text}`);
  // Implémenter ici l'envoi réel d'email avec Nodemailer ou un autre service
  return true;
};

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, company, password, confirmPassword, terms } = req.body;

    // Vérifier si les mots de passe correspondent
    if (password !== confirmPassword) {
      return res.render('auth/register', { 
        error: 'Les mots de passe ne correspondent pas',
        // Conserver les données du formulaire pour éviter de les ressaisir
        firstName, lastName, email, company
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('auth/register', { 
        error: 'Un compte existe déjà avec cette adresse email',
        firstName, lastName, email, company
      });
    }

    // Créer un nouvel utilisateur
    const newUser = new User({
      firstName,
      lastName,
      email,
      company,
      password, // Le modèle s'occupe du hachage du mot de passe
    });

    await newUser.save();

    // Envoi d'un email de bienvenue
    await sendEmail(
      email,
      'Bienvenue sur DevCraft',
      `Bonjour ${firstName},\n\nMerci de vous être inscrit sur DevCraft. Votre compte a été créé avec succès.\n\nCordialement,\nL'équipe DevCraft`
    );

    // Rediriger vers la page de connexion avec un message de succès
    return res.render('auth/login', { success: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.' });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return res.render('auth/register', { 
      error: 'Une erreur s\'est produite lors de l\'inscription. Veuillez réessayer.'
    });
  }
};

// Connexion utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    // Rechercher l'utilisateur par son email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.render('auth/login', { error: 'Email ou mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: remember ? '30d' : '1d' }
    );

    // Stocker le token dans un cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 jours ou 1 jour
    });

    // Rediriger vers le tableau de bord
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/dashboard');
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return res.render('auth/login', { error: 'Une erreur s\'est produite. Veuillez réessayer.' });
  }
};

// Déconnexion
exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.redirect('/');
};

// Afficher la page de mot de passe oublié
exports.forgotPasswordPage = (req, res) => {
  res.render('auth/forgot-password');
};

// Traiter la demande de réinitialisation de mot de passe
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return res.render('auth/forgot-password', { 
        success: 'Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation.'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure

    // Sauvegarder le token dans la base de données
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // URL de réinitialisation
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;

    // Envoyer l'email
    await sendEmail(
      user.email,
      'Réinitialisation de votre mot de passe DevCraft',
      `Bonjour ${user.firstName},\n\nVous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :\n\n${resetUrl}\n\nCe lien expirera dans 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\nCordialement,\nL'équipe DevCraft`
    );

    return res.render('auth/forgot-password', { 
      success: 'Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation.'
    });
  } catch (error) {
    console.error('Erreur de réinitialisation de mot de passe:', error);
    return res.render('auth/forgot-password', { 
      error: 'Une erreur s\'est produite. Veuillez réessayer.'
    });
  }
};

// Afficher la page de réinitialisation de mot de passe
exports.resetPasswordPage = async (req, res) => {
  try {
    const { token } = req.params;

    // Vérifier si le token est valide
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/forgot-password', { 
        error: 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.'
      });
    }

    return res.render('auth/reset-password', { token });
  } catch (error) {
    console.error('Erreur d\'affichage de la page de réinitialisation:', error);
    return res.render('auth/forgot-password', { 
      error: 'Une erreur s\'est produite. Veuillez réessayer.'
    });
  }
};

// Traiter la réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Vérifier si les mots de passe correspondent
    if (password !== confirmPassword) {
      return res.render('auth/reset-password', { 
        error: 'Les mots de passe ne correspondent pas',
        token
      });
    }

    // Vérifier si le token est valide
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('auth/forgot-password', { 
        error: 'Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.'
      });
    }

    // Mettre à jour le mot de passe
    user.password = password; // Le modèle s'occupe du hachage
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Envoyer un email de confirmation
    await sendEmail(
      user.email,
      'Confirmation de réinitialisation de mot de passe',
      `Bonjour ${user.firstName},\n\nVotre mot de passe a été réinitialisé avec succès.\n\nSi vous n'avez pas effectué cette action, veuillez contacter immédiatement notre support.\n\nCordialement,\nL'équipe DevCraft`
    );

    return res.render('auth/login', { 
      success: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
    });
  } catch (error) {
    console.error('Erreur de réinitialisation du mot de passe:', error);
    return res.render('auth/reset-password', { 
      error: 'Une erreur s\'est produite. Veuillez réessayer.',
      token
    });
  }
};

// Afficher la page de connexion
exports.loginPage = (req, res) => {
  res.render('auth/login');
};

// Afficher la page d'inscription
exports.registerPage = (req, res) => {
  res.render('auth/register');
};