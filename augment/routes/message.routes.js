const express = require('express');
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les conversations
router.get('/conversations', messageController.getConversations);
router.get('/conversations/:id', messageController.getConversation);
router.post('/conversations', messageController.createConversation);
router.patch('/conversations/:id/archive', messageController.archiveConversation);
router.patch('/conversations/:id/unarchive', messageController.unarchiveConversation);

// Routes pour les messages
router.post('/', messageController.sendMessage);
router.patch('/:id/read', messageController.markAsRead);
router.get('/unread-count', messageController.getUnreadCount);

module.exports = router;
