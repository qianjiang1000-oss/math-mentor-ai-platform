import React, { useState } from 'react';
import TrainingForm from '../components/Training/TrainingForm';
import TrainingList from '../components/Training/TrainingList';
import TrainingStatus from '../components/Training/TrainingStatus';
import './Pages.css';

const Train = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataAdded = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
  };

  const tabs = [
    { id: 'form', label: 'Add Training Data', icon: '➕' },
    { id: 'list', label: 'View Data', icon: '📋' },
    { id: 'status', label: 'Training Status', icon: '⚙️' }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Training</h1>
        <p>Contribute to improving our AI model by adding training data</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'form' && (
            <TrainingForm onDataAdded={handleDataAdded} />
          )}
          {activeTab === 'list' && (
            <TrainingList key={refreshKey} />
          )}
          {activeTab === 'status' && (
            <TrainingStatus />
          )}
        </div>
      </div>
    </div>
  );
};

export default Train;