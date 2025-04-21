const mongoose = require('mongoose');
const Service = require('./service.model');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Un avis ne peut pas être vide']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Un avis doit avoir une note entre 1 et 5']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Un avis doit appartenir à un service']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Un avis doit appartenir à un utilisateur']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Empêcher un utilisateur de laisser plusieurs avis sur le même service
reviewSchema.index({ service: 1, user: 1 }, { unique: true });

// Query middleware
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName profileImage'
  });
  
  next();
});

// Fonction statique pour calculer les statistiques d'avis
reviewSchema.statics.calcAverageRatings = async function(serviceId) {
  const stats = await this.aggregate([
    {
      $match: { service: serviceId }
    },
    {
      $group: {
        _id: '$service',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Service.findByIdAndUpdate(serviceId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Service.findByIdAndUpdate(serviceId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// Appeler calcAverageRatings après save
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.service);
});

// Appeler calcAverageRatings avant findOneAnd...
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); ne fonctionne pas ici, la requête a déjà été exécutée
  await this.r.constructor.calcAverageRatings(this.r.service);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
