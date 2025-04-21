const mongoose = require('mongoose');
const slugify = require('slugify');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Un service doit avoir un titre'],
    trim: true,
    maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Un service doit avoir une description']
  },
  shortDescription: {
    type: String,
    required: [true, 'Un service doit avoir une description courte'],
    maxlength: [200, 'La description courte ne peut pas dépasser 200 caractères']
  },
  icon: {
    type: String,
    required: [true, 'Un service doit avoir une icône']
  },
  price: {
    type: Number,
    required: [true, 'Un service doit avoir un prix'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        // this ne pointe vers le document actuel que lors de la création
        return val < this.price;
      },
      message: 'Le prix de remise ({VALUE}) doit être inférieur au prix normal'
    }
  },
  duration: {
    value: {
      type: Number,
      required: [true, 'Un service doit avoir une durée']
    },
    unit: {
      type: String,
      enum: ['jours', 'semaines', 'mois'],
      default: 'jours'
    }
  },
  features: [{
    type: String,
    required: [true, 'Un service doit avoir au moins une fonctionnalité']
  }],
  category: {
    type: String,
    required: [true, 'Un service doit appartenir à une catégorie'],
    enum: {
      values: ['frontend', 'backend', 'mobile', 'ecommerce', 'seo', 'maintenance'],
      message: 'La catégorie doit être: frontend, backend, mobile, ecommerce, seo ou maintenance'
    }
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
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'La note doit être au moins 1.0'],
    max: [5, 'La note ne peut pas dépasser 5.0'],
    set: val => Math.round(val * 10) / 10 // 4.666666 -> 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
serviceSchema.index({ price: 1, ratingsAverage: -1 });
serviceSchema.index({ slug: 1 });

// Virtuals
serviceSchema.virtual('durationText').get(function() {
  return `${this.duration.value} ${this.duration.unit}`;
});

// Virtual populate
serviceSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'service',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
serviceSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// QUERY MIDDLEWARE
serviceSchema.pre(/^find/, function(next) {
  this.find({ isActive: { $ne: false } });
  next();
});

serviceSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'firstName lastName'
  });
  next();
});

// AGGREGATION MIDDLEWARE
serviceSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { isActive: { $ne: false } } });
  next();
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
