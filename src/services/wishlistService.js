// services/wishlistService.js
import { supabase } from "./supabaseClient";

export const wishlistService = {
  // Получить все избранные товары пользователя
  getUserWishlist: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_wishlist')
        .select(`
          *,
          products (
            id,
            name,
            price,
            old_price,
            image_url,
            slug,
            category_slug,
            rating,
            discount,
            is_new
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  },

  // Добавить товар в избранное
  addToWishlist: async (userId, productId) => {
    try {
      const { data, error } = await supabase
        .from('user_wishlist')
        .upsert({
          user_id: userId,
          product_id: productId
        }, {
          onConflict: 'user_id,product_id',
          ignoreDuplicates: true
        })
        .select(`
          *,
          products (*)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Удалить товар из избранного
  removeFromWishlist: async (wishlistItemId) => {
    try {
      const { error } = await supabase
        .from('user_wishlist')
        .delete()
        .eq('id', wishlistItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Удалить товар из избранного по product_id
  removeFromWishlistByProduct: async (userId, productId) => {
    try {
      const { error } = await supabase
        .from('user_wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },

  // Проверить, есть ли товар в избранном
  isInWishlist: async (userId, productId) => {
    try {
      const { data, error } = await supabase
        .from('user_wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      return !error && data !== null;
    } catch (error) {
      return false;
    }
  },

  // Получить количество избранных товаров
  getWishlistCount: async (userId) => {
    try {
      const { count, error } = await supabase
        .from('user_wishlist')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (error) throw error;
      return count;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return 0;
    }
  }
};