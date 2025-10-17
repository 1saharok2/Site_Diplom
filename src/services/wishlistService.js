import { apiService } from "./api";

export const wishlistService = {
  // Получить все избранные товары пользователя
  getUserWishlist: async (userId) => {
    try {
      const wishlist = await apiService.get(`/wishlist/${userId}`);
      return wishlist || [];
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      return [];
    }
  },

  // Добавить товар в избранное
  addToWishlist: async (userId, productId) => {
    try {
      const result = await apiService.post('/wishlist/add', {
        user_id: userId,
        product_id: productId
      });
      return result;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Удалить товар из избранного
  removeFromWishlist: async (wishlistItemId) => {
    try {
      await apiService.delete(`/wishlist/${wishlistItemId}`);
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Удалить товар из избранного по product_id
  removeFromWishlistByProduct: async (userId, productId) => {
    try {
      await apiService.delete(`/wishlist/user/${userId}/product/${productId}`);
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Проверить, есть ли товар в избранном
  isInWishlist: async (userId, productId) => {
    try {
      const result = await apiService.get(`/wishlist/check/${userId}/${productId}`);
      return result.is_in_wishlist || false;
    } catch (error) {
      return false;
    }
  },

  // Получить количество избранных товаров
  getWishlistCount: async (userId) => {
    try {
      const result = await apiService.get(`/wishlist/count/${userId}`);
      return result.count || 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }
};