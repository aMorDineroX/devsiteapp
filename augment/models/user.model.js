const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Veuillez fournir votre prénom'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Veuillez fournir votre nom'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Veuillez fournir votre email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Veuillez fournir un mot de passe'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Veuillez confirmer votre mot de passe'],
    validate: {
      // Cette validation fonctionne uniquement sur CREATE et SAVE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Les mots de passe ne correspondent pas'
    }
  },
  profileImage: {
    type: String,
    default: 'default-avatar.png'
  },
  role: {
    type: String,
    enum: ['client', 'admin'],
    default: 'client'
  },
  company: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  // Exécuter cette fonction uniquement si le mot de passe a été modifié
  if (!this.isModified('password')) return next();
  
  // Hacher le mot de passe avec un coût de 12
  this.password = await bcrypt.hash(this.password, config.security.bcryptSaltRounds);
  
  // Supprimer le champ passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

// Middleware pour mettre à jour la date de changement de mot de passe
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; // -1s pour s'assurer que le token est créé après le changement
  next();
});

// Middleware pour ne pas afficher les utilisateurs inactifs
userSchema.pre(/^find/, function(next) {
  // this pointe vers la requête actuelle
  this.find({ active: { $ne: false } });
  next();
});

// Méthode d'instance pour vérifier si le mot de passe est correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Méthode d'instance pour vérifier si le mot de passe a été changé après l'émission du token
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  
  // False signifie que le mot de passe n'a PAS été changé
  return false;
};

// Méthode d'instance pour créer un token de réinitialisation de mot de passe
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
