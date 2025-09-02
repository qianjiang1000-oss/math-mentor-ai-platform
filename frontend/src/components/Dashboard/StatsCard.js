import React from 'react';
import './Dashboard.css';

const StatsCard = ({ title, value, icon, color, description }) => {
  const getColorClass = () => {
    switch (color) {
      case 'green': return 'stats-green';
      case 'blue': return 'stats-blue';
      case 'red': return 'stats-red';
      case 'orange': return 'stats-orange';
      default: return 'stats-gray';
    }
  };

  return (
    <div className={`stats-card ${getColorClass()}`}>
      <div className="stats-header">
        <div className="stats-icon">{icon}</div>
        <div className="stats-content">
          <h3 className="stats-value">{value}</h3>
          <p className="stats-title">{title}</p>
        </div>
      </div>
      <p className="stats-description">{description}</p>
    </div>
  );
};

export default StatsCard;