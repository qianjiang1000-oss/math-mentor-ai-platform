import React, { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useAuth } from '../../context/AuthContext';
import Message from './Message';
import './Chat.css';

const ChatInterface = () => {
  const { user } = useAuth();
  const { messages, sendMessage, isConnected } = useWebSocket();
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to local state immediately
    const userMessage = {
      id: Date.now(),
      type: 'user',
      problem: message,
      timestamp: new Date().toISOString(),
      username: user.username
    };

    // Send message via WebSocket
    sendMessage({ problem: message });

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Math Chat</h2>
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Ask me any mathematical problem and I'll help you solve it!</p>
            <div className="chat-examples">
              <h4>Try asking:</h4>
              <ul>
                <li>"Solve for x: 2x + 5 = 15"</li>
                <li>"What's the derivative of x²?"</li>
                <li>"Explain quadratic equations"</li>
                <li>"Help me with calculus homework"</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="message loading-message">
                <div className="message-content">
                  <div className="thinking">
                    <span>Thinking</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your mathematical problem here..."
            disabled={!isConnected || isLoading}
            rows="2"
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || !isConnected || isLoading}
            className="send-button"
          >
            <span className="send-icon">📤</span>
          </button>
        </div>
        
        <div className="input-footer">
          <span className="connection-hint">
            {!isConnected && 'Connecting to AI...'}
          </span>
          <span className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;