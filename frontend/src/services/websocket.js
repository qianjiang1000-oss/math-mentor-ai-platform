import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect() {
    if (this.socket) {
      return;
    }

    const token = localStorage.getItem('token');
    this.socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.emit('connected');
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Add default listeners
    this.socket.on('training_started', (data) => {
      this.emit('training_started', data);
    });

    this.socket.on('training_progress', (data) => {
      this.emit('training_progress', data);
    });

    this.socket.on('training_completed', (data) => {
      this.emit('training_completed', data);
    });

    this.socket.on('training_failed', (data) => {
      this.emit('training_failed', data);
    });

    this.socket.on('training_data_added', (data) => {
      this.emit('training_data_added', data);
    });

    this.socket.on('chat_response', (data) => {
      this.emit('chat_response', data);
    });

    this.socket.on('chat_error', (data) => {
      this.emit('chat_error', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }

  sendChatMessage(message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat_message', message);
    }
  }

  startTraining() {
    if (this.socket && this.isConnected) {
      this.socket.emit('start_training');
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();