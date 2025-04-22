const { Order, Service, Project } = require('../models');
const { AppError } = require('../middleware/error.middleware');

/**
 * Obtenir toutes les commandes
 * @route GET /api/v1/orders
 * @access Private
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    // Construire la requête
    let query = {};

    // Si l'utilisateur n'est pas admin, il ne peut voir que ses propres commandes
    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    }

    // Filtrer par statut si spécifié
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filtrer par utilisateur si spécifié (admin uniquement)
    if (req.query.user && req.user.role === 'admin') {
      query.user = req.query.user;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Exécuter la requête
    const orders = await Order.find(query)
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit);

    // Compter le nombre total de commandes
    const total = await Order.countDocuments(query);

    // Envoyer la réponse
    res.status(200).json({
      status: 'success',
      results: orders.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir une commande par ID
 * @route GET /api/v1/orders/:id
 * @access Private
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Aucune commande trouvée avec cet ID', 404));
    }

    // Vérifier si l'utilisateur a le droit de voir cette commande
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette commande', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une nouvelle commande
 * @route POST /api/v1/orders
 * @access Private
 */
exports.createOrder = async (req, res, next) => {
  try {
    // Si l'utilisateur n'est pas admin, il ne peut créer que des commandes pour lui-même
    if (req.user.role !== 'admin') {
      req.body.user = req.user.id;
    }

    // Vérifier que les services existent et calculer le montant total
    if (!req.body.services || !Array.isArray(req.body.services) || req.body.services.length === 0) {
      return next(new AppError('Veuillez fournir au moins un service', 400));
    }

    let totalAmount = 0;

    // Vérifier chaque service et calculer le montant total
    for (const item of req.body.services) {
      const service = await Service.findById(item.service);

      if (!service) {
        return next(new AppError(`Service non trouvé avec l'ID: ${item.service}`, 404));
      }

      item.price = service.price;
      totalAmount += service.price * (item.quantity || 1);
    }

    // Mettre à jour le montant total
    req.body.totalAmount = totalAmount;

    // Créer la commande
    const newOrder = await Order.create(req.body);

    // Si un projet est associé, mettre à jour le montant total du projet
    if (req.body.project) {
      const project = await Project.findById(req.body.project);

      if (project) {
        project.totalAmount = totalAmount;
        await project.save();
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une commande
 * @route PATCH /api/v1/orders/:id
 * @access Private (Admin)
 */
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Aucune commande trouvée avec cet ID', 404));
    }

    // Seul un admin peut modifier une commande
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à modifier cette commande', 403));
    }

    // Mettre à jour la commande
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        order: updatedOrder
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une commande
 * @route DELETE /api/v1/orders/:id
 * @access Private (Admin)
 */
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Aucune commande trouvée avec cet ID', 404));
    }

    // Seul un admin peut supprimer une commande
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à supprimer cette commande', 403));
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le statut d'une commande
 * @route PATCH /api/v1/orders/:id/status
 * @access Private (Admin)
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('Aucune commande trouvée avec cet ID', 404));
    }

    // Seul un admin peut changer le statut d'une commande
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à changer le statut de cette commande', 403));
    }

    order.status = req.body.status;

    // Mettre à jour la date de paiement si le statut est "payée"
    if (req.body.status === 'payée' && !order.paymentDate) {
      order.paymentDate = Date.now();
    }

    await order.save();

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Générer une facture pour une commande
 * @route POST /api/v1/orders/:id/invoice
 * @access Private (Admin)
 */
exports.generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'firstName lastName email company address'
      })
      .populate({
        path: 'services.service',
        select: 'title description price'
      });

    if (!order) {
      return next(new AppError('Aucune commande trouvée avec cet ID', 404));
    }

    // Seul un admin peut générer une facture
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à générer une facture', 403));
    }

    // Générer la facture PDF
    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    // Créer le répertoire des factures s'il n'existe pas
    const invoicesDir = path.join(__dirname, '..', 'public', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Chemin de la facture
    const invoicePath = path.join(invoicesDir, `${order.invoiceNumber}.pdf`);

    // Créer un nouveau document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Pipe le PDF dans un fichier
    doc.pipe(fs.createWriteStream(invoicePath));

    // En-tête de la facture
    doc.fontSize(20).text('FACTURE', { align: 'center' });
    doc.moveDown();

    // Informations de l'entreprise
    doc.fontSize(12).text('DevCraft', { align: 'left' });
    doc.fontSize(10).text('123 Rue du Web', { align: 'left' });
    doc.text('75000 Paris, France', { align: 'left' });
    doc.text('Email: contact@devcraft.com', { align: 'left' });
    doc.text('Téléphone: +33 1 23 45 67 89', { align: 'left' });
    doc.moveDown();

    // Informations du client
    doc.fontSize(12).text('Facturé à:', { align: 'left' });
    doc.fontSize(10).text(`${order.user.firstName} ${order.user.lastName}`, { align: 'left' });
    if (order.user.company) doc.text(order.user.company, { align: 'left' });
    if (order.billingAddress) {
      doc.text(order.billingAddress.address || '', { align: 'left' });
      doc.text(`${order.billingAddress.zipCode || ''} ${order.billingAddress.city || ''}`, { align: 'left' });
      doc.text(order.billingAddress.country || '', { align: 'left' });
    }
    doc.text(`Email: ${order.user.email}`, { align: 'left' });
    doc.moveDown();

    // Informations de la facture
    doc.fontSize(12).text('Détails de la facture:', { align: 'left' });
    doc.fontSize(10).text(`Numéro de facture: ${order.invoiceNumber}`, { align: 'left' });
    doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'left' });
    doc.text(`Statut: ${order.status}`, { align: 'left' });
    doc.moveDown();

    // Tableau des services
    doc.fontSize(12).text('Services:', { align: 'left' });
    doc.moveDown();

    // En-têtes du tableau
    const tableTop = doc.y;
    const tableHeaders = ['Service', 'Description', 'Prix unitaire', 'Quantité', 'Total'];
    const tableColumnWidths = [150, 200, 70, 50, 70];

    // Dessiner les en-têtes
    doc.fontSize(10);
    let currentX = 50;
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX, tableTop, { width: tableColumnWidths[i], align: 'left' });
      currentX += tableColumnWidths[i];
    });

    // Ligne de séparation
    doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Contenu du tableau
    let tableY = tableTop + 30;

    // Ajouter chaque service
    order.services.forEach((item, index) => {
      const service = item.service;
      const quantity = item.quantity || 1;
      const price = item.price;
      const total = price * quantity;

      currentX = 50;

      // Nom du service
      doc.text(service.title, currentX, tableY, { width: tableColumnWidths[0], align: 'left' });
      currentX += tableColumnWidths[0];

      // Description
      const description = service.description.length > 50 ? service.description.substring(0, 50) + '...' : service.description;
      doc.text(description, currentX, tableY, { width: tableColumnWidths[1], align: 'left' });
      currentX += tableColumnWidths[1];

      // Prix unitaire
      doc.text(`${price.toFixed(2)} €`, currentX, tableY, { width: tableColumnWidths[2], align: 'right' });
      currentX += tableColumnWidths[2];

      // Quantité
      doc.text(quantity.toString(), currentX, tableY, { width: tableColumnWidths[3], align: 'center' });
      currentX += tableColumnWidths[3];

      // Total
      doc.text(`${total.toFixed(2)} €`, currentX, tableY, { width: tableColumnWidths[4], align: 'right' });

      tableY += 30;
    });

    // Ligne de séparation
    doc.moveTo(50, tableY).lineTo(550, tableY).stroke();

    // Total
    doc.text('Total:', 380, tableY + 10, { width: 100, align: 'right' });
    doc.text(`${order.totalAmount.toFixed(2)} €`, 480, tableY + 10, { width: 70, align: 'right' });

    // Pied de page
    doc.fontSize(10).text('Merci pour votre confiance!', 50, 700, { align: 'center' });
    doc.text('Cette facture a été générée automatiquement.', 50, 715, { align: 'center' });

    // Finaliser le PDF
    doc.end();

    // Mettre à jour l'URL de la facture dans la commande
    order.invoiceUrl = `/invoices/${order.invoiceNumber}.pdf`;
    await order.save();

    res.status(200).json({
      status: 'success',
      data: {
        order,
        invoiceUrl: order.invoiceUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir les statistiques des commandes
 * @route GET /api/v1/orders/stats
 * @access Private (Admin)
 */
exports.getOrderStats = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à ces statistiques', 403));
    }

    const stats = await Order.aggregate([
      {
        $match: { status: { $ne: 'annulée' } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};
