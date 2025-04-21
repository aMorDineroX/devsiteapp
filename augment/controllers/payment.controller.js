const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order, Project } = require('../models');
const { AppError } = require('../middleware/error.middleware');
const config = require('../config');

/**
 * Créer une session de paiement Stripe
 * @route POST /api/v1/payments/create-checkout-session
 * @access Private
 */
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return next(new AppError('ID de commande requis', 400));
    }
    
    // Récupérer la commande
    const order = await Order.findById(orderId).populate('services.service');
    
    if (!order) {
      return next(new AppError('Commande non trouvée', 404));
    }
    
    // Vérifier si l'utilisateur a le droit de payer cette commande
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à payer cette commande', 403));
    }
    
    // Vérifier si la commande n'est pas déjà payée
    if (order.status === 'payée' || order.status === 'livrée') {
      return next(new AppError('Cette commande a déjà été payée', 400));
    }
    
    // Créer les line items pour Stripe
    const lineItems = order.services.map(item => {
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.service.title,
            description: item.service.shortDescription,
            images: item.service.image ? [`${config.server.appUrl}/uploads/${item.service.image}`] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
        },
        quantity: item.quantity || 1,
      };
    });
    
    // Créer la session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${config.server.appUrl}/dashboard/orders/${order._id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.server.appUrl}/dashboard/orders/${order._id}/cancel`,
      client_reference_id: order._id.toString(),
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id,
        projectId: order.project ? order.project.toString() : null
      }
    });
    
    res.status(200).json({
      status: 'success',
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifier le statut d'une session de paiement
 * @route GET /api/v1/payments/check-session/:sessionId
 * @access Private
 */
exports.checkSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return next(new AppError('ID de session requis', 400));
    }
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return next(new AppError('Session non trouvée', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        session
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook pour les événements Stripe
 * @route POST /api/v1/payments/webhook
 * @access Public
 */
exports.webhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.stripe.webhookSecret
    );
  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  
  // Gérer les événements
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.status(200).json({ received: true });
};

/**
 * Gérer l'événement checkout.session.completed
 * @param {Object} session - Session Stripe
 */
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const orderId = session.metadata.orderId;
    
    if (!orderId) {
      console.error('Aucun ID de commande trouvé dans les métadonnées de la session');
      return;
    }
    
    // Mettre à jour la commande
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error(`Commande non trouvée avec l'ID: ${orderId}`);
      return;
    }
    
    order.status = 'payée';
    order.paymentId = session.payment_intent;
    order.paymentDate = new Date();
    await order.save();
    
    // Si un projet est associé, mettre à jour son statut
    if (session.metadata.projectId) {
      const project = await Project.findById(session.metadata.projectId);
      
      if (project) {
        // Mettre à jour le montant payé
        project.paidAmount = order.totalAmount;
        
        // Si le projet est nouveau, le passer en cours
        if (project.status === 'nouveau') {
          project.status = 'en cours';
          project.startDate = new Date();
        }
        
        await project.save();
      }
    }
  } catch (error) {
    console.error('Erreur lors du traitement de checkout.session.completed:', error);
  }
};

/**
 * Gérer l'événement payment_intent.succeeded
 * @param {Object} paymentIntent - PaymentIntent Stripe
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    // Rechercher la commande associée à ce paiement
    const order = await Order.findOne({ paymentId: paymentIntent.id });
    
    if (!order) {
      console.error(`Aucune commande trouvée avec le paymentId: ${paymentIntent.id}`);
      return;
    }
    
    // Mettre à jour le statut si ce n'est pas déjà fait
    if (order.status !== 'payée' && order.status !== 'livrée') {
      order.status = 'payée';
      order.paymentDate = new Date();
      await order.save();
    }
  } catch (error) {
    console.error('Erreur lors du traitement de payment_intent.succeeded:', error);
  }
};

/**
 * Gérer l'événement payment_intent.payment_failed
 * @param {Object} paymentIntent - PaymentIntent Stripe
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    // Rechercher la commande associée à ce paiement
    const order = await Order.findOne({ paymentId: paymentIntent.id });
    
    if (!order) {
      console.error(`Aucune commande trouvée avec le paymentId: ${paymentIntent.id}`);
      return;
    }
    
    // Mettre à jour le statut
    order.status = 'en attente';
    await order.save();
  } catch (error) {
    console.error('Erreur lors du traitement de payment_intent.payment_failed:', error);
  }
};
