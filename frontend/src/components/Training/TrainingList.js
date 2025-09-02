import React, { useState, useEffect } from 'react';
import { getTrainingData } from '../../services/api';
import { formatDate, getDifficultyBadge } from '../../utils/helpers';
import './Training.css';

const TrainingList = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchTrainingData = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getTrainingData(page, pagination.limit);
      
      if (response.data) {
        setTrainingData(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError('Failed to load training data');
      console.error('Error fetching training data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchTrainingData(newPage);
    }
  };

  if (loading) {
    return (
      <div className="component">
        <h2>Training Data</h2>
        <div className="loading">Loading training data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="component">
        <h2>Training Data</h2>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="component">
      <div className="training-header">
        <h2>Training Data</h2>
        <div className="training-stats">
          <span className="stat">Total: {pagination.total}</span>
          <span className="stat">Page: {pagination.page} of {pagination.pages}</span>
        </div>
      </div>

      {trainingData.length === 0 ? (
        <div className="empty-state">
          <p>No training data available yet.</p>
          <p>Be the first to contribute!</p>
        </div>
      ) : (
        <>
          <div className="training-list">
            {trainingData.map((item) => (
              <div key={item.id} className="training-item">
                <div className="training-content">
                  <div className="training-problem">
                    <h4>Problem:</h4>
                    <p>{item.problem_text}</p>
                  </div>
                  
                  <div className="training-solution">
                    <h4>Solution:</h4>
                    <p>{item.solution_text}</p>
                  </div>
                  
                  <div className="training-meta">
                    <span className={`difficulty-badge ${getDifficultyBadge(item.difficulty_level)}`}>
                      {item.difficulty_level}
                    </span>
                    
                    <div className="concepts">
                      {item.mathematical_concepts.map((concept, index) => (
                        <span key={index} className="concept-tag small">
                          {concept}
                        </span>
                      ))}
                    </div>
                    
                    <div className="training-info">
                      <span>By: {item.contributed_by || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{formatDate(item.created_at)}</span>
                      <span>•</span>
                      <span className={`status status-${item.validation_status}`}>
                        {item.validation_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrainingList;