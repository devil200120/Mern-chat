import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createGroup } from '../store/actions/messengerAction';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mern-chat-application-nlxu.onrender.com';


const CreateGroup = ({ setShowCreateGroup }) => {
  const dispatch = useDispatch();
  const { friends } = useSelector(state => state.messenger);

  const [groupData, setGroupData] = useState({
    name: '',
    members: [],
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Cleanup preview image URL object when component unmounts or previewImage changes
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

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
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      setErrors({ image: 'Only JPEG, PNG, or WEBP images allowed' });
      return;
    }

    if (file.size > maxSize) {
      setErrors({ image: 'Image must be smaller than 2MB' });
      return;
    }

    setGroupData({
      ...groupData,
      image: file
    });

    const preview = URL.createObjectURL(file);
    setPreviewImage(preview);
    setErrors(prevErrors => ({ ...prevErrors, image: null }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (!groupData.name.trim()) newErrors.name = 'Group name is required';
    if (groupData.members.length < 1) newErrors.members = 'Select at least one member';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', groupData.name.trim());
    formData.append('members', JSON.stringify(groupData.members));
    if (groupData.image) {
      formData.append('image', groupData.image);
    }

    try {
      await dispatch(createGroup(formData));
      setShowCreateGroup(false);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to create group' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-group-modal" role="dialog" aria-modal="true" aria-labelledby="create-group-title">
      <div className="create-group-content">
        <div className="create-group-header">
          <h3 id="create-group-title">Create New Group</h3>
          <button onClick={() => setShowCreateGroup(false)} aria-label="Close create group modal">×</button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="create-group-body">
            <div className="form-group">
              <label htmlFor="group-name">Group Name</label>
              <input 
                type="text" 
                id="group-name"
                name="name" 
                placeholder="Enter group name" 
                value={groupData.name} 
                onChange={handleChange} 
                className={`form-control ${errors.name ? 'input-error' : ''}`}
                required 
                aria-describedby={errors.name ? 'group-name-error' : undefined}
              />
              {errors.name && <span id="group-name-error" className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="group-image">Group Image (Optional)</label>
              <div className="image-select">
                {previewImage && (
                  <div className="preview-image">
                    <img src={previewImage} alt="Group preview" />
                  </div>
                )}
                <input 
                  type="file" 
                  id="group-image" 
                  name="image"
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className={`form-control ${errors.image ? 'input-error' : ''}`}
                  aria-describedby={errors.image ? 'group-image-error' : undefined}
                />
                {errors.image && <span id="group-image-error" className="error-message">{errors.image}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label>Add Members</label>
              {errors.members && <span className="error-message">{errors.members}</span>}
              <div className="friend-select-list" role="list" aria-label="Select group members">
                {friends.map(friend => (
                  <div 
                    key={friend.fndInfo._id} 
                    className={`friend-select-item ${groupData.members.includes(friend.fndInfo._id) ? 'selected' : ''}`}
                    onClick={() => handleMemberToggle(friend.fndInfo._id)}
                    role="checkbox"
                    aria-checked={groupData.members.includes(friend.fndInfo._id)}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleMemberToggle(friend.fndInfo._id);
                      }
                    }}
                  >
                    <input 
                      type="checkbox" 
                      id={`friend-${friend.fndInfo._id}`}
                      checked={groupData.members.includes(friend.fndInfo._id)}
                      onChange={() => {}}
                      tabIndex={-1}
                    />
                    <label htmlFor={`friend-${friend.fndInfo._id}`}> 
                      <img 
                        src={`${BACKEND_URL}/uploads/${friend.fndInfo.image}`} 
                        alt={`Profile of ${friend.fndInfo.userName}`}
                        onError={e => { e.target.onerror = null; e.target.src = `${BACKEND_URL}/uploads/default-profile-picture1.png`; }}
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
            <button type="submit" className="btn create-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
