import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { wishlistService } from '../services/wishlistService';

const WishlistContext = createContext();

// Добавьте этот хук
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

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const wishlistData = await wishlistService.getUserWishlist(currentUser.id);
        setWishlist(wishlistData || []);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUser]);

  const addToWishlist = useCallback(async (productId) => {
    if (!currentUser) {
      throw new Error('User must be logged in to add to wishlist');
    }

    try {
      const wishlistItem = await wishlistService.addToWishlist(currentUser.id, productId);
      // Перезагружаем весь список после добавления
      const wishlistData = await wishlistService.getUserWishlist(currentUser.id);
      setWishlist(wishlistData || []);
      return wishlistItem;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }, [currentUser]);

  const removeFromWishlist = useCallback(async (wishlistItemId) => {
    if (!currentUser) return;

    try {
      await wishlistService.removeFromWishlist(wishlistItemId);
      setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }, [currentUser]);

  const removeFromWishlistByProduct = useCallback(async (productId) => {
    if (!currentUser) return;
    
    try {
      await wishlistService.removeFromWishlistByProduct(currentUser.id, productId);
      setWishlist(prev => prev.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }, [currentUser]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  const getWishlistCount = useCallback(() => {
    return wishlist.length;
  }, [wishlist]);

  const refreshWishlist = useCallback(async () => {
    if (!currentUser) {
      setWishlist([]);
      return;
    }

    try {
      setLoading(true);
      const wishlistData = await wishlistService.getUserWishlist(currentUser.id);
      setWishlist(wishlistData || []);
    } catch (error) {
      console.error('Error refreshing wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const toggleWishlist = useCallback(async (userId, productId) => {
    if (!currentUser) {
        throw new Error('User must be logged in to modify wishlist');
    }
    try {
        const result = await wishlistService.toggleWishlist(userId, productId);
        await refreshWishlist(); 
        
        return result;
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        throw error;
    }
  }, [currentUser, refreshWishlist]);

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProduct,
    isInWishlist,
    getWishlistCount,
    toggleWishlist,
    refreshWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Добавьте этот экспорт если нужно
export default WishlistProvider;