import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tempPhone, setTempPhone] = useState('');
  const [currentScreen, setCurrentScreen] = useState('loading');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const storedToken = localStorage.getItem('auth_token');
    
    if (!storedToken) {
      setCurrentScreen('login');
      return;
    }

    try {
      // Fetch user data using saved token
      const response = await axios.get(`${API_URL}/users/get`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      if (response.data?.success && response.data?.user?.isRegistered) {
        setUser(response.data.user);
        setToken(storedToken);
        setCurrentScreen('dashboard');
      } else {
        // Auth exists but profile registration is incomplete
        setToken(storedToken);
        setTempPhone(response.data?.user?.phone || '');
        setCurrentScreen('register');
      }
    } catch (err) {
      console.warn('Session restoration failed:', err.response?.data?.error || err.message);
      localStorage.removeItem('auth_token');
      setCurrentScreen('login');
    }
  };

  const handleAuthSuccess = (authenticatedUser, authToken) => {
    setUser(authenticatedUser);
    setToken(authToken);
    setCurrentScreen('dashboard');
  };

  const handleNavigateToRegister = (authToken) => {
    setToken(authToken);
    setCurrentScreen('register');
  };

  const handleRegisterSuccess = (registeredUser, authToken) => {
    setUser(registeredUser);
    setToken(authToken);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setTempPhone('');
    setCurrentScreen('login');
  };

  if (currentScreen === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Restoring secure session...</p>
      </div>
    );
  }

  return (
    <>
      {currentScreen === 'login' && (
        <Login
          onAuthSuccess={handleAuthSuccess}
          onNavigateToRegister={handleNavigateToRegister}
          setTempPhone={setTempPhone}
        />
      )}
      {currentScreen === 'register' && (
        <Register
          token={token}
          tempPhone={tempPhone}
          onRegisterSuccess={handleRegisterSuccess}
          onCancel={handleLogout}
        />
      )}
      {currentScreen === 'dashboard' && (
        <Dashboard
          user={user}
          token={token}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default App;
