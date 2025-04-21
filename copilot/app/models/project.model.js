const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['à faire', 'en cours', 'en revue', 'terminé'],
    default: 'à faire'
  },
  dueDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  status: {
    type: String,
    enum: ['nouveau', 'en cours', 'en revue', 'terminé', 'annulé'],
    default: 'nouveau'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  tasks: [taskSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  documents: [{
    name: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;