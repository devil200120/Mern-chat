import React from "react";
import PropTypes from 'prop-types'; // Added for prop validation

const ActiveFriend = ({ user, setCurrentFriend }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://mern-chat-application-nlxu.onrender.com";

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite error loop
    e.target.src = `${BACKEND_URL}/uploads/default-profile-picture1.png`;
  };

  return (
    <div
      onClick={() => setCurrentFriend({
        _id: user.userInfo.id,
        email: user.userInfo.email,
        image: user.userInfo.image,
        userName: user.userInfo.userName
      })}
      className="active-friend"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setCurrentFriend(user.userInfo)}
    >
      <div className="image-active-icon">
        <div className="image">
          <img 
            src={`${BACKEND_URL}/uploads/${user.userInfo.image}`} 
            alt={`Profile of ${user.userInfo.userName}`}
            onError={handleImageError}
            loading="lazy" // Added for performance
          />
          <div className="active-icon"></div>
        </div>
      </div>
      <div className="user-name">
        {user.userInfo.userName}
      </div>
    </div>
  );
};




export default ActiveFriend;
