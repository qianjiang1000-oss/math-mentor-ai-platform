import React, { useState } from 'react';
import { submitTrainingData } from '../../services/api';
import { validateTrainingData } from '../../utils/validation';
import { MATHEMATICAL_CONCEPTS, DIFFICULTY_LEVELS } from '../../utils/constants';
import './Training.css';

const TrainingForm = ({ onDataAdded }) => {
  const [formData, setFormData] = useState({
    problem_text: '',
    solution_text: '',
    step_by_step_explanation: '',
    mathematical_concepts: [],
    difficulty_level: 'Intermediate',
    contributed_by: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleConceptChange = (concept) => {
    setFormData(prev => ({
      ...prev,
      mathematical_concepts: prev.mathematical_concepts.includes(concept)
        ? prev.mathematical_concepts.filter(c => c !== concept)
        : [...prev.mathematical_concepts, concept]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const { isValid, errors: validationErrors } = validateTrainingData(formData);
    setErrors(validationErrors);
    
    if (!isValid) return;
    
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      const result = await submitTrainingData(formData);
      
      if (result.success) {
        setSuccessMessage('Training data added successfully!');
        setFormData({
          problem_text: '',
          solution_text: '',
          step_by_step_explanation: '',
          mathematical_concepts: [],
          difficulty_level: 'Intermediate',
          contributed_by: ''
        });
        
        if (onDataAdded) {
          onDataAdded();
        }
      } else {
        setErrors({ submit: result.error || 'Failed to add training data' });
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="component">
      <h2>Contribute Training Data</h2>
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      
      {errors.submit && (
        <div className="alert alert-error">
          {errors.submit}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="training-form">
        <div className="form-group">
          <label htmlFor="problem_text">Problem Text *</label>
          <textarea
            id="problem_text"
            name="problem_text"
            value={formData.problem_text}
            onChange={handleChange}
            placeholder="Enter the mathematical problem..."
            rows="4"
            className={errors.problem_text ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.problem_text && (
            <span className="error-text">{errors.problem_text}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="solution_text">Solution Text *</label>
          <textarea
            id="solution_text"
            name="solution_text"
            value={formData.solution_text}
            onChange={handleChange}
            placeholder="Enter the complete solution..."
            rows="3"
            className={errors.solution_text ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.solution_text && (
            <span className="error-text">{errors.solution_text}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="step_by_step_explanation">Step-by-Step Explanation (Optional)</label>
          <textarea
            id="step_by_step_explanation"
            name="step_by_step_explanation"
            value={formData.step_by_step_explanation}
            onChange={handleChange}
            placeholder="Detailed explanation of each step..."
            rows="3"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label>Mathematical Concepts *</label>
          <div className="concepts-grid">
            {MATHEMATICAL_CONCEPTS.map(concept => (
              <label key={concept} className="concept-checkbox">
                <input
                  type="checkbox"
                  checked={formData.mathematical_concepts.includes(concept)}
                  onChange={() => handleConceptChange(concept)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                {concept}
              </label>
            ))}
          </div>
          {errors.mathematical_concepts && (
            <span className="error-text">{errors.mathematical_concepts}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="difficulty_level">Difficulty Level *</label>
          <select
            id="difficulty_level"
            name="difficulty_level"
            value={formData.difficulty_level}
            onChange={handleChange}
            className={errors.difficulty_level ? 'error' : ''}
            disabled={isLoading}
          >
            {DIFFICULTY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {errors.difficulty_level && (
            <span className="error-text">{errors.difficulty_level}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contributed_by">Your Name (Optional)</label>
          <input
            type="text"
            id="contributed_by"
            name="contributed_by"
            value={formData.contributed_by}
            onChange={handleChange}
            placeholder="Enter your name for attribution..."
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-secondary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner-small"></span>
              Adding Training Data...
            </>
          ) : (
            'Submit Training Data'
          )}
        </button>
      </form>
    </div>
  );
};

export default TrainingForm;