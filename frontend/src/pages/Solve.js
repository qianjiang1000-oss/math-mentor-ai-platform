import React from 'react';
import Solver from '../components/Solver/Solver';
import './Pages.css';

const Solve = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Problem Solver</h1>
        <p>Enter any mathematical problem and get instant AI-powered solutions</p>
      </div>
      <Solver />
    </div>
  );
};

export default Solve;