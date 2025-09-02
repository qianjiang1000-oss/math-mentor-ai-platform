import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateUsernameInitials } from '../../utils/helpers';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">🧮</span>
          <span className="logo-text">Math Mentor AI</span>
        </div>
      </div>

      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar">
            {generateUsernameInitials(user.username)}
          </div>
          <span className="user-name">{user.username}</span>
        </div>
        
        <button 
          className="btn btn-outline btn-sm"
          onClick={handleLogout}
          title="Logout"
        >
          <span className="logout-icon">🚪</span>
          <span className="logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;