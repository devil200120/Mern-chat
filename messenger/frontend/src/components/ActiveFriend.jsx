import React from "react";

const ActiveFriend = ({ user, setCurrentFriend }) => {
  const BACKEND_URL = process.env.REACT_APP_API_URL || "https://mern-chat-hk3u.onrender.com";

  const handleImageError = (e) => {
    e.target.onerror = null; // Prevent infinite loop
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
    >
      <div className="image-active-icon">
        <div className="image">
          <img 
            src={`${BACKEND_URL}/uploads/${user.userInfo.image}`} 
            alt={`Profile of ${user.userInfo.userName}`}
            onError={handleImageError}
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
