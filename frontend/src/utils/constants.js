export const DIFFICULTY_LEVELS = [
  { value: 'Beginner', label: 'Beginner', color: 'green' },
  { value: 'Intermediate', label: 'Intermediate', color: 'orange' },
  { value: 'Advanced', label: 'Advanced', color: 'red' }
];

export const MATHEMATICAL_CONCEPTS = [
  'Algebra',
  'Calculus',
  'Geometry',
  'Trigonometry',
  'Probability',
  'Statistics',
  'Arithmetic',
  'Linear Algebra',
  'Differential Equations',
  'Number Theory',
  'Discrete Mathematics',
  'Optimization'
];

export const TRAINING_STATUS = {
  IDLE: 'idle',
  TRAINING: 'training',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const MODEL_STATUS = {
  LOADED: 'loaded',
  NOT_LOADED: 'not_loaded',
  TRAINING: 'training'
};

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'solve', label: 'Problem Solver', icon: '🧮', path: '/solve' },
  { id: 'chat', label: 'AI Chat', icon: '💬', path: '/chat' },
  { id: 'train', label: 'Training', icon: '🎓', path: '/train' },
  { id: 'community', label: 'Community', icon: '👥', path: '/community' }
];

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TRAINING_ERROR: 'Training failed. Please check your data and try again.'
};

export const SUCCESS_MESSAGES = {
  TRAINING_ADDED: 'Training data added successfully!',
  TRAINING_STARTED: 'Model training started successfully!',
  TRAINING_COMPLETED: 'Model training completed successfully!',
  PROBLEM_SOLVED: 'Problem solved successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!'
};

export const API_ENDPOINTS = {
  BASE: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  WS: process.env.REACT_APP_WS_URL || 'http://localhost:5000'
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de'
};