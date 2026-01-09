import { apiService } from './api';
import { getUserId } from '../utils/authUtils';

export const cartService = {
  getCart: async (userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      console.log('🔍 getCart вызван с userId:', {
        полученный_userId: userId,
        actualUserId,
        тип: typeof actualUserId,
        все_ключи_localStorage: Object.keys(localStorage).filter(k => k.includes('cart') || k.includes('user'))
      });
      
      // Если не авторизован - локальная корзина
      if (!actualUserId || actualUserId === '0' || actualUserId <= 0) {
        const localCart = localStorage.getItem('cart');
        return localCart ? JSON.parse(localCart) : [];
      }
      
      // ⚠️ ВАЖНО: Пробуем ОБА варианта ключа
      const possibleCacheKeys = [
        `cart_cache_${actualUserId}`,           // Как у вас сейчас
        `cart_cache_${actualUserId.toString()}`, // Строковый вариант
        'cart_cache',                           // Общий ключ
        'cart'                                  // Простой ключ
      ];
      
      // Пробуем каждый ключ
      for (const cacheKey of possibleCacheKeys) {
        const cachedCart = localStorage.getItem(cacheKey);
        if (cachedCart) {
          console.log(`📦 Нашли кэш по ключу: ${cacheKey}`);
          return JSON.parse(cachedCart);
        }
      }
      
      console.log('📡 Кэш не найден, загружаем с сервера...');
      
      // Загружаем с сервера
      const response = await apiService.getCart(actualUserId);
      
      // Проверяем формат ответа
      if (response && response.success) {
        console.log(`✅ Сервер вернул ${response.items?.length || 0} товаров`);
        
        // Сохраняем во ВСЕ возможные ключи
        possibleCacheKeys.forEach(cacheKey => {
          localStorage.setItem(cacheKey, JSON.stringify(response.items || []));
        });
        
        return response.items || [];
      } else if (Array.isArray(response)) {
        return response;
      } else {
        throw new Error('Invalid cart response format');
      }
    } catch (error) {
      console.error('Error getting cart:', error);
      
      // Пробуем найти кэш при ошибке
      const allKeys = Object.keys(localStorage);
      const cartKeys = allKeys.filter(k => k.includes('cart'));
      
      for (const key of cartKeys) {
        const cachedCart = localStorage.getItem(key);
        if (cachedCart) {
          console.log(`🔄 Используем кэш из ${key} после ошибки`);
          return JSON.parse(cachedCart);
        }
      }
      
      return [];
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
      
      console.log(`🔧 updateCartItem:`, {
        cartItemId,
        quantity,
        actualUserId,
        method: 'POST /cart.php'
      });
      
      if (actualUserId <= 0) {
        console.log('👤 Гость, обновляем локально');
        return cartService.updateLocalCartItem(cartItemId, quantity);
      }
      
      // Проверьте, что actualUserId правильный
      console.log(`📡 Отправка на сервер для userId: ${actualUserId}`);
      
      const result = await apiService.post('/cart.php', {
        action: 'update',
        id: cartItemId,
        quantity: quantity,
        user_id: actualUserId
      });
      
      console.log('✅ Ответ сервера:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Ошибка updateCartItem:', error);
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
          cart.splice(itemIndex, 1);
        } else {
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
      const cacheKey = `cart_cache_${actualUserId}`;
      const cachedCart = localStorage.getItem(cacheKey);
      if (cachedCart) {
        const cart = JSON.parse(cachedCart);
        const updatedCart = cart.filter(item => item.id != cartItemId);
        localStorage.setItem(cacheKey, JSON.stringify(updatedCart));
        console.log('💾 Товар удален из локального кэша');
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
      localStorage.removeItem(`cart_cache_${actualUserId}`);
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