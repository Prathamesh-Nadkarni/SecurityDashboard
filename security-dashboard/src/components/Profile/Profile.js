import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import TopBar from '../Dashboard/TopBar/TopBar';
import { setHeaders } from '../../utils/headers';

const Profile = () => {
  const [userInfo, setUserInfo] = useState({ name: 'Unknown', email: 'Unknown', username: 'Unknown', picture: '' });
  const [editMode, setEditMode] = useState(false);
  const [newPicture, setNewPicture] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`http://127.0.0.1:5000/api/user/${username}`,{
        method: 'GET',
        headers: {
          ...setHeaders()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      const data = await response.json();
      if (data.user) {
        setUserInfo(data.user);
      } else {
        console.error('User data is not available');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    setIsChanged(true);
  };

  const handlePictureChange = (e) => {
    setNewPicture(e.target.files[0]);
    setIsChanged(true);
  };

  const handleEditProfilePicture = () => {
    navigate('/upload');
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('name', userInfo.name || 'Unknown');
    formData.append('email', userInfo.email || 'Unknown');
    formData.append('username', userInfo.username || 'Unknown');
    
    if (newPicture) {
      formData.append('picture', newPicture);
    }

    try {
      const username = localStorage.getItem('username');
      const response = await fetch(`http://127.0.0.1:5000/api/user/${username}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update user info');
      }

      const data = await response.json();
      setUserInfo(data.user);
      setEditMode(false);
      setIsChanged(false);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleResetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <TopBar>
      <div className="profile-page">
        <h1>Profile</h1>
        <div className="profile-picture">
          <img src={'https://www.w3schools.com/html/pic_trulli.jpg'} alt="Profile" />
          {editMode && <input type="file" onChange={handlePictureChange} />}
        </div>
        <div className="profile-info">
          <label>Name:</label>
          {editMode ? (
            <input type="text" name="name" value={userInfo.name} onChange={handleChange} />
          ) : (
            <p>{userInfo.name}</p>
          )}
          <label>Email:</label>
          {editMode ? (
            <input type="email" name="email" value={userInfo.email} onChange={handleChange} />
          ) : (
            <p>{userInfo.email}</p>
          )}
          <label>Username:</label>
          {editMode ? (
            <input type="text" name="username" value={userInfo.username} onChange={handleChange} />
          ) : (
            <p>{userInfo.username}</p>
          )}
          <div className="reset-password-section">
            <button className="reset-password-button" onClick={handleResetPassword}>Reset Password</button>
          </div>
          {editMode ? (
            <button className={isChanged ? 'save-button active' : 'save-button'} onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setEditMode(true)}>Edit</button>
          )}
        </div>
      </div>
    </TopBar>
  );
};

export default Profile;
