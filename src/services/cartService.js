import { apiService } from './api';
import { getUserId } from '../utils/authUtils';
import { getUserUuid } from '../utils/authUtils';
import { devLog, IS_DEV } from '../utils/devLog';

export const cartService = {
  getCart: async (userId = null, forceRefresh = false) => {
    try {
      const actualUserId = userId || getUserId();
      
      devLog('🔍 getCart вызван с параметрами:', {
        userId,
        actualUserId,
        forceRefresh,
        type: typeof actualUserId
      });
      
      // Если не авторизован - локальная корзина
      if (!actualUserId || actualUserId === '0' || actualUserId <= 0) {
        const localCart = localStorage.getItem('cart');
        return localCart ? JSON.parse(localCart) : [];
      }
      
      // Если НЕ принудительное обновление, пробуем кеш
      if (!forceRefresh) {
        const cacheKey = `cart_cache_${actualUserId}`;
        const cachedCart = localStorage.getItem(cacheKey);
        if (cachedCart) {
          devLog(`📦 Используем кэш из ${cacheKey}`);
          const items = JSON.parse(cachedCart);
          devLog(`📦 В кэше ${items.length} товаров`);
          return items;
        }
      }
      
      devLog('📡 Загружаем корзину с сервера...');
      
      // Загружаем с сервера
      const response = await apiService.getCart(actualUserId);
      
      devLog('📡 Ответ от сервера:', response);
      
      // Исправленная проверка формата ответа
      if (response && response.success && response.items) {
        devLog(`✅ Сервер вернул ${response.items.length || 0} товаров`);
        
        // Сохраняем в кеш
        const cacheKey = `cart_cache_${actualUserId}`;
        localStorage.setItem(cacheKey, JSON.stringify(response.items));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        
        return response.items;
      } else {
        devLog('ℹ️ Сервер вернул пустую корзину или неожиданный формат');
        return [];
      }
    } catch (error) {
      if (IS_DEV) console.error('❌ Ошибка загрузки корзины:', error);
      
      // Fallback на кеш при ошибке
      try {
        const fallbackUserId = userId || getUserId();
        if (fallbackUserId) {
          const cacheKey = `cart_cache_${fallbackUserId}`;
          const cachedCart = localStorage.getItem(cacheKey);
          if (cachedCart) {
            devLog(`🔄 Используем кэш после ошибки`);
            return JSON.parse(cachedCart);
          }
        }
      } catch (cacheError) {
        if (IS_DEV) console.error('❌ Ошибка чтения кэша:', cacheError);
      }
      
      return [];
    }
  },

  addToCart: async (userId = null, productId, quantity = 1) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (!actualUserId || actualUserId <= 0) {
        devLog('👤 Гость, добавляем в локальную корзину');
        return cartService.addToLocalCart(productId, quantity);
      }
      
      devLog('🛒 Добавление в корзину:', { actualUserId, productId, quantity });
      
      const result = await apiService.post('/cart.php', {
        action: 'add',
        user_id: actualUserId,
        product_id: productId,
        quantity: quantity
      });
      
      devLog('✅ Результат добавления:', result);
      
      // КРИТИЧЕСКО ВАЖНО: Очищаем кеш после изменения
      localStorage.removeItem(`cart_cache_${actualUserId}`);
      localStorage.removeItem(`cart_cache_${actualUserId}_timestamp`);
      devLog('🗑️ Кеш корзины очищен');
      
      if (!result.success) {
        throw new Error(result.message || 'Ошибка удаления на сервере');
      }

      return result;
    } catch (error) {
      if (IS_DEV) console.error('❌ Ошибка в addToCart:', error);
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
      if (IS_DEV) console.error('Error adding to local cart:', error);
      throw error;
    }
  },

  updateCartItem: async (cartItemId, quantity, userId = null) => {
    try {
      const actualUserId = userId || getUserId();
      
      if (!actualUserId || actualUserId <= 0) {
        return cartService.updateLocalCartItem(cartItemId, quantity);
      }
      
      const result = await apiService.post('/cart.php', {
        action: 'update',
        id: cartItemId,
        quantity: quantity,
        user_id: actualUserId
      });
      
      // Очищаем кеш после обновления
      if (result.success) {
        localStorage.removeItem(`cart_cache_${actualUserId}`);
        localStorage.removeItem(`cart_cache_${actualUserId}_timestamp`);
      }
      
      return result;
    } catch (error) {
      if (IS_DEV) console.error('❌ Ошибка updateCartItem:', error);
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
      if (IS_DEV) console.error('Error updating local cart item:', error);
      throw error;
    }
  },

  removeFromCart: async (cartItemId, userUuid = null) => {
    devLog('🗑️ removeFromCart вызван с параметрами:', { cartItemId, userUuid });
    
    try {
      const actualUserId = userUuid || getUserUuid(); // важно: используем UUID, а не getUserId()
      devLog('🆔 actualUserId (UUID):', actualUserId);

      if (!actualUserId) {
        if (IS_DEV) console.error('❌ Нет UUID пользователя');
        throw new Error('Не удалось определить UUID пользователя');
      }

      // Очищаем кэш по UUID
      localStorage.removeItem(`cart_cache_${actualUserId}`);
      localStorage.removeItem(`cart_cache_${actualUserId}_timestamp`);
      devLog('🗑️ Кэш очищен для UUID:', actualUserId);

      // Отправляем запрос на сервер
      const result = await apiService.post('/cart.php', {
        action: 'remove',
        id: cartItemId,
        user_id: actualUserId // передаём UUID
      });
      
      devLog('✅ Ответ сервера:', result);
      return result;
    } catch (error) {
      if (IS_DEV) console.error('❌ Ошибка в removeFromCart:', error);
      throw error;
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
      if (IS_DEV) console.error('Error removing from local cart:', error);
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
      if (IS_DEV) console.error('Error in clearCart:', error);
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
      if (IS_DEV) console.error('Error syncing cart:', error);
      return { 
        success: false, 
        message: 'Ошибка синхронизации корзины' 
      };
    }
  }
};