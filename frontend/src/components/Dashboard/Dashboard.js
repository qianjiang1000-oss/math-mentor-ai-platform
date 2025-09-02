import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { healthCheck, getSolutionHistory } from '../../services/api';
import StatsCard from './StatsCard';
import ModelStatus from './ModelStatus';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [recentSolutions, setRecentSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch health status
        const health = await healthCheck();
        setHealthStatus(health);
        
        // Fetch recent solutions
        const solutions = await getSolutionHistory(user.id, 1, 5);
        setRecentSolutions(solutions.data || []);
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.username}! 👋</h1>
        <p>Here's what's happening with your Math Mentor AI today.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard
          title="Problems Solved"
          value={recentSolutions.length}
          icon="✅"
          color="green"
          description="Total solutions generated"
        />
        
        <StatsCard
          title="Model Status"
          value={healthStatus?.services?.model === 'ready' ? 'Active' : 'Inactive'}
          icon="🧠"
          color={healthStatus?.services?.model === 'ready' ? 'blue' : 'gray'}
          description="AI model availability"
        />
        
        <StatsCard
          title="API Health"
          value={healthStatus?.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
          icon="🌐"
          color={healthStatus?.status === 'healthy' ? 'green' : 'red'}
          description="System status"
        />
        
        <StatsCard
          title="Database"
          value={healthStatus?.services?.database === 'connected' ? 'Connected' : 'Disconnected'}
          icon="💾"
          color={healthStatus?.services?.database === 'connected' ? 'blue' : 'red'}
          description="Database connection"
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-column">
          <ModelStatus healthStatus={healthStatus} />
        </div>
        
        <div className="dashboard-column">
          <div className="component">
            <h2>Recent Solutions</h2>
            {recentSolutions.length === 0 ? (
              <div className="empty-state">
                <p>No solutions yet.</p>
                <p>Start solving problems to see them here!</p>
              </div>
            ) : (
              <div className="solutions-list">
                {recentSolutions.map((solution, index) => (
                  <div key={index} className="solution-item">
                    <div className="solution-problem">
                      {solution.problem_text.substring(0, 60)}...
                    </div>
                    <div className="solution-meta">
                      <span className="solution-time">
                        {new Date(solution.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="solution-confidence">
                        {(solution.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <a href="/solve" className="action-card">
            <span className="action-icon">🧮</span>
            <span className="action-text">Solve Problem</span>
          </a>
          
          <a href="/train" className="action-card">
            <span className="action-icon">🎓</span>
            <span className="action-text">Add Training Data</span>
          </a>
          
          <a href="/chat" className="action-card">
            <span className="action-icon">💬</span>
            <span className="action-text">AI Chat</span>
          </a>
          
          <a href="/community" className="action-card">
            <span className="action-icon">👥</span>
            <span className="action-text">Community</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;