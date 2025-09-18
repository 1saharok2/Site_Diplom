// services/cartService.js
import { supabase } from "./supabaseClient"

export const cartService = {

  getCart: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_cart')
        .select(`
          id,
          user_id,
          product_id,
          quantity,
          added_at,
          products (*)
        `)
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getCart:', error);
      throw error;
    }
  },

   addToCart: async (userId, productId, quantity = 1) => {
     try {
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
       throw error;
     }
   },

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

  removeFromCart: async (cartItemId) => {
    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
    return true;
  },

  clearCart: async (userId) => {
    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return true;
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