import React from 'react';
import { FaCaretSquareDown, FaUsers } from "react-icons/fa";
import { useSelector } from 'react-redux';

const GroupInfo = ({ currentGroup }) => {
  const { friends } = useSelector(state => state.messenger);
  const { myInfo } = useSelector(state => state.auth);

  // Find member details from friends list
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
            src={currentGroup.image ? `/image/${currentGroup.image}` : '/image/default-group.png'} 
            alt=''
            onError={e => { e.target.onerror = null; e.target.src = '/image/default-profile-picture1.png'; }}
          />
        </div>
        <div className='name'>
          <h4>{currentGroup.name}</h4>
          <h5>{currentGroup.members.length} members</h5>
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
                    src={`/image/${member.image}`} 
                    alt=''
                    onError={e => { e.target.onerror = null; e.target.src = '/image/default-profile-picture1.png'; }}
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
