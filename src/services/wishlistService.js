import { apiService } from "./api";
import { getUserId } from '../utils/authUtils';

export const wishlistService = {
  // Получить все избранные товары пользователя
  getUserWishlist: async (userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        console.log('⭐ Пользователь не авторизован, возвращаю локальное избранное');
        const localWishlist = localStorage.getItem('wishlist');
        return localWishlist ? JSON.parse(localWishlist) : [];
      }
      
      const response = await apiService.get(`/wishlist.php?userId=${actualUserId}`);
      
      // API теперь возвращает {success: true, items: [], count: 0, ...}
      if (response.success) {
        return response.items || [];
      } else {
        console.warn('⚠ API вернуло ошибку:', response.message);
        const localWishlist = localStorage.getItem('wishlist');
        return localWishlist ? JSON.parse(localWishlist) : [];
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      const localWishlist = localStorage.getItem('wishlist');
      return localWishlist ? JSON.parse(localWishlist) : [];
    }
  },

  // Добавить товар в избранное
  addToWishlist: async (userId = null, productId) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        // Для неавторизованных пользователей - локальное хранение
        return wishlistService.addToLocalWishlist(productId);
      }
      
      const result = await apiService.post('/wishlist.php', {
        action: 'add',
        user_id: actualUserId,
        product_id: productId
      });
      return result;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return wishlistService.addToLocalWishlist(productId);
    }
  },

  // Удалить товар из избранного
  removeFromWishlist: async (wishlistItemId, userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        return wishlistService.removeFromLocalWishlistById(wishlistItemId);
      }
      
      await apiService.delete(`/wishlist/${wishlistItemId}`);
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return wishlistService.removeFromLocalWishlistById(wishlistItemId);
    }
  },

  // Удалить товар из избранного по product_id
  removeFromWishlistByProduct: async (userId = null, productId) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        return wishlistService.removeFromLocalWishlistByProduct(productId);
      }
      
      await apiService.delete(`/wishlist/user/${actualUserId}/product/${productId}`);
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return wishlistService.removeFromLocalWishlistByProduct(productId);
    }
  },

  // Проверить, есть ли товар в избранном
  isInWishlist: async (userId = null, productId) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        return wishlistService.isInLocalWishlist(productId);
      }
      
      const result = await apiService.get(`/wishlist/check/${actualUserId}/${productId}`);
      return result.is_in_wishlist || false;
    } catch (error) {
      return wishlistService.isInLocalWishlist(productId);
    }
  },

  // Получить количество избранных товаров
  getWishlistCount: async (userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        const localWishlist = localStorage.getItem('wishlist');
        const wishlist = localWishlist ? JSON.parse(localWishlist) : [];
        return wishlist.length;
      }
      
      const result = await apiService.get(`/wishlist/count/${actualUserId}`);
      return result.count || 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      
      const localWishlist = localStorage.getItem('wishlist');
      const wishlist = localWishlist ? JSON.parse(localWishlist) : [];
      return wishlist.length;
    }
  },

  toggleWishlist: async (userId = null, productId) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (!productId) {
        throw new Error("Product ID must be provided.");
      }
      
      if (actualUserId <= 0) {
        // Логика для неавторизованных пользователей
        return wishlistService.toggleLocalWishlist(productId);
      }
      
      const result = await apiService.post('/wishlist.php', {
        action: 'toggle',
        user_id: actualUserId,
        product_id: productId
      });
      return result;
    } catch (error) {
      console.error('Error toggling wishlist status:', error);
      return wishlistService.toggleLocalWishlist(productId);
    }
  },

  // Локальные методы для работы с избранным в localStorage
  
  addToLocalWishlist: (productId) => {
    try {
      const localWishlist = localStorage.getItem('wishlist');
      let wishlist = localWishlist ? JSON.parse(localWishlist) : [];
      
      // Проверяем, есть ли уже такой товар
      if (!wishlist.find(item => item.product_id == productId)) {
        wishlist.push({
          product_id: productId,
          id: Date.now(),
          added_at: new Date().toISOString()
        });
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
      
      return {
        success: true,
        action: 'added',
        message: 'Товар добавлен в избранное'
      };
    } catch (error) {
      console.error('Error adding to local wishlist:', error);
      throw error;
    }
  },

  removeFromLocalWishlistById: (wishlistItemId) => {
    try {
      const localWishlist = localStorage.getItem('wishlist');
      let wishlist = localWishlist ? JSON.parse(localWishlist) : [];
      
      const filteredWishlist = wishlist.filter(item => item.id != wishlistItemId);
      
      localStorage.setItem('wishlist', JSON.stringify(filteredWishlist));
      
      return {
        success: true,
        action: 'removed',
        message: 'Товар удален из избранного'
      };
    } catch (error) {
      console.error('Error removing from local wishlist:', error);
      throw error;
    }
  },

  removeFromLocalWishlistByProduct: (productId) => {
    try {
      const localWishlist = localStorage.getItem('wishlist');
      let wishlist = localWishlist ? JSON.parse(localWishlist) : [];
      
      const filteredWishlist = wishlist.filter(item => item.product_id != productId);
      
      localStorage.setItem('wishlist', JSON.stringify(filteredWishlist));
      
      return {
        success: true,
        action: 'removed',
        message: 'Товар удален из избранного'
      };
    } catch (error) {
      console.error('Error removing from local wishlist:', error);
      throw error;
    }
  },

  isInLocalWishlist: (productId) => {
    try {
      const localWishlist = localStorage.getItem('wishlist');
      if (!localWishlist) return false;
      
      const wishlist = JSON.parse(localWishlist);
      return wishlist.some(item => item.product_id == productId);
    } catch (error) {
      console.error('Error checking local wishlist:', error);
      return false;
    }
  },

  toggleLocalWishlist: (productId) => {
    try {
      const localWishlist = localStorage.getItem('wishlist');
      let wishlist = localWishlist ? JSON.parse(localWishlist) : [];
      
      const existingIndex = wishlist.findIndex(item => item.product_id == productId);
      
      if (existingIndex !== -1) {
        // Удаляем если уже есть
        wishlist.splice(existingIndex, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        return {
          success: true,
          action: 'removed',
          message: 'Товар удален из избранного'
        };
      } else {
        // Добавляем если нет
        wishlist.push({
          product_id: productId,
          id: Date.now(),
          added_at: new Date().toISOString()
        });
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        return {
          success: true,
          action: 'added',
          message: 'Товар добавлен в избранное'
        };
      }
    } catch (error) {
      console.error('Error toggling local wishlist:', error);
      throw error;
    }
  },

  // Синхронизация локального избранного с сервером
  syncWishlistWithServer: async (userId) => {
    try {
      const localWishlist = localStorage.getItem('wishlist');
      
      if (!localWishlist || userId <= 0) {
        return { success: false, message: 'Нет данных для синхронизации' };
      }
      
      const wishlist = JSON.parse(localWishlist);
      
      // Добавляем все товары из локального избранного на сервер
      for (const item of wishlist) {
        await apiService.post('/wishlist.php', {
          action: 'add',
          user_id: userId,
          product_id: item.product_id
        });
      }
      
      // Очищаем локальное избранное после успешной синхронизации
      localStorage.removeItem('wishlist');
      
      return { 
        success: true, 
        message: 'Избранное синхронизировано',
        syncedItems: wishlist.length 
      };
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      return { 
        success: false, 
        message: 'Ошибка синхронизации избранного' 
      };
    }
  },

  // Получить все локальные товары
  getLocalWishlist: () => {
    try {
      const localWishlist = localStorage.getItem('wishlist');
      return localWishlist ? JSON.parse(localWishlist) : [];
    } catch (error) {
      console.error('Error getting local wishlist:', error);
      return [];
    }
  },

  // Очистить локальное избранное
  clearLocalWishlist: () => {
    try {
      localStorage.removeItem('wishlist');
      return { success: true, message: 'Локальное избранное очищено' };
    } catch (error) {
      console.error('Error clearing local wishlist:', error);
      throw error;
    }
  }
};