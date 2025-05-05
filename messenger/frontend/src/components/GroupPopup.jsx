import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { createGroup } from '../store/actions/messengerAction';

const GroupPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  const { friends } = useSelector(state => state.messenger);
  const { myInfo } = useSelector(state => state.auth);

  const [groupData, setGroupData] = useState({
    name: '',
    members: [],
    image: ''
  });
  const [previewImage, setPreviewImage] = useState('');

  const handleChange = e => {
    setGroupData({
      ...groupData,
      [e.target.name]: e.target.value
    });
  };

  const handleMemberToggle = friendId => {
    const updatedMembers = [...groupData.members];
    
    if (updatedMembers.includes(friendId)) {
      // Remove if already selected
      const index = updatedMembers.indexOf(friendId);
      updatedMembers.splice(index, 1);
    } else {
      // Add if not selected
      updatedMembers.push(friendId);
    }
    
    setGroupData({
      ...groupData,
      members: updatedMembers
    });
  };

  const handleImageChange = e => {
    if (e.target.files.length !== 0) {
      setGroupData({
        ...groupData,
        image: e.target.files[0]
      });

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    if (!groupData.name || groupData.members.length === 0) {
      alert('Group name and at least one member are required');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', groupData.name);
    formData.append('members', JSON.stringify(groupData.members));
    
    if (groupData.image) {
      formData.append('image', groupData.image);
    }
    
    dispatch(createGroup(formData))
      .then(() => {
        onClose();
      });
  };

  return (
    <div className="group-popup">
      <div className="group-popup-container">
        <div className="group-popup-header">
          <h3>Create New Group</h3>
          <span onClick={onClose}><FaTimes /></span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter group name" 
              value={groupData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Group Image</label>
            <div className="image-select">
              {previewImage && (
                <div className="preview-image">
                  <img src={previewImage} alt="Preview" />
                </div>
              )}
              <input 
                type="file" 
                id="group-image" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              <label htmlFor="group-image" className="file-label">
                Select Image
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>Add Members</label>
            <div className="member-list">
              {friends.map(friend => (
                <div 
                  key={friend.fndInfo._id} 
                  className={`member-item ${groupData.members.includes(friend.fndInfo._id) ? 'selected' : ''}`}
                  onClick={() => handleMemberToggle(friend.fndInfo._id)}
                >
                  <div className="member-image">
                    <img 
                      src={`/image/${friend.fndInfo.image}`} 
                      alt=""
                      onError={e => { e.target.onerror = null; e.target.src = '/image/default-profile-picture1.png'; }}
                    />
                  </div>
                  <div className="member-name">
                    <h4>{friend.fndInfo.userName}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <button type="submit" className="btn create-group-btn">
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupPopup;
