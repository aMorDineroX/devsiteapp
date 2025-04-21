const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  title: {
    type: String,
    trim: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageDate: {
    type: Date
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  isArchived: {
    type: Boolean,
    default: false
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
conversationSchema.index({ participants: 1 });
conversationSchema.index({ project: 1 });
conversationSchema.index({ lastMessageDate: -1 });

// Query middleware
conversationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'participants',
    select: 'firstName lastName email profileImage role'
  }).populate({
    path: 'lastMessage'
  });
  
  if (this.options._recursed) {
    return next();
  }
  
  this.populate({
    path: 'project',
    select: 'name'
  });
  
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
