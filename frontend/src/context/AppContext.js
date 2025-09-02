import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [trainingStatus, setTrainingStatus] = useState({
    isTraining: false,
    progress: 0,
    message: '',
    trainingId: null
  });
  const [modelStatus, setModelStatus] = useState({
    loaded: false,
    accuracy: 0,
    version: '1.0.0',
    trainingDate: null
  });
  const [notifications, setNotifications] = useState([]);

  const updateTrainingStatus = (status) => {
    setTrainingStatus(prev => ({ ...prev, ...status }));
  };

  const updateModelStatus = (status) => {
    setModelStatus(prev => ({ ...prev, ...status }));
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    currentPage,
    setCurrentPage,
    trainingStatus,
    updateTrainingStatus,
    modelStatus,
    updateModelStatus,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};