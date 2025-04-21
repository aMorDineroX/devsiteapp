const mongoose = require('mongoose');
const slugify = require('slugify');

// Schéma pour les tâches du projet
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Une tâche doit avoir un titre'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['à faire', 'en cours', 'en revue', 'terminée'],
    default: 'à faire'
  },
  priority: {
    type: String,
    enum: ['basse', 'moyenne', 'haute', 'urgente'],
    default: 'moyenne'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Schéma principal du projet
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Un projet doit avoir un nom'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Un projet doit avoir une description']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Un projet doit être associé à un client']
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  status: {
    type: String,
    enum: {
      values: ['nouveau', 'en cours', 'en revue', 'terminé', 'annulé'],
      message: 'Le statut doit être: nouveau, en cours, en revue, terminé ou annulé'
    },
    default: 'nouveau'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  estimatedEndDate: {
    type: Date
  },
  tasks: [taskSchema],
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'Un projet doit avoir un montant total'],
    min: [0, 'Le montant ne peut pas être négatif']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Le montant payé ne peut pas être négatif']
  },
  documents: [{
    name: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Indexes
projectSchema.index({ client: 1, status: 1 });
projectSchema.index({ slug: 1 });

// Virtuals
projectSchema.virtual('remainingAmount').get(function() {
  return this.totalAmount - this.paidAmount;
});

projectSchema.virtual('isCompleted').get(function() {
  return this.status === 'terminé';
});

projectSchema.virtual('duration').get(function() {
  if (!this.startDate || !this.endDate) return null;
  
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Document middleware
projectSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Mise à jour automatique de la progression
projectSchema.pre('save', function(next) {
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(task => task.status === 'terminée').length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  }
  next();
});

// Query middleware
projectSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'client',
    select: 'firstName lastName email company'
  }).populate({
    path: 'services',
    select: 'title price duration'
  });
  
  next();
});

// Populate les tâches assignées
projectSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'tasks.assignedTo',
    select: 'firstName lastName'
  });
  
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
