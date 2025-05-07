import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { createGroup } from '../store/actions/messengerAction';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://mern-chat-application-nlxu.onrender.com';


const GroupPopup = ({ onClose }) => {
  const dispatch = useDispatch();
  const { friends } = useSelector(state => state.messenger);
  const { myInfo } = useSelector(state => state.auth);

  const [groupData, setGroupData] = useState({
    name: '',
    members: [],
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const handleChange = e => {
    setGroupData({ ...groupData, [e.target.name]: e.target.value });
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleMemberToggle = friendId => {
    const updatedMembers = groupData.members.includes(friendId)
      ? groupData.members.filter(id => id !== friendId)
      : [...groupData.members, friendId];
    setGroupData({ ...groupData, members: updatedMembers });
    setErrors(prev => ({ ...prev, members: '' }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, image: 'Only JPEG/PNG/WEBP images allowed' });
      return;
    }
    
    if (file.size > maxSize) {
      setErrors({ ...errors, image: 'Image must be smaller than 2MB' });
      return;
    }

    setGroupData({ ...groupData, image: file });
    setPreviewImage(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validation
    const newErrors = {};
    if (!groupData.name.trim()) newErrors.name = 'Group name is required';
    if (groupData.members.length === 0) newErrors.members = 'Select at least one member';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', groupData.name.trim());
      formData.append('members', JSON.stringify(groupData.members));
      if (groupData.image) formData.append('image', groupData.image);

      await dispatch(createGroup(formData));
      onClose();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to create group' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="group-popup" role="dialog" aria-modal="true" aria-labelledby="group-popup-title">
      <div className="group-popup-container">
        <div className="group-popup-header">
          <h3 id="group-popup-title">Create New Group</h3>
          <button 
            onClick={onClose} 
            aria-label="Close group creation"
            className="close-btn"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="group-name">Group Name</label>
            <input
              id="group-name"
              type="text"
              name="name"
              placeholder="Enter group name"
              value={groupData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
            />
            {errors.name && <span id="name-error" className="error-message">{errors.name}</span>}
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
                id="group-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={errors.image ? 'error' : ''}
                aria-describedby="image-error"
              />
              {errors.image && <span id="image-error" className="error-message">{errors.image}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label>Add Members</label>
            {errors.members && <span className="error-message">{errors.members}</span>}
            <div className="member-list" role="listbox">
              {friends.map(friend => (
                <div
                  key={friend.fndInfo._id}
                  className={`member-item ${groupData.members.includes(friend.fndInfo._id) ? 'selected' : ''}`}
                  onClick={() => handleMemberToggle(friend.fndInfo._id)}
                  role="option"
                  aria-selected={groupData.members.includes(friend.fndInfo._id)}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleMemberToggle(friend.fndInfo._id);
                    }
                  }}
                >
                  <div className="member-image">
                    <img
                      src={`${BACKEND_URL}/uploads/${friend.fndInfo.image}`}
                      alt={friend.fndInfo.userName}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `${BACKEND_URL}/uploads/default-profile-picture1.png`;
                      }}
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
            <button 
              type="submit" 
              className="btn create-group-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
            {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupPopup;
