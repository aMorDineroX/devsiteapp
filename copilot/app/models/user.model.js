const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Méthode pour hacher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour vérifier si le mot de passe est correct
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour obtenir le nom complet de l'utilisateur
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);

module.exports = User;