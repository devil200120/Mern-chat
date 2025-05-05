import React from "react";
const BACKEND_URL = "https://mern-chat-application-nlxu.onrender.com";
const ActiveFriend = ({ user, setCurrentFriend }) => {
  return (
    <div
      onClick={() =>
        setCurrentFriend({
          _id: user.userInfo.id,
          email: user.userInfo.email,
          image: user.userInfo.image,
          userName: user.userInfo.userName,
        })
      }
      className="active-friend"
    >
      <div className="image-active-icon">
        <div className="image">
          <img 
            src={`${BACKEND_URL}/image/${user.userInfo.image}`} 
            alt="" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${BACKEND_URL}/image/default-profile-picture1.png`;
            }}
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
