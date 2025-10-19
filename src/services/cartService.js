import { apiService } from './api';

export const cartService = {
  getCart: async (userId) => {
    try {
      const cartItems = await apiService.get(`/cart/${userId}`);
      return cartItems || [];
    } catch (error) {
      console.error('Error in getCart:', error);
      return [];
    }
  },

  addToCart: async (userId, productId, quantity = 1) => {
    try {
      const result = await apiService.post('/cart/add', {
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
      if (quantity <= 0) {
        return await cartService.removeFromCart(cartItemId);
      }
      const result = await apiService.put(`/cart/${cartItemId}`, {
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
      // Используем POST с _method: DELETE
      const result = await apiService.post(`/cart/${cartItemId}`, {
        _method: 'DELETE'
      });
      return result;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      throw error;
    }
  },

  clearCart: async (userId) => {
    try {
      // Используем POST с _method: DELETE (вместо прямого DELETE)
      const result = await apiService.post('/cart', { action: 'clear', user_id: userId });
      return result;
    } catch (error) {
      console.error('Error in clearCart:', error);
      throw error;
    }
  },

  getCartTotal: (cartItems) => {
    return cartItems.reduce((total, item) => {
      return total + (item.products?.price || 0) * item.quantity;
    }, 0);
  },

  getCartItemsCount: (cartItems) => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }
};
