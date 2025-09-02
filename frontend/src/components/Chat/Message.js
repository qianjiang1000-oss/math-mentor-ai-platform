import React from 'react';
import { formatRelativeTime, formatMathExpression } from '../../utils/helpers';
import './Chat.css';

const Message = ({ message }) => {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';

  const renderSolution = (solution) => {
    if (typeof solution === 'string') {
      return <p>{formatMathExpression(solution)}</p>;
    }

    return (
      <div className="solution-content">
        <div className="solution-answer">
          <strong>Answer: </strong>
          {formatMathExpression(solution.final_answer)}
        </div>
        {solution.confidence && (
          <div className="solution-confidence">
            Confidence: {(solution.confidence * 100).toFixed(1)}%
          </div>
        )}
        {solution.steps && (
          <div className="solution-steps">
            <strong>Steps:</strong>
            <ol>
              {solution.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`message ${isUser ? 'user-message' : 'ai-message'} ${isError ? 'error-message' : ''}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      
      <div className="message-content">
        <div className="message-header">
          <span className="message-sender">
            {isUser ? 'You' : 'Math Mentor AI'}
          </span>
          <span className="message-time">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>
        
        <div className="message-text">
          {isUser ? (
            <p>{message.problem}</p>
          ) : isError ? (
            <div className="error-content">
              <p>❌ {message.error || 'An error occurred'}</p>
            </div>
          ) : (
            renderSolution(message.solution)
          )}
        </div>
        
        {message.confidence && !isUser && !isError && (
          <div className="message-meta">
            <span className="confidence-badge">
              Confidence: {(message.confidence * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;