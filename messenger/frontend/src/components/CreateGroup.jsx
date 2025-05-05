import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createGroup } from '../store/actions/messengerAction';

const CreateGroup = ({ setShowCreateGroup }) => {
  const dispatch = useDispatch();
  const { friends } = useSelector(state => state.messenger);
  
  const [groupData, setGroupData] = useState({
    name: '',
    members: [],
    image: null
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
      const index = updatedMembers.indexOf(friendId);
      updatedMembers.splice(index, 1);
    } else {
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
    
    dispatch(createGroup(formData));
    setShowCreateGroup(false);
  };

  return (
    <div className="create-group-modal">
      <div className="create-group-content">
        <div className="create-group-header">
          <h3>Create New Group</h3>
          <button onClick={() => setShowCreateGroup(false)}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="create-group-body">
            <div className="form-group">
              <label>Group Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Enter group name" 
                value={groupData.name} 
                onChange={handleChange} 
                className="form-control"
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Group Image (Optional)</label>
              <div className="image-select">
                {previewImage && (
                  <div className="preview-image">
                    <img src={previewImage} alt="Preview" />
                  </div>
                )}
                <input 
                  type="file" 
                  id="group-image" 
                  name="image"
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Add Members</label>
              <div className="friend-select-list">
                {friends.map(friend => (
                  <div 
                    key={friend.fndInfo._id} 
                    className={`friend-select-item ${groupData.members.includes(friend.fndInfo._id) ? 'selected' : ''}`}
                    onClick={() => handleMemberToggle(friend.fndInfo._id)}
                  >
                    <input 
                      type="checkbox" 
                      id={`friend-${friend.fndInfo._id}`}
                      checked={groupData.members.includes(friend.fndInfo._id)}
                      onChange={() => {}}
                    />
                    <label htmlFor={`friend-${friend.fndInfo._id}`}>
                      <img 
                        src={`/image/${friend.fndInfo.image}`} 
                        alt=""
                        onError={e => { e.target.onerror = null; e.target.src = '/image/default-profile-picture1.png'; }}
                      />
                      <span>{friend.fndInfo.userName}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="create-group-footer">
            <button type="button" onClick={() => setShowCreateGroup(false)} className="btn cancel-btn">Cancel</button>
            <button type="submit" className="btn create-btn">Create Group</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
