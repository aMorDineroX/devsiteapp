const { User } = require('../models');
const { AppError } = require('../middleware/error.middleware');

// Simuler une base de données de notifications
// Dans une application réelle, vous utiliseriez un modèle Mongoose
let notifications = [];

/**
 * Créer une nouvelle notification
 * @param {Object} data - Données de la notification
 * @returns {Object} - Notification créée
 */
exports.createNotification = async (data) => {
  try {
    const notification = {
      id: Date.now().toString(),
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info', // info, success, warning, error
      link: data.link || null,
      isRead: false,
      createdAt: new Date()
    };
    
    notifications.push(notification);
    
    // Dans une application réelle, vous pourriez envoyer la notification en temps réel
    // via WebSockets ou Server-Sent Events
    
    return notification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
};

/**
 * Obtenir les notifications d'un utilisateur
 * @route GET /api/v1/notifications
 * @access Private
 */
exports.getNotifications = async (req, res, next) => {
  try {
    // Filtrer les notifications de l'utilisateur
    const userNotifications = notifications.filter(
      notification => notification.userId === req.user.id
    );
    
    // Trier par date (les plus récentes d'abord)
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
    
    res.status(200).json({
      status: 'success',
      results: paginatedNotifications.length,
      pagination: {
        total: userNotifications.length,
        page,
        pages: Math.ceil(userNotifications.length / limit),
        limit
      },
      data: {
        notifications: paginatedNotifications
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer une notification comme lue
 * @route PATCH /api/v1/notifications/:id/read
 * @access Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Trouver la notification
    const notificationIndex = notifications.findIndex(
      notification => notification.id === id && notification.userId === req.user.id
    );
    
    if (notificationIndex === -1) {
      return next(new AppError('Notification non trouvée', 404));
    }
    
    // Marquer comme lue
    notifications[notificationIndex].isRead = true;
    
    res.status(200).json({
      status: 'success',
      data: {
        notification: notifications[notificationIndex]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marquer toutes les notifications comme lues
 * @route PATCH /api/v1/notifications/read-all
 * @access Private
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    // Marquer toutes les notifications de l'utilisateur comme lues
    notifications.forEach(notification => {
      if (notification.userId === req.user.id) {
        notification.isRead = true;
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une notification
 * @route DELETE /api/v1/notifications/:id
 * @access Private
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Trouver la notification
    const notificationIndex = notifications.findIndex(
      notification => notification.id === id && notification.userId === req.user.id
    );
    
    if (notificationIndex === -1) {
      return next(new AppError('Notification non trouvée', 404));
    }
    
    // Supprimer la notification
    notifications.splice(notificationIndex, 1);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer toutes les notifications
 * @route DELETE /api/v1/notifications
 * @access Private
 */
exports.deleteAllNotifications = async (req, res, next) => {
  try {
    // Supprimer toutes les notifications de l'utilisateur
    notifications = notifications.filter(
      notification => notification.userId !== req.user.id
    );
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtenir le nombre de notifications non lues
 * @route GET /api/v1/notifications/unread-count
 * @access Private
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    // Compter les notifications non lues de l'utilisateur
    const unreadCount = notifications.filter(
      notification => notification.userId === req.user.id && !notification.isRead
    ).length;
    
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
