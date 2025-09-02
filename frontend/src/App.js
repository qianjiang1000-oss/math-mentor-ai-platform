import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Navigation from './components/Layout/Navigation';
import Home from './pages/Home';
import Solve from './pages/Solve';
import Train from './pages/Train';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import './App.css';

function App() {
  const { user, loading } = useAuth();
  const { currentPage } = useApp();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Math Mentor AI...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {user && <Header />}
        {user && <Navigation />}
        
        <main className={`app-main ${!user ? 'auth-page' : ''}`}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/dashboard" /> : <Register />} 
            />
            
            {/* Protected routes */}
            <Route 
              path="/" 
              element={user ? <Home /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/solve" 
              element={user ? <Solve /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/train" 
              element={user ? <Train /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chat" 
              element={user ? <Chat /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/community" 
              element={user ? <Community /> : <Navigate to="/login" />} 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </main>

        {user && <Footer />}
      </div>
    </Router>
  );
}

export default App;