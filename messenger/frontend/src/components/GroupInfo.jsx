import React from 'react';
import { FaCaretSquareDown } from "react-icons/fa";
import { useSelector } from 'react-redux';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mern-chat-application-nlxu.onrender.com';


const GroupInfo = ({ currentGroup }) => {
  const { friends } = useSelector(state => state.messenger);
  const { myInfo } = useSelector(state => state.auth);

  const getMemberInfo = (memberId) => {
    if (memberId === myInfo.id) {
      return {
        _id: myInfo.id,
        userName: myInfo.userName,
        image: myInfo.image
      };
    }
    const friend = friends.find(f => f.fndInfo._id === memberId);
    return friend ? friend.fndInfo : null;
  };

  return (
    <div className='group-info'>
      <div className='image-name'>
        <div className='image'>
          <img 
            src={
              currentGroup.image 
                ? `${BACKEND_URL}/uploads/${currentGroup.image}` 
                : `${BACKEND_URL}/uploads/default-group.png`
            } 
            alt={`Group: ${currentGroup.name}`}
            onError={e => { 
              e.target.onerror = null; 
              e.target.src = `${BACKEND_URL}/uploads/default-profile-picture1.png`; 
            }}
          />
        </div>
        <div className='name'>
          <h4>{currentGroup.name}</h4>
          <h5>{currentGroup.members.length} member{currentGroup.members.length !== 1 ? 's' : ''}</h5>
        </div>
      </div>

      <div className='group-members'>
        <div className='members-header'>
          <h3>Group Members</h3>
          <FaCaretSquareDown />
        </div>
        <div className='members-list'>
          {currentGroup.members.map(memberId => {
            const member = getMemberInfo(memberId);
            if (!member) return null;
            
            return (
              <div key={memberId} className='member-item'>
                <div className='member-image'>
                  <img 
                    src={`${BACKEND_URL}/uploads/${member.image}`} 
                    alt={`Profile of ${member.userName}`}
                    onError={e => { 
                      e.target.onerror = null; 
                      e.target.src = `${BACKEND_URL}/uploads/default-profile-picture1.png`; 
                    }}
                  />
                </div>
                <div className='member-name'>
                  <h4>{member.userName} {memberId === currentGroup.admin ? '(Admin)' : ''}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='others'>
        <div className='custom-chat'>
          <h3>Customize Group</h3>
          <FaCaretSquareDown />
        </div>
        <div className='privacy'>
          <h3>Privacy and Support</h3>
          <FaCaretSquareDown />
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
