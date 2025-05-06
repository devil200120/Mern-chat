import React from "react";
import moment from "moment";

const BACKEND_URL = process.env.REACT_APP_API_URL || "https://mern-chat-hk3u.onrender.com";

const Group = ({ group, setCurrentGroup, currentGroup }) => {
  return (
    <div
      onClick={() => setCurrentGroup(group)}
      className={currentGroup?._id === group._id ? "group active" : "group"}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setCurrentGroup(group);
        }
      }}
    >
      <div className="group-image">
        <div className="image">
          <img
            src={
              group.image 
                ? `${BACKEND_URL}/uploads/${group.image}` 
                : `${BACKEND_URL}/uploads/default-group.png`
            }
            alt={group.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `${BACKEND_URL}/uploads/default-profile-picture1.png`;
            }}
          />
        </div>
      </div>

      <div className="group-name">
        <h4>{group.name}</h4>
        <div className="msg-time">
          <span>{moment(group.updatedAt).fromNow()}</span>
        </div>
      </div>
    </div>
  );
};

export default Group;
