import React from 'react';
import { FaCaretSquareDown } from "react-icons/fa";

// Use environment variable or fallback to your Render backend URL
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mern-chat-application-nlxu.onrender.com';


const FriendInfo = ({ currentfriend, activeUser, message }) => {
  // Check if current friend is active
  const isActive = activeUser && activeUser.length > 0 && activeUser.some(u => u.userId === currentfriend._id);

  // Fallback to default image if image fails to load
  const handleImgError = (e) => {
    e.target.onerror = null;
    e.target.src = `${BACKEND_URL}/uploads/default-profile-picture1.png`;
  };

  return (
    <aside className='friend-info'>
      <input type="checkbox" id='gallery' />
      <div className='image-name'>
        <div className='image'>
          <img
            src={`${BACKEND_URL}/uploads/${currentfriend.image}`}
            alt={`Profile of ${currentfriend.userName}`}
            onError={handleImgError}
          />
        </div>
        {isActive ? <div className='active-user'>Active</div> : null}
        <div className='name'>
          <h4>{currentfriend.userName}</h4>
        </div>
      </div>

      <section className='others'>
        <div className='custom-chat'>
          <h3>Customise Chat</h3>
          <FaCaretSquareDown />
        </div>
        <div className='privacy'>
          <h3>Privacy and Support</h3>
          <FaCaretSquareDown />
        </div>
        <div className='media'>
          <h3>Shared Media</h3>
          <label htmlFor='gallery' tabIndex={0} aria-label="Show shared media">
            <FaCaretSquareDown />
          </label>
        </div>
      </section>

      <section className='gallery' aria-label="Shared images">
        {message && message.length > 0
          ? message.map((m, index) =>
              m.message.image ? (
                <img
                  key={index}
                  src={`${BACKEND_URL}/uploads/${m.message.image}`}
                  alt={`Shared media ${index + 1}`}
                  onError={handleImgError}
                />
              ) : null
            )
          : null}
      </section>
    </aside>
  );
};

export default FriendInfo;
