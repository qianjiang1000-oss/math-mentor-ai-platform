import React from 'react';
import './Pages.css';

const Community = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Community</h1>
        <p>Join our growing community of math enthusiasts</p>
      </div>

      <div className="community-content">
        <div className="component">
          <h2>Coming Soon!</h2>
          <p>We're building an amazing community features including:</p>
          <ul className="feature-list">
            <li>🧑‍🤝‍🧑 User profiles and achievements</li>
            <li>🏆 Leaderboards and challenges</li>
            <li>💬 Discussion forums</li>
            <li>📊 Shared solution repository</li>
            <li>🤝 Collaborative problem solving</li>
          </ul>
          <p>Stay tuned for updates!</p>
        </div>

        <div className="component">
          <h2>Get Involved</h2>
          <p>In the meantime, you can:</p>
          <div className="community-actions">
            <div className="action-item">
              <h3>Contribute Training Data</h3>
              <p>Help improve our AI model by adding mathematical problems and solutions.</p>
              <a href="/train" className="btn btn-primary">Start Contributing</a>
            </div>
            <div className="action-item">
              <h3>Share Feedback</h3>
              <p>Tell us what community features you'd like to see.</p>
              <button className="btn btn-outline" disabled>Coming Soon</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;