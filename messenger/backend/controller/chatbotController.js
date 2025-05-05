const ChatbotConversation = require('../models/chatbotModel');
const OpenAI = require('openai');

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: "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"
});

// Helper to get or create a conversation
const getConversation = async (userId) => {
  let conversation = await ChatbotConversation.findOne({ userId });
  if (!conversation) {
    conversation = await ChatbotConversation.create({
      userId,
      messages: []
    });
  }
  return conversation;
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.myId;

    if (!message) {
      return res.status(400).json({
        error: { errorMessage: ['Message is required'] }
      });
    }

    // Get or create conversation
    const conversation = await getConversation(userId);

    // Add user message to conversation
    conversation.messages.push({
      content: message,
      role: 'user'
    });

    // Prepare messages for OpenAI API (last 10 messages for context)
    const recentMessages = conversation.messages.slice(-10).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add system message for context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant in a messaging application. Provide concise, friendly responses.'
      },
      ...recentMessages
    ];

    // Get response from OpenAI - UPDATED FOR v4
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const botResponse = completion.choices[0].message.content;

    // Add bot response to conversation
    conversation.messages.push({
      content: botResponse,
      role: 'bot'
    });

    // Save conversation
    await conversation.save();

    // Return the bot response
    res.status(200).json({
        success: true,
        message: {
          role: 'bot', // Required for frontend message mapping
          content: botResponse, // Frontend expects 'content' not 'message.text'
          timestamp: new Date() // Needed for display
        }
      });
    // Add this to your chatbotController.js sendMessage function
console.log('Received message:', message);
console.log('Environment Key:', process.env.OPENAI_API_KEY?.slice(0,5)+'...');
console.log('Messages sent to OpenAI:', messages);

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      error: { errorMessage: ['Failed to get response from chatbot'] }
    });
  }
};
exports.getConversationHistory = async (req, res) => {
  try {
    const userId = req.myId;
    const conversation = await getConversation(userId);

    res.status(200).json({
      success: true,
      messages: conversation.messages
    });
  } catch (error) {
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};

exports.clearConversation = async (req, res) => {
  try {
    const userId = req.myId;
    const conversation = await getConversation(userId);
    
    conversation.messages = [];
    await conversation.save();
    
    res.status(200).json({
      success: true,
      message: 'Conversation cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: { errorMessage: ['Internal Server Error'] }
    });
  }
};
