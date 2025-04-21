const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200
  },
  icon: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['jours', 'semaines', 'mois'],
      default: 'jours'
    }
  },
  features: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'mobile', 'ecommerce', 'seo', 'maintenance']
  },
  image: {
    type: String
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;