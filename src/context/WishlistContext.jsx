// context/WishlistContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const loadWishlist = useCallback(async () => {
    if (!currentUser) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Здесь ваш код загрузки избранного из API или localStorage
      // Пример для localStorage:
      const savedWishlist = localStorage.getItem(`wishlist_${currentUser.uid}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]); // Зависимость только currentUser

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]); // Теперь зависимость стабильна благодаря useCallback

  const addToWishlist = useCallback(async (product) => {
    if (!currentUser) {
      // Можно показать уведомление, что нужно войти
      return;
    }

    try {
      const newWishlist = [...wishlist];
      const existingItemIndex = newWishlist.findIndex(item => item.id === product.id);
      
      if (existingItemIndex === -1) {
        newWishlist.push({ ...product, addedAt: new Date().toISOString() });
        setWishlist(newWishlist);
        localStorage.setItem(`wishlist_${currentUser.uid}`, JSON.stringify(newWishlist));
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  }, [currentUser, wishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!currentUser) return;

    try {
      const newWishlist = wishlist.filter(item => item.id !== productId);
      setWishlist(newWishlist);
      localStorage.setItem(`wishlist_${currentUser.uid}`, JSON.stringify(newWishlist));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  }, [currentUser, wishlist]);

  const removeFromWishlistByProduct = useCallback(async (productId) => {
    if (!currentUser) return;
    
    try {
      await wishlistService.removeFromWishlistByProduct(currentUser.id, productId);
      await loadWishlist(); // Перезагружаем список
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }, [currentUser, loadWishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  const getWishlistCount = useCallback(() => {
    return wishlist.length;
  }, [wishlist]);

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProduct,
    isInWishlist,
    getWishlistCount,
    refreshWishlist: loadWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};