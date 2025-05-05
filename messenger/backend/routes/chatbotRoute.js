// routes/chatbotRoute.js
const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  sendMessage,
  getConversationHistory,
  clearConversation
} = require('../controller/chatbotController');

router.post('/chatbot/send-message', authMiddleware, sendMessage);
router.get('/chatbot/get-history', authMiddleware, getConversationHistory);
router.post('/chatbot/clear-conversation', authMiddleware, clearConversation);

module.exports = router;
