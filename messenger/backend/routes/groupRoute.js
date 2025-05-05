const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  createGroup, 
  getGroups, 
  getGroupMessages, 
  sendGroupMessage,
  sendGroupImageMessage
} = require('../controller/groupController');

router.post('/create-group', authMiddleware, createGroup);
router.get('/get-groups', authMiddleware, getGroups);
router.get('/get-group-messages/:id', authMiddleware, getGroupMessages);
router.post('/send-group-message', authMiddleware, sendGroupMessage);
router.post('/send-group-image-message', authMiddleware, sendGroupImageMessage);

module.exports = router;
