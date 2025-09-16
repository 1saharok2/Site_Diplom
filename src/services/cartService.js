// services/cartService.js
import { supabase } from "./supabaseClient"

export const cartService = {
  // Получить корзину пользователя
  getCart: async (userId) => {
    const { data, error } = await supabase
      .from('user_cart')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Добавить товар в корзину
   addToCart: async (userId, productId, quantity = 1) => {
     try {
       // Простой INSERT с обработкой конфликта
       const { data, error } = await supabase
         .from('user_cart')
         .upsert({
           user_id: userId,
           product_id: productId,
           quantity: quantity
         }, {
           onConflict: 'user_id,product_id',
           ignoreDuplicates: false
         })
         .select(`
           *,
           products (*)
         `)
         .single();
       
       if (error) throw error;
       return data;
       
     } catch (error) {
       console.error('Error in cartService.addToCart:', error);
       throw error;
     }
   },

  // Обновить количество товара
  updateCartItem: async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return await cartService.removeFromCart(cartItemId);
    }

    const { data, error } = await supabase
      .from('user_cart')
      .update({ 
        quantity: quantity
      })
      .eq('id', cartItemId)
      .select(`
        *,
        products (*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Удалить товар из корзины
  removeFromCart: async (cartItemId) => {
    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    return true;
  },

  // Очистить корзину
  clearCart: async (userId) => {
    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  // Получить общую стоимость корзины
  getCartTotal: (cartItems) => {
    return cartItems.reduce((total, item) => {
      return total + (item.products?.price || 0) * item.quantity;
    }, 0);
  },

  // Получить общее количество товаров
  getCartItemsCount: (cartItems) => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }
};