import moment from 'moment';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FaRegCheckCircle } from "react-icons/fa";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mern-chat-application-nlxu.onrender.com';

const DEFAULT_AVATAR = `${BACKEND_URL}/uploads/default-profile-picture1.png`;

const Message = ({ message, currentfriend, scrollRef, typingMessage }) => {
  const { myInfo } = useSelector(state => state.auth);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [message, typingMessage]);

  const formatTimestamp = (timestamp) => {
    const messageDate = moment(timestamp);
    const now = moment();
    if (now.diff(messageDate, 'days') < 1) {
      return messageDate.format('h:mm A');
    } else if (now.diff(messageDate, 'days') < 7) {
      return messageDate.format('ddd h:mm A');
    } else {
      return messageDate.format('MMM D, YYYY');
    }
  };

  const renderImage = (src, alt = 'Shared image') => (
    <img
      src={src}
      alt={alt}
      onError={e => { 
        e.target.onerror = null; 
        e.target.src = DEFAULT_AVATAR; 
      }}
      loading="lazy"
    />
  );

  const renderMessageContent = (m) =>
    m.message.text
      ? m.message.text
      : renderImage(`${BACKEND_URL}/uploads/${m.message.image}`);

  const renderStatus = (m) => (
    <div className="message-status">
      {m.status === 'seen' ? (
        <img
          className="status-avatar"
          src={`${BACKEND_URL}/uploads/${currentfriend.image}`}
          alt={`Seen by ${currentfriend.userName}`}
          onError={e => { 
            e.target.onerror = null; 
            e.target.src = DEFAULT_AVATAR; 
          }}
        />
      ) : (
        <span className={m.status === 'delivared' ? "status-delivered" : "status-sent"}>
          <FaRegCheckCircle />
        </span>
      )}
    </div>
  );

  return (
    <>
      <div className='message-show' ref={containerRef}>
        {message && message.length > 0 ? (
          message.map((m, index) => {
            const isMyMessage = m.senderId === myInfo.id;
            const isLast = index === message.length - 1;
            const messageKey = m._id || index;

            return isMyMessage ? (
              <div
                key={messageKey}
                ref={isLast ? scrollRef : null}
                className='my-message'
              >
                <div className='image-message'>
                  <div className='my-text'>
                    <p className='message-text'>
                      {renderMessageContent(m)}
                    </p>
                    {isLast && renderStatus(m)}
                  </div>
                </div>
                <div className='time'>{formatTimestamp(m.createdAt)}</div>
              </div>
            ) : (
              <div
                key={messageKey}
                ref={isLast ? scrollRef : null}
                className='fd-message'
              >
                <div className='image-message-time'>
                  {renderImage(
                    `${BACKEND_URL}/uploads/${currentfriend.image}`, 
                    currentfriend.userName
                  )}
                  <div className='message-time'>
                    <div className='fd-text'>
                      <p className='message-text'>{renderMessageContent(m)}</p>
                    </div>
                    <div className='time'>{formatTimestamp(m.createdAt)}</div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className='friend_connect'>
            {renderImage(
              `${BACKEND_URL}/uploads/${currentfriend.image}`, 
              currentfriend.userName
            )}
            <h3>{currentfriend.userName} Connect You</h3>
            <span>
              {moment(currentfriend.createdAt).fromNow()}
            </span>
          </div>
        )}
      </div>

      {/* Typing indicator */}
      {typingMessage && typingMessage.msg && typingMessage.senderId === currentfriend._id && (
        <div className='typing-message'>
          <div className='fd-message'>
            <div className='image-message-time'>
              {renderImage(
                `${BACKEND_URL}/uploads/${currentfriend.image}`, 
                currentfriend.userName
              )}
              <div className='message-time'>
                <div className='fd-text'>
                  <p className="message-text typing-animation">
                    Typing<span>.</span><span>.</span><span>.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
