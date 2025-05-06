import React from 'react';
import moment from 'moment';
import { FaRegCheckCircle } from "react-icons/fa";

// Use environment variable for backend URL, fallback to your Render URL
const BACKEND_URL = process.env.REACT_APP_API_URL || "https://mern-chat-hk3u.onrender.com";

const Friends = (props) => {
  const { fndInfo, msgInfo } = props.friend;
  const myId = props.myId;
  const { activeUser } = props;

  // Image error fallback handler
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = `${BACKEND_URL}/uploads/default-profile-picture1.png`;
  };

  // Check if this friend is active
  const isActive = activeUser && activeUser.length > 0 && activeUser.some(u => u.userId === fndInfo._id);

  // Check if the last message is unseen and not sent by me
  const isUnseen = msgInfo?.senderId !== myId && msgInfo?.status !== undefined && msgInfo.status !== 'seen';

  return (
    <div className='friend'>
      <div className='friend-image'>
        <div className='image'>
          <img
            src={`${BACKEND_URL}/uploads/${fndInfo.image}`}
            alt={`Profile of ${fndInfo.userName}`}
            onError={handleImgError}
          />
          {isActive && <div className='active_icon'></div>}
        </div>
      </div>

      <div className='friend-name-seen'>
        <div className='friend-name'>
          <h4 className={isUnseen ? 'unseen_message Fd_name' : 'Fd_name'}>
            {fndInfo.userName}
          </h4>
          <div className='msg-time'>
            {msgInfo && msgInfo.senderId === myId ? (
              <span>You </span>
            ) : (
              <span className={isUnseen ? 'unseen_message' : ''}>
                {fndInfo.userName + ' '}
              </span>
            )}
            {msgInfo && msgInfo.message.text ? (
              <span className={isUnseen ? 'unseen_message' : ''}>
                {msgInfo.message.text.slice(0, 10)}
              </span>
            ) : msgInfo && msgInfo.message.image ? (
              <span>Sent an image</span>
            ) : (
              <span>Connect You</span>
            )}
            <span>
              {' '}
              {msgInfo
                ? moment(msgInfo.createdAt).fromNow()
                : moment(fndInfo.createdAt).fromNow()}
            </span>
          </div>
        </div>

        {myId === msgInfo?.senderId ? (
          <div className='seen-unseen-icon'>
            {msgInfo.status === 'seen' ? (
              <img
                src={`${BACKEND_URL}/uploads/${fndInfo.image}`}
                alt={`Seen by ${fndInfo.userName}`}
                onError={handleImgError}
              />
            ) : msgInfo.status === 'delivared' ? (
              <div className='delivared'><FaRegCheckCircle /></div>
            ) : (
              <div className='unseen'></div>
            )}
          </div>
        ) : (
          <div className='seen-unseen-icon'>
            {msgInfo?.status !== undefined && msgInfo?.status !== 'seen' ? (
              <div className='seen-icon'></div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
