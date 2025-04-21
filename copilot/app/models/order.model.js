const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['en attente', 'payée', 'en cours', 'livrée', 'annulée'],
    default: 'en attente'
  },
  paymentStatus: {
    type: String,
    enum: ['en attente', 'payé', 'remboursé', 'échoué'],
    default: 'en attente'
  },
  paymentMethod: {
    type: String,
    enum: ['carte bancaire', 'virement bancaire', 'paypal'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    paymentDate: Date,
    receiptUrl: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    company: String,
    address: String,
    city: String,
    zipCode: String,
    country: String,
    email: String,
    phone: String
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Méthode pour générer un ID de commande unique
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderId = `CMD-${year}${month}${day}-${random}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;