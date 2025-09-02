import React from 'react';
import ChatInterface from '../components/Chat/ChatInterface';
import './Pages.css';

const Chat = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>AI Math Chat</h1>
        <p>Have a conversation with our AI about mathematics</p>
      </div>
      <ChatInterface />
    </div>
  );
};

export default Chat;