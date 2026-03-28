import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/api';
import { adminService } from '../services/adminService';
import { cartService } from '../services/cartService';
import { wishlistService } from '../services/wishlistService';
import { IS_DEV } from '../utils/devLog';

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

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    setCurrentUser(null);
  }, []);

  const loadUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/get_user.php', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('userData', JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch (error) {
      if (IS_DEV) console.error('Ошибка при получении данных пользователя:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          setCurrentUser(JSON.parse(userData));
          await loadUserData();
        } catch (error) {
          if (IS_DEV) console.error('Error parsing user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [loadUserData, logout]);

  const login = useCallback(async (credentials) => {
    try {
      const response = await apiService.login(credentials);
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
      
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      setCurrentUser(userData);
      
      await loadUserData();
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message || 'Ошибка входа' };
    }
  }, [loadUserData]);

  const register = useCallback(async (userData) => {
    try {
      const res = await apiService.register(userData);
      if (!res || !res.user || !res.token) {
        throw new Error('Сервер не вернул необходимые данные');
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('userData', JSON.stringify(res.user));
      localStorage.setItem('userId', res.user.id.toString());
      
      setCurrentUser(res.user);

      try {
        await Promise.all([
          cartService.syncCartWithServer(res.user.id),
          wishlistService.syncWishlistWithServer(res.user.id)
        ]);
      } catch (e) {
        if (IS_DEV) console.warn('Sync error:', e);
      }

      return { success: true, user: res.user };
    } catch (error) {
      logout();
      return { success: false, error: error.message || 'Ошибка регистрации' };
    }
  }, [logout]);

  const updateProfile = useCallback(async (userData) => {
    try {
      await adminService.updateUser(currentUser.id, userData);
      
      const freshUser = await loadUserData();
      
      return { success: true, user: freshUser || userData };
    } catch (error) {
      return { success: false, error: error.message || 'Ошибка обновления' };
    }
  }, [currentUser, loadUserData]);

  const value = useMemo(() => ({
    user: currentUser,
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    loadUserData,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin'
  }), [
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
    loadUserData
  ]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
