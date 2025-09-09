// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      
      console.log('Login response:', response); 
      
      let userData, token;
      
      if (response.user && response.token) {
        userData = response.user;
        token = response.token;
      } else if (response.data && response.data.user) {
        userData = response.data.user;
        token = response.data.token;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
      if (!userData || !token) {
        throw new Error('Отсутствуют данные пользователя или токен');
      }
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setCurrentUser(userData);
      
      return { success: true, user: userData };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Ошибка входа' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Для регистрации также добавляем обработку API
      const response = await apiService.register(userData);
      
      let newUser, token;
      
      if (response.user && response.token) {
        newUser = response.user;
        token = response.token;
      } else if (response.data && response.data.user) {
        newUser = response.data.user;
        token = response.data.token;
      } else {
        // Fallback на моковые данные если API не работает
        newUser = {
          ...userData,
          id: Math.floor(Math.random() * 1000) + 3,
          role: 'user',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        token = 'mock-jwt-token';
      }
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(newUser));
      setCurrentUser(newUser);
      
      return { success: true, user: newUser };
      
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.message || 'Ошибка регистрации' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Ошибка обновления профиля' 
      };
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};