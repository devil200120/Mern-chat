import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaPaperPlane, FaFileImage, FaGift, FaPlusCircle } from 'react-icons/fa';
import { BsRobot } from 'react-icons/bs';
import { 
  getChatbotMessages,
  sendChatbotMessage,
  clearChatbotConversation
} from '../store/actions/messengerAction';

const ChatBot = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const { chatbotMessages } = useSelector(state => state.messenger);
  const [newMessage, setNewMessage] = React.useState('');

  // Load chat history on component mount
  useEffect(() => {
    dispatch(getChatbotMessages());
  }, [dispatch]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatbotMessages]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistically add user message
    const tempMessage = {
      _id: Date.now().toString(),
      content: newMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    dispatch({
      type: 'SOCKET_CHATBOT_MESSAGE',
      payload: tempMessage
    });

    try {
      await dispatch(sendChatbotMessage(newMessage));
      setNewMessage('');
    } catch (error) {
      // Remove temporary message if send fails
      dispatch({
        type: 'REMOVE_CHATBOT_MESSAGE',
        payload: tempMessage._id
      });
    }
  };

  return (
    <div className="right-side">
      <div className="row">
        <div className="col-12">
          <div className="message-send-show">
            <div className="header">
              <div className="image-name">
                <div className="image">
                  <BsRobot className="chatbot-icon" />
                </div>
                <div className="name">
                  <h3>AI Assistant</h3>
                  <span className="chatbot-status">Ready to help</span>
                </div>
              </div>
              <div className="chatbot-actions">
                <button 
                  onClick={() => dispatch(clearChatbotConversation())} 
                  className="btn clear-btn"
                >
                  Clear Conversation
                </button>
              </div>
            </div>

            <div className="message-show">
              {chatbotMessages.length > 0 ? (
                chatbotMessages.map((msg, index) => (
                  <div
                    key={msg._id || index}
                    ref={index === chatbotMessages.length - 1 ? scrollRef : null}
                    className={msg.role === 'user' ? 'my-message' : 'fd-message'}
                  >
                    {msg.role === 'bot' ? (
                      <div className="image-message-time">
                        <div className="chatbot-avatar">
                          <BsRobot />
                        </div>
                        <div className="message-time">
                          <div className="fd-text">
                            <p className="message-text">{msg.content}</p>
                          </div>
                          <div className="time">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="image-message">
                          <div className="my-text">
                            <p className="message-text">{msg.content}</p>
                          </div>
                        </div>
                        <div className="time">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="chatbot-welcome">
                  <div className="chatbot-welcome-icon">
                    <BsRobot />
                  </div>
                  <h3>Welcome to AI Assistant</h3>
                  <p>Ask me anything and I'll try to help you!</p>
                  <div className="example-questions">
                    <p>Some things you can ask:</p>
                    <ul>
                      <li>"How do I create a group chat?"</li>
                      <li>"Can you explain how to make a video call?"</li>
                      <li>"Tell me about this messenger app"</li>
                      <li>"How to send images in chat?"</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="message-send-section">
              <input type="checkbox" id="emoji-chatbot" />
              <div className="file hover-attachment">
                <div className="add-attachment">Add Attachment</div>
                <FaPlusCircle />
              </div>
              <div className="file hover-image">
                <div className="add-image">Add Image</div>
                <input
                  type="file"
                  id="chatbot-pic"
                  className="hidden-file-input"
                  accept="image/*"
                />
                <label htmlFor="chatbot-pic">
                  <FaFileImage />
                </label>
              </div>
              <div className="file hover-gift">
                <div className="add-gift">Add Gift</div>
                <FaGift />
              </div>
              <div className="message-type">
                <input
                  type="text"
                  name="message"
                  id="message"
                  placeholder="Ask me anything..."
                  className="form-control"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(e)}
                />
                <div className="file hover-gift">
                  <label htmlFor="emoji-chatbot">❤️</label>
                </div>
              </div>
              <div 
                className="file send-button"
                onClick={handleSendMessage}
              >
                <FaPaperPlane />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
