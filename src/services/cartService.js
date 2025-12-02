import { apiService } from './api';
import { getUserId } from '../utils/authUtils';

export const cartService = {
  getCart: async (userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      // Если не авторизован - локальная корзина
      if (actualUserId <= 0) {
        const localCart = localStorage.getItem('cart');
        return localCart ? JSON.parse(localCart) : [];
      }
      
      // Используем улучшенный метод apiService.getCart()
      const response = await apiService.getCart(actualUserId);
      
      // Проверяем формат ответа
      if (response && response.success) {
        return response.items || [];
      } else if (Array.isArray(response)) {
        // Для обратной совместимости
        return response;
      } else {
        throw new Error('Invalid cart response format');
      }
    } catch (error) {
      console.error('Error getting cart:', error);
      const localCart = localStorage.getItem('cart');
      return localCart ? JSON.parse(localCart) : [];
    }
  },

  addToCart: async (userId = null, productId, quantity = 1) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        // Для неавторизованных пользователей сохраняем в localStorage
        return cartService.addToLocalCart(productId, quantity);
      }
      
      const result = await apiService.post('/cart.php', {
        action: 'add',
        user_id: actualUserId,
        product_id: productId,
        quantity: quantity
      });
      return result;
    } catch (error) {
      console.error('Error in addToCart:', error);
      // Fallback на localStorage при ошибке
      return cartService.addToLocalCart(productId, quantity);
    }
  },

  // Добавляем методы для работы с локальной корзиной
  addToLocalCart: (productId, quantity = 1) => {
    try {
      const localCart = localStorage.getItem('cart');
      let cart = localCart ? JSON.parse(localCart) : [];
      
      // Проверяем, есть ли уже такой товар в корзине
      const existingItemIndex = cart.findIndex(item => item.product_id == productId);
      
      if (existingItemIndex !== -1) {
        // Обновляем количество
        cart[existingItemIndex].quantity += quantity;
      } else {
        // Добавляем новый товар
        cart.push({
          product_id: productId,
          quantity: quantity,
          id: Date.now() // временный ID
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      return {
        success: true,
        message: 'Товар добавлен в локальную корзину'
      };
    } catch (error) {
      console.error('Error adding to local cart:', error);
      throw error;
    }
  },

  updateCartItem: async (cartItemId, quantity, userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        return cartService.updateLocalCartItem(cartItemId, quantity);
      }
      
      const result = await apiService.post('/cart.php', {
        action: 'update',
        id: cartItemId,
        quantity: quantity,
        user_id: actualUserId
      });
      return result;
    } catch (error) {
      console.error('Error in updateCartItem:', error);
      return cartService.updateLocalCartItem(cartItemId, quantity);
    }
  },

  updateLocalCartItem: (cartItemId, quantity) => {
    try {
      const localCart = localStorage.getItem('cart');
      let cart = localCart ? JSON.parse(localCart) : [];
      
      const itemIndex = cart.findIndex(item => item.id == cartItemId);
      
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Удаляем товар
          cart.splice(itemIndex, 1);
        } else {
          // Обновляем количество
          cart[itemIndex].quantity = quantity;
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        return {
          success: true,
          message: 'Корзина обновлена'
        };
      }
      
      return {
        success: false,
        message: 'Товар не найден в корзине'
      };
    } catch (error) {
      console.error('Error updating local cart item:', error);
      throw error;
    }
  },

  removeFromCart: async (cartItemId, userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        return cartService.removeFromLocalCart(cartItemId);
      }
      
      const result = await apiService.post('/cart.php', {
        action: 'remove',
        id: cartItemId,
        user_id: actualUserId
      });
      return result;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return cartService.removeFromLocalCart(cartItemId);
    }
  },

  removeFromLocalCart: (cartItemId) => {
    try {
      const localCart = localStorage.getItem('cart');
      let cart = localCart ? JSON.parse(localCart) : [];
      
      const filteredCart = cart.filter(item => item.id != cartItemId);
      
      localStorage.setItem('cart', JSON.stringify(filteredCart));
      
      return {
        success: true,
        message: 'Товар удален из корзины'
      };
    } catch (error) {
      console.error('Error removing from local cart:', error);
      throw error;
    }
  },

  clearCart: async (userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (actualUserId <= 0) {
        localStorage.removeItem('cart');
        return {
          success: true,
          message: 'Локальная корзина очищена'
        };
      }
      
      const result = await apiService.post('/cart.php', {
        action: 'clear',
        user_id: actualUserId
      });
      return result;
    } catch (error) {
      console.error('Error in clearCart:', error);
      localStorage.removeItem('cart');
      return {
        success: true,
        message: 'Локальная корзина очищена'
      };
    }
  },

  getCartTotal: (cartItems) => {
    return cartItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  },

  getCartItemsCount: (cartItems) => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  },

  // Метод для синхронизации локальной корзины с сервером после авторизации
  syncCartWithServer: async (userId) => {
    try {
      const localCart = localStorage.getItem('cart');
      
      if (!localCart || userId <= 0) {
        return { success: false, message: 'Нет данных для синхронизации' };
      }
      
      const cart = JSON.parse(localCart);
      
      // Добавляем все товары из локальной корзины на сервер
      for (const item of cart) {
        await apiService.post('/cart.php', {
          action: 'add',
          user_id: userId,
          product_id: item.product_id,
          quantity: item.quantity
        });
      }
      
      // Очищаем локальную корзину после успешной синхронизации
      localStorage.removeItem('cart');
      
      return { 
        success: true, 
        message: 'Корзина синхронизирована',
        syncedItems: cart.length 
      };
    } catch (error) {
      console.error('Error syncing cart:', error);
      return { 
        success: false, 
        message: 'Ошибка синхронизации корзины' 
      };
    }
  }
};