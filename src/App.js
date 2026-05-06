import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setCurrentUser(user.email);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setCurrentUser(email);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const Dashboard = () => (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome, {currentUser}!</h2>
        <p>You are now logged in securely with Firebase.</p>
        <button onClick={handleLogout} className="btn btn-secondary">Sign out</button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        {/* Pass onLogin to RegisterPage so Google sign-up can log user in directly */}
        <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
        <Route
          path="/"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;