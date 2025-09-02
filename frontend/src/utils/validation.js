export const validateTrainingData = (data) => {
  const errors = {};

  if (!data.problem_text || data.problem_text.trim().length < 10) {
    errors.problem_text = 'Problem text must be at least 10 characters long';
  }

  if (!data.solution_text || data.solution_text.trim().length < 5) {
    errors.solution_text = 'Solution text must be at least 5 characters long';
  }

  if (!data.mathematical_concepts || data.mathematical_concepts.length === 0) {
    errors.mathematical_concepts = 'Please select at least one mathematical concept';
  }

  if (!data.difficulty_level) {
    errors.difficulty_level = 'Please select a difficulty level';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProblemInput = (problem) => {
  const errors = {};

  if (!problem || problem.trim().length < 5) {
    errors.problem = 'Please enter a valid mathematical problem (at least 5 characters)';
  }

  // Check if it contains mathematical elements
  const mathPatterns = [
    /\d/, // numbers
    /[+\-*/=]/, // operators
    /[a-zA-Z]/, // variables
    /solve|find|calculate|compute|derivative|integral|equation/ // math keywords
  ];

  const hasMathContent = mathPatterns.some(pattern => pattern.test(problem));
  if (!hasMathContent) {
    errors.problem = 'This doesn\'t appear to be a mathematical problem';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUserRegistration = (userData) => {
  const errors = {};

  if (!userData.username || userData.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }

  if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!userData.password || userData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (userData.password !== userData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUserLogin = (credentials) => {
  const errors = {};

  if (!credentials.email) {
    errors.email = 'Email is required';
  }

  if (!credentials.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFeedback = (feedback) => {
  const errors = {};

  if (!feedback.problem_text) {
    errors.problem_text = 'Problem text is required';
  }

  if (!feedback.predicted_solution) {
    errors.predicted_solution = 'Predicted solution is required';
  }

  if (!feedback.correct_solution) {
    errors.correct_solution = 'Correct solution is required';
  }

  if (!feedback.feedback_type) {
    errors.feedback_type = 'Feedback type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially harmful characters while preserving mathematical symbols
  return input
    .replace(/[<>{}[\]\\]/g, '') // Remove dangerous HTML/JS characters
    .replace(/script/gi, '') // Remove script tags
    .trim();
};

export const validateMathExpression = (expression) => {
  const errors = {};

  if (!expression || expression.trim().length === 0) {
    errors.expression = 'Expression cannot be empty';
  }

  // Check for dangerous characters while allowing math symbols
  const dangerousChars = /[<>{}[\]\\;]/;
  if (dangerousChars.test(expression)) {
    errors.expression = 'Expression contains invalid characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};