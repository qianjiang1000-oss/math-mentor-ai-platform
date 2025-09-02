import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Pages.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Math Mentor AI</h1>
          <p className="hero-subtitle">
            Your intelligent companion for mathematical problem solving and learning
          </p>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Mathematical Concepts</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">AI Assistance</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">Learning Possibilities</div>
            </div>
          </div>

          <div className="hero-actions">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/solve')}
            >
              Start Solving Problems
            </button>
            <button 
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/chat')}
            >
              Chat with AI
            </button>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="math-animation">
            <span className="math-symbol">∫</span>
            <span className="math-symbol">∑</span>
            <span className="math-symbol">π</span>
            <span className="math-symbol">∞</span>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose Math Mentor AI?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered Solutions</h3>
            <p>Get instant, accurate solutions to complex mathematical problems using advanced AI algorithms.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Step-by-Step Explanations</h3>
            <p>Understand the solution process with detailed, step-by-step explanations for every problem.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Instant Results</h3>
            <p>Receive solutions in seconds, not hours. Perfect for homework help and quick learning.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Always Available</h3>
            <p>24/7 access to mathematical assistance from anywhere, on any device.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Improve Your Math Skills?</h2>
        <p>Join thousands of students and educators who trust Math Mentor AI for their mathematical needs.</p>
        <div className="cta-actions">
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/solve')}
          >
            Try It Now
          </button>
          <button 
            className="btn btn-outline btn-lg"
            onClick={() => navigate('/train')}
          >
            Contribute Knowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;