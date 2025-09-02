import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const auth = {
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }
};

export const solveProblem = async (problem) => {
  const response = await api.post('/solve', { problem });
  return response.data;
};

export const getProblems = async (params = {}) => {
  const response = await api.get('/problems', { params });
  return response.data;
};

export const submitTrainingData = async (data) => {
  const response = await api.post('/train', data);
  return response.data;
};

export const getTrainingData = async (page = 1, limit = 20) => {
  const response = await api.get('/training-data', {
    params: { page, limit }
  });
  return response.data;
};

export const retrainModel = async () => {
  const response = await api.post('/retrain');
  return response.data;
};

export const getTrainingStatus = async () => {
  const response = await api.get('/training/status');
  return response.data;
};

export const submitFeedback = async (feedbackData) => {
  const response = await api.post('/feedback', feedbackData);
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getSolutionHistory = async (userId, page = 1, limit = 20) => {
  const response = await api.get('/solutions/history', {
    params: { userId, page, limit }
  });
  return response.data;
};

export default api;