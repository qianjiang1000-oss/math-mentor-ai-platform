import React from 'react';
import { getDifficultyBadge, formatMathExpression } from '../../utils/helpers';
import './SolutionDisplay.css';

const SolutionDisplay = ({ solution, problem }) => {
  if (!solution) return null;

  return (
    <div className="solution-display">
      <div className="solution-header">
        <h3>Solution</h3>
        <div className="solution-meta">
          <span className={`confidence-badge confidence-${Math.floor(solution.confidence * 10)}`}>
            Confidence: {(solution.confidence * 100).toFixed(1)}%
          </span>
          <span className="processing-time">
            Processed in {solution.processing_time}s
          </span>
        </div>
      </div>

      <div className="solution-content">
        <div className="final-answer">
          <h4>Final Answer:</h4>
          <div className="answer-box">
            <span className="math-symbol">
              {formatMathExpression(solution.final_answer)}
            </span>
          </div>
        </div>

        <div className="solution-steps">
          <h4>Step-by-Step Solution:</h4>
          <div className="steps-list">
            {solution.steps.map((step, index) => (
              <div key={index} className="step">
                <span className="step-number">{index + 1}.</span>
                <span className="step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="solution-concepts">
          <h4>Mathematical Concepts:</h4>
          <div className="concepts-list">
            {solution.concepts.map((concept, index) => (
              <span key={index} className="concept-tag">
                {concept}
              </span>
            ))}
          </div>
        </div>

        <div className="solution-metrics">
          <div className="metric">
            <span className="metric-label">Model Version:</span>
            <span className="metric-value">{solution.metadata?.model_version}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Model Status:</span>
            <span className="metric-value">
              {solution.metadata?.model_loaded ? 'Loaded' : 'Not Loaded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionDisplay;