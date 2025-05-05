import React from 'react';
import { FaPhoneAlt, FaVideo, FaRocketchat } from "react-icons/fa";
import FriendInfo from './FriendInfo';
import Message from './Message';
import MessageSend from './MessageSend';

const BACKEND_URL = "https://mern-chat-application-nlxu.onrender.com"

const RightSide = (props) => {
  const {currentfriend, inputHendle, newMessage, sendMessage, message, scrollRef, emojiSend, ImageSend, activeUser, typingMessage, handleVideoCall} = props;
 
  return ( 
       <div className='col-9'>
            <div className='right-side'>
                 <input type="checkbox" id='dot' />
                 <div className='row'>
                      <div className='col-8'>
                        <div className='message-send-show'>
                            <div className='header'>
                                <div className='image-name'>
                                    <div className='image'>
                                        <img 
                                            src={`${BACKEND_URL}/image/${currentfriend.image}`} 
                                            alt='' 
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `${BACKEND_URL}/image/default-profile-picture1.png`;
                                            }}
                                        />

                                        {activeUser && activeUser.length > 0 && activeUser.some(u => u.userId === currentfriend._id) ? 
                                          <div className='active-icon'></div> : ''}                   
                                    </div>
                                    <div className='name'>
                                        <h3>{currentfriend.userName}</h3>
                                    </div>
                                </div>

                                <div className='icons'>
                                    <div className='icon'>
                                        <FaPhoneAlt/>
                                    </div>

                                    <div className='icon' onClick={() => props.handleVideoCall(currentfriend)}>
                                        <FaVideo/>
                                    </div>

                                    <div className='icon'>
                                        <label htmlFor='dot'><FaRocketchat/></label>  
                                    </div>
                                </div>
                            </div>

                            <Message
                                message={message}
                                currentfriend={currentfriend}
                                scrollRef={scrollRef}
                                typingMessage={typingMessage}
                            />

                            <MessageSend
                                inputHendle={inputHendle}
                                newMessage={newMessage}
                                sendMessage={sendMessage}
                                emojiSend={emojiSend}
                                ImageSend={ImageSend}
                            />
                        </div>
                    </div>  

                    <div className='col-4'>
                        <FriendInfo message={message} currentfriend={currentfriend} activeUser={activeUser} />
                    </div>
                </div>
            </div>
       </div>
  )
};

export default RightSide;
