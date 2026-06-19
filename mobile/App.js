import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import styles, { COLORS } from './styles';
import { API_URL } from './config';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [tempPhone, setTempPhone] = useState('');
  const [currentScreen, setCurrentScreen] = useState('loading');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      
      if (!storedToken) {
        setCurrentScreen('login');
        return;
      }

      console.log('Restoring session with API:', `${API_URL}/users/get`);
      const response = await axios.get(`${API_URL}/users/get`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      
      if (response.data?.success && response.data?.user?.isRegistered) {
        setUser(response.data.user);
        setToken(storedToken);
        setCurrentScreen('dashboard');
      } else {
        setToken(storedToken);
        setTempPhone(response.data?.user?.phone || '');
        setCurrentScreen('register');
      }
    } catch (err) {
      console.warn('Session restoration failed:', err.response?.data?.error || err.message);
      await AsyncStorage.removeItem('auth_token');
      setCurrentScreen('login');
    }
  };

  const handleAuthSuccess = async (authenticatedUser, authToken) => {
    try {
      await AsyncStorage.setItem('auth_token', authToken);
      setUser(authenticatedUser);
      setToken(authToken);
      setCurrentScreen('dashboard');
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const handleNavigateToRegister = async (authToken) => {
    try {
      await AsyncStorage.setItem('auth_token', authToken);
      setToken(authToken);
      setCurrentScreen('register');
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const handleRegisterSuccess = async (registeredUser, authToken) => {
    try {
      await AsyncStorage.setItem('auth_token', authToken);
      setUser(registeredUser);
      setToken(authToken);
      setCurrentScreen('dashboard');
    } catch (e) {
      console.error('Failed to save token', e);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
      setTempPhone('');
      setCurrentScreen('login');
    } catch (e) {
      console.error('Failed to remove token', e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgDark }}>
      <StatusBar style="light" />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {currentScreen === 'loading' && (
          <View style={{ alignItems: 'center', gap: 16 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ color: COLORS.textMuted, fontSize: 15 }}>
              Restoring secure session...
            </Text>
          </View>
        )}

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
      </ScrollView>
    </SafeAreaView>
  );
}
