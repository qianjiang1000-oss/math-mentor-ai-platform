import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/auth';
import { auth } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        // Set default auth header
        auth.setAuthToken(token);
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { token, user: userData } = response;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set default auth header
        auth.setAuthToken(token);
        
        setUser(userData);
        return { success: true };
      } else {
        setError(response.error || 'Login failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Network error. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.register(username, email, password);
      
      if (response.success) {
        const { token, user: userData } = response;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set default auth header
        auth.setAuthToken(token);
        
        setUser(userData);
        return { success: true };
      } else {
        setError(response.error || 'Registration failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Network error. Please try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    auth.setAuthToken(null);
    setUser(null);
    setError('');
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};