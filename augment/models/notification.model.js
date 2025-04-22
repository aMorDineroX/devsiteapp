const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Une notification doit avoir un destinataire']
  },
  title: {
    type: String,
    required: [true, 'Une notification doit avoir un titre']
  },
  message: {
    type: String,
    required: [true, 'Une notification doit avoir un message']
  },
  type: {
    type: String,
    enum: {
      values: ['info', 'success', 'warning', 'error'],
      message: 'Le type doit être: info, success, warning ou error'
    },
    default: 'info'
  },
  link: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Project', 'Order', 'Service', 'Message']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
