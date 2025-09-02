import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href="/about" className="footer-link">About</a>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <a href="/terms" className="footer-link">Terms of Service</a>
          <a href="/contact" className="footer-link">Contact</a>
          <a href="/docs" className="footer-link">Documentation</a>
        </div>
        
        <div className="footer-info">
          <p className="footer-copyright">
            © {currentYear} Math Mentor AI. Built with ❤️ for mathematics education.
          </p>
          
          <div className="footer-tech">
            <span className="tech-badge">React</span>
            <span className="tech-badge">TensorFlow</span>
            <span className="tech-badge">Flask</span>
            <span className="tech-badge">WebSocket</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;