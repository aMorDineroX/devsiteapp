const { Message, Conversation, User, Project } = require('../models');
const { AppError } = require('../middleware/error.middleware');
const notificationController = require('./notification.controller');

/**
 * Obtenir toutes les conversations de l'utilisateur
 * @route GET /api/v1/messages/conversations
 * @access Private
 */
exports.getConversations = async (req, res, next) => {
  try {
    // Construire la requête
    const query = {
      participants: req.user.id
    };
    
    // Filtrer par projet si spécifié
    if (req.query.project) {
      query.project = req.query.project;
    }
    
    // Filtrer par statut (archivé ou non)
    if (req.query.archived === 'true') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Exécuter la requête
    const conversations = await Conversation.find(query)
      .sort({ lastMessageDate: -1 })
      .skip(skip)
      .limit(limit);
    
    // Compter le nombre total de conversations
    const total = await Conversation.countDocuments(query);
    
    // Envoyer la réponse
    res.status(200).json({
      status: 'success',
      results: conversations.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: {
        conversations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir une conversation par ID
 * @route GET /api/v1/messages/conversations/:id
 * @access Private
 */
exports.getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette conversation', 403));
    }
    
    // Obtenir les messages de la conversation
    const messages = await Message.find({
      $or: [
        { _id: conversation.lastMessage },
        { parentMessage: conversation.lastMessage }
      ]
    }).sort({ createdAt: 1 });
    
    // Mettre à jour le compteur de messages non lus
    const unreadCount = conversation.unreadCount.get(req.user.id.toString()) || 0;
    if (unreadCount > 0) {
      conversation.unreadCount.set(req.user.id.toString(), 0);
      await conversation.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        conversation,
        messages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Créer une nouvelle conversation
 * @route POST /api/v1/messages/conversations
 * @access Private
 */
exports.createConversation = async (req, res, next) => {
  try {
    const { participants, project, title } = req.body;
    
    // Vérifier si les participants existent
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return next(new AppError('Veuillez fournir au moins un participant', 400));
    }
    
    // Ajouter l'utilisateur actuel aux participants s'il n'y est pas déjà
    if (!participants.includes(req.user.id)) {
      participants.push(req.user.id);
    }
    
    // Vérifier si les utilisateurs existent
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return next(new AppError('Un ou plusieurs utilisateurs n\'existent pas', 400));
    }
    
    // Vérifier si le projet existe si spécifié
    if (project) {
      const projectExists = await Project.findById(project);
      if (!projectExists) {
        return next(new AppError('Projet non trouvé', 404));
      }
    }
    
    // Créer la conversation
    const conversation = await Conversation.create({
      participants,
      project,
      title: title || `Conversation du ${new Date().toLocaleDateString('fr-FR')}`,
      lastMessageDate: new Date()
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        conversation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Envoyer un message
 * @route POST /api/v1/messages
 * @access Private
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, recipient, subject, content, project, parentMessage } = req.body;
    
    let conversation;
    
    // Si conversationId est fourni, utiliser la conversation existante
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      
      if (!conversation) {
        return next(new AppError('Conversation non trouvée', 404));
      }
      
      // Vérifier si l'utilisateur est un participant
      if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
        return next(new AppError('Vous n\'êtes pas autorisé à accéder à cette conversation', 403));
      }
    } 
    // Sinon, créer une nouvelle conversation
    else if (recipient) {
      // Vérifier si le destinataire existe
      const recipientUser = await User.findById(recipient);
      if (!recipientUser) {
        return next(new AppError('Destinataire non trouvé', 404));
      }
      
      // Vérifier si une conversation existe déjà entre ces utilisateurs
      conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, recipient] },
        project: project || null
      });
      
      // Si aucune conversation n'existe, en créer une nouvelle
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user.id, recipient],
          project,
          title: subject || `Conversation du ${new Date().toLocaleDateString('fr-FR')}`,
          lastMessageDate: new Date()
        });
      }
    } else {
      return next(new AppError('Veuillez fournir un ID de conversation ou un destinataire', 400));
    }
    
    // Créer le message
    const message = await Message.create({
      sender: req.user.id,
      recipient: conversation.participants.find(p => p._id.toString() !== req.user.id)._id,
      project: conversation.project,
      subject: subject || conversation.title,
      content,
      parentMessage: parentMessage || null
    });
    
    // Mettre à jour la conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageDate = new Date();
    
    // Mettre à jour le compteur de messages non lus pour tous les participants sauf l'expéditeur
    conversation.participants.forEach(participant => {
      if (participant._id.toString() !== req.user.id) {
        const currentCount = conversation.unreadCount.get(participant._id.toString()) || 0;
        conversation.unreadCount.set(participant._id.toString(), currentCount + 1);
      }
    });
    
    await conversation.save();
    
    // Envoyer une notification au destinataire
    conversation.participants.forEach(async participant => {
      if (participant._id.toString() !== req.user.id) {
        await notificationController.createNotification({
          userId: participant._id.toString(),
          title: 'Nouveau message',
          message: `Vous avez reçu un nouveau message de ${req.user.firstName} ${req.user.lastName}`,
          type: 'info',
          link: `/dashboard/messages/conversations/${conversation._id}`
        });
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        message,
        conversation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer un message comme lu
 * @route PATCH /api/v1/messages/:id/read
 * @access Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return next(new AppError('Message non trouvé', 404));
    }
    
    // Vérifier si l'utilisateur est le destinataire
    if (message.recipient.toString() !== req.user.id) {
      return next(new AppError('Vous n\'êtes pas autorisé à marquer ce message comme lu', 403));
    }
    
    // Marquer le message comme lu
    message.isRead = true;
    await message.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        message
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Archiver une conversation
 * @route PATCH /api/v1/messages/conversations/:id/archive
 * @access Private
 */
exports.archiveConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return next(new AppError('Vous n\'êtes pas autorisé à archiver cette conversation', 403));
    }
    
    // Archiver la conversation
    conversation.isArchived = true;
    await conversation.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        conversation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Désarchiver une conversation
 * @route PATCH /api/v1/messages/conversations/:id/unarchive
 * @access Private
 */
exports.unarchiveConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return next(new AppError('Conversation non trouvée', 404));
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return next(new AppError('Vous n\'êtes pas autorisé à désarchiver cette conversation', 403));
    }
    
    // Désarchiver la conversation
    conversation.isArchived = false;
    await conversation.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        conversation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir le nombre de messages non lus
 * @route GET /api/v1/messages/unread-count
 * @access Private
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    // Obtenir toutes les conversations de l'utilisateur
    const conversations = await Conversation.find({
      participants: req.user.id
    });
    
    // Calculer le nombre total de messages non lus
    let unreadCount = 0;
    conversations.forEach(conversation => {
      unreadCount += conversation.unreadCount.get(req.user.id.toString()) || 0;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};
