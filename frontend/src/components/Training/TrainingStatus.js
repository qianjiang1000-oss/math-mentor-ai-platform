import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { getTrainingStatus } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { retrainModel } from '../../services/api';
import './Training.css';

const TrainingStatus = () => {
  const { trainingStatus, updateTrainingStatus } = useApp();
  const { useTrainingEvents } = useWebSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial training status
  useEffect(() => {
    const fetchTrainingStatus = async () => {
      try {
        const status = await getTrainingStatus();
        updateTrainingStatus(status);
      } catch (err) {
        console.error('Error fetching training status:', err);
      }
    };

    fetchTrainingStatus();
  }, []);

  // Listen for WebSocket training events
  useTrainingEvents((data) => {
    updateTrainingStatus(data);
  });

  const handleStartTraining = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await retrainModel();
      
      if (!result.success) {
        setError(result.error || 'Failed to start training');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (trainingStatus.isTraining) return 'orange';
    if (trainingStatus.message?.includes('completed')) return 'green';
    if (trainingStatus.message?.includes('failed')) return 'red';
    return 'gray';
  };

  const getStatusIcon = () => {
    if (trainingStatus.isTraining) return '🔄';
    if (trainingStatus.message?.includes('completed')) return '✅';
    if (trainingStatus.message?.includes('failed')) return '❌';
    return '📊';
  };

  return (
    <div className="component">
      <h2>Model Training Status</h2>
      
      <div className="training-status-card">
        <div className="status-header">
          <span className="status-icon">{getStatusIcon()}</span>
          <div className="status-info">
            <h3 className={`status-text status-${getStatusColor()}`}>
              {trainingStatus.isTraining ? 'Training in Progress' : 
               trainingStatus.message?.includes('completed') ? 'Training Completed' :
               trainingStatus.message?.includes('failed') ? 'Training Failed' : 'Ready to Train'}
            </h3>
            <p className="status-message">{trainingStatus.message || 'No training activity'}</p>
          </div>
        </div>

        {trainingStatus.isTraining && (
          <div className="training-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${trainingStatus.progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(trainingStatus.progress)}% Complete
            </div>
          </div>
        )}

        <div className="training-actions">
          <button
            className="btn btn-primary"
            onClick={handleStartTraining}
            disabled={trainingStatus.isTraining || loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner-small"></span>
                Starting...
              </>
            ) : (
              'Start Model Training'
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="training-details">
          <div className="detail-item">
            <span className="detail-label">Training ID:</span>
            <span className="detail-value">{trainingStatus.trainingId || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Progress:</span>
            <span className="detail-value">{trainingStatus.progress || 0}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status:</span>
            <span className="detail-value">{trainingStatus.message || 'Idle'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingStatus;