const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Une commande doit être associée à un utilisateur']
  },
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Une commande doit contenir au moins un service']
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, 'La quantité doit être au moins 1']
    },
    price: {
      type: Number,
      required: [true, 'Un service doit avoir un prix']
    }
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  totalAmount: {
    type: Number,
    required: [true, 'Une commande doit avoir un montant total']
  },
  status: {
    type: String,
    enum: {
      values: ['en attente', 'payée', 'en cours', 'livrée', 'annulée'],
      message: 'Le statut doit être: en attente, payée, en cours, livrée ou annulée'
    },
    default: 'en attente'
  },
  paymentMethod: {
    type: String,
    enum: ['carte', 'virement', 'paypal'],
    required: [true, 'Une commande doit avoir une méthode de paiement']
  },
  paymentId: String,
  paymentDate: Date,
  invoiceNumber: {
    type: String,
    unique: true
  },
  invoiceUrl: String,
  notes: String,
  billingAddress: {
    firstName: String,
    lastName: String,
    company: String,
    address: String,
    city: String,
    zipCode: String,
    country: String,
    phoneNumber: String,
    email: String
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
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// Génération automatique du numéro de facture
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    // Trouver le dernier numéro de facture pour ce mois
    const lastOrder = await this.constructor.findOne({
      invoiceNumber: { $regex: `^INV-${year}${month}` }
    }).sort({ invoiceNumber: -1 });
    
    let number = 1;
    if (lastOrder && lastOrder.invoiceNumber) {
      const lastNumber = parseInt(lastOrder.invoiceNumber.split('-')[2]);
      number = lastNumber + 1;
    }
    
    this.invoiceNumber = `INV-${year}${month}-${number.toString().padStart(4, '0')}`;
  }
  next();
});

// Query middleware
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email'
  }).populate({
    path: 'services.service',
    select: 'title price'
  });
  
  next();
});

// Virtuals
orderSchema.virtual('isPaid').get(function() {
  return this.status === 'payée' || this.status === 'en cours' || this.status === 'livrée';
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
