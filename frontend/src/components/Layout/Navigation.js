import React from 'react';
import { useApp } from '../../context/AppContext';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import './Navigation.css';

const Navigation = () => {
  const { currentPage, setCurrentPage } = useApp();

  const handleNavigation = (pageId) => {
    setCurrentPage(pageId);
  };

  return (
    <nav className="app-nav">
      {NAVIGATION_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
          onClick={() => handleNavigation(item.id)}
          title={item.label}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;