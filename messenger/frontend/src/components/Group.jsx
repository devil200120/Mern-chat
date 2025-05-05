import React from "react";
import moment from "moment";

const Group = ({ group, setCurrentGroup, currentGroup }) => {
  return (
    <div
      onClick={() => setCurrentGroup(group)}
      className={currentGroup?._id === group._id ? "group active" : "group"}
    >
      <div className="group-image">
        <div className="image">
          <img
            src={
              group.image ? `/image/${group.image}` : "/image/default-group.png"
            }
            alt=""
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/image/default-profile-picture1.png";
            }}
          />
        </div>
      </div>

      <div className="group-name">
        <h4>{group.name}</h4>
        <div className="msg-time">
          <span>{moment(group.updatedAt).startOf("mini").fromNow()}</span>
        </div>
      </div>
    </div>
  );
};

export default Group;
