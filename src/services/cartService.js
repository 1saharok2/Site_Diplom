import { apiService } from './api';

export const cartService = {
  getCart: async (userId) => {
    try {
      const cartItems = await apiService.get(`/cart.php?userId=${userId}`);
      return cartItems || [];
    } catch (error) {
      console.error('Error in getCart:', error);
      return [];
    }
  },

  addToCart: async (userId, productId, quantity = 1) => {
    try {
      const result = await apiService.post('/cart.php', {
        action: 'add',
        user_id: userId,
        product_id: productId,
        quantity: quantity
      });
      return result;
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  },

  updateCartItem: async (cartItemId, quantity) => {
    try {
      const result = await apiService.post('/cart.php', {
        action: 'update',
        id: cartItemId,
        quantity: quantity
      });
      return result;
    } catch (error) {
      console.error('Error in updateCartItem:', error);
      throw error;
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      const result = await apiService.post('/cart.php', {
        action: 'remove',
        id: cartItemId
      });
      return result;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      throw error;
    }
  },

  clearCart: async (userId) => {
    try {
      const result = await apiService.post('/cart.php', {
        action: 'clear',
        user_id: userId
      });
      return result;
    } catch (error) {
      console.error('Error in clearCart:', error);
      throw error;
    }
  },

  getCartTotal: (cartItems) => {
    return cartItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  },

  getCartItemsCount: (cartItems) => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }
};
