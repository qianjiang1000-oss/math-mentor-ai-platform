import { useState, useEffect, useCallback } from 'react';
import { webSocketService } from '../services/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(webSocketService.getConnectionStatus());
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Connect to WebSocket
    webSocketService.connect();

    // Listen for connection status changes
    const handleConnectionChange = () => {
      setIsConnected(webSocketService.getConnectionStatus());
    };

    webSocketService.on('connected', handleConnectionChange);
    webSocketService.on('disconnect', handleConnectionChange);

    // Cleanup on unmount
    return () => {
      webSocketService.off('connected', handleConnectionChange);
      webSocketService.off('disconnect', handleConnectionChange);
    };
  }, []);

  const sendMessage = useCallback((message) => {
    webSocketService.sendChatMessage(message);
  }, []);

  const startTraining = useCallback(() => {
    webSocketService.startTraining();
  }, []);

  // Listen for chat messages
  useEffect(() => {
    const handleChatMessage = (data) => {
      setMessages(prev => [...prev, { ...data, type: 'response', id: Date.now() }]);
    };

    webSocketService.on('chat_response', handleChatMessage);
    webSocketService.on('chat_error', handleChatMessage);

    return () => {
      webSocketService.off('chat_response', handleChatMessage);
      webSocketService.off('chat_error', handleChatMessage);
    };
  }, []);

  // Listen for training events
  const useTrainingEvents = (callback) => {
    useEffect(() => {
      const events = [
        'training_started',
        'training_progress',
        'training_completed',
        'training_failed'
      ];

      events.forEach(event => {
        webSocketService.on(event, callback);
      });

      return () => {
        events.forEach(event => {
          webSocketService.off(event, callback);
        });
      };
    }, [callback]);
  };

  return {
    isConnected,
    messages,
    sendMessage,
    startTraining,
    useTrainingEvents,
    webSocketService
  };
};