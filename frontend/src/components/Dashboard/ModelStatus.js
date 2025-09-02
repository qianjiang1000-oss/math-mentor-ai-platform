import React from 'react';
import './Dashboard.css';

const ModelStatus = ({ healthStatus }) => {
  const modelInfo = healthStatus?.model_info || {};
  const isModelLoaded = healthStatus?.services?.model === 'ready';

  const getModelStatusColor = () => {
    return isModelLoaded ? 'green' : 'gray';
  };

  const getModelStatusText = () => {
    return isModelLoaded ? 'Operational' : 'Not Loaded';
  };

  return (
    <div className="component">
      <h2>AI Model Status</h2>
      
      <div className="model-status">
        <div className="status-indicator">
          <div className={`status-dot status-${getModelStatusColor()}`}></div>
          <span className="status-text">{getModelStatusText()}</span>
        </div>

        {isModelLoaded && modelInfo && (
          <div className="model-details">
            <div className="detail-row">
              <span className="detail-label">Version:</span>
              <span className="detail-value">{modelInfo.version || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Architecture:</span>
              <span className="detail-value">{modelInfo.architecture || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Vocabulary Size:</span>
              <span className="detail-value">{modelInfo.vocab_size?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Classes:</span>
              <span className="detail-value">{modelInfo.classes?.toLocaleString() || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Training Date:</span>
              <span className="detail-value">
                {modelInfo.training_date ? new Date(modelInfo.training_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        )}

        {!isModelLoaded && (
          <div className="model-warning">
            <p>⚠️ The AI model is not loaded. Please train the model to start using AI features.</p>
            <a href="/train" className="btn btn-primary btn-sm">
              Train Model
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelStatus;