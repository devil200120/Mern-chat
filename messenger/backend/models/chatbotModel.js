// models/chatbotModel.js
const { model, Schema } = require('mongoose');

const chatbotConversationSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  messages: [{
    content: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  context: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = model('chatbotConversation', chatbotConversationSchema);
