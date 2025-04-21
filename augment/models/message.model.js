const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Un message doit avoir un expéditeur']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Un message doit avoir un destinataire']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  subject: {
    type: String,
    trim: true,
    required: [true, 'Un message doit avoir un sujet']
  },
  content: {
    type: String,
    required: [true, 'Un message ne peut pas être vide']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  attachments: [{
    name: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
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
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ project: 1 });
messageSchema.index({ createdAt: -1 });

// Virtuals
messageSchema.virtual('replies', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'parentMessage'
});

// Query middleware
messageSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'sender',
    select: 'firstName lastName email profileImage role'
  });
  
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
