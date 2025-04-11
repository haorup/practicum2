import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Account.css';

function Account() {
  const { user, loading, updateUser, logout } = useUser();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  const handleEditClick = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="account-container">Loading user data...</div>;
  }

  if (!user) {
    return <div className="account-container">Please log in to view your account.</div>;
  }

  return (
    <div className="account-container">
      <h2>My Account</h2>
      
      <div className="account-section">
        <div className="account-header">
          <h3>Profile Information</h3>
          <div className="action-buttons">
            {!isEditing && <button className="edit-button" onClick={handleEditClick}>Edit Profile</button>}
            <button className="logout-button" onClick={handleLogout}>Log Out</button>
          </div>
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="button-group">
              <button type="submit">Save</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="account-details">
            <div className="detail-item">
              <span className="label">Name:</span>
              <span>{user.firstName} {user.lastName}</span>
            </div>
            <div className="detail-item">
              <span className="label">Username:</span>
              <span>{user.username}</span>
            </div>
            <div className="detail-item">
              <span className="label">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <span className="label">Role:</span>
              <span>{user.role}</span>
            </div>
            <div className="detail-item">
              <span className="label">Registration Date</span>
              <span>{user.joinDate}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Account;
