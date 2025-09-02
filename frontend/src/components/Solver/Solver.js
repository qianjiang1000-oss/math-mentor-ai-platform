import React, { useState } from 'react';
import { solveProblem } from '../../services/api';
import { validateProblemInput } from '../../utils/validation';
import SolutionDisplay from './SolutionDisplay';
import './Solver.css';

const Solver = () => {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate input
    const { isValid, errors } = validateProblemInput(problem);
    if (!isValid) {
      setError(errors.problem);
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const result = await solveProblem(problem);
      
      if (result.success) {
        setSolution(result.solution);
        // Add to history
        setHistory(prev => [{
          problem,
          solution: result.solution,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 4)]);
      } else {
        setError(result.error || 'Failed to solve the problem');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSolution = () => {
    setSolution(null);
    setError('');
  };

  const loadFromHistory = (historyItem) => {
    setProblem(historyItem.problem);
    setSolution(historyItem.solution);
    setError('');
  };

  return (
    <div className="solver-container">
      <div className="component">
        <h2>Mathematical Problem Solver</h2>
        
        <form onSubmit={handleSubmit} className="solver-form">
          <div className="form-group">
            <label htmlFor="problem">Enter Mathematical Problem:</label>
            <textarea
              id="problem"
              value={problem}
              onChange={(e) => {
                setProblem(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Solve for x: 2x + 5 = 15"
              disabled={isLoading}
              rows="4"
            />
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
          </div>

          <div className="solver-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !problem.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Solving...
                </>
              ) : (
                'Solve Problem'
              )}
            </button>
            
            {solution && (
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={clearSolution}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {solution && (
          <SolutionDisplay solution={solution} problem={problem} />
        )}
      </div>

      {history.length > 0 && (
        <div className="component">
          <h3>Recent Solutions</h3>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-problem">
                  {item.problem.substring(0, 50)}...
                </div>
                <div className="history-actions">
                  <span className="history-time">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => loadFromHistory(item)}
                    title="Load this problem"
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Solver;