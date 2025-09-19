// services/userService.js
import { supabase } from './supabaseClient';

export const userService = {
  // Получение данных пользователя
  getUserProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Обновление профиля пользователя
  updateUserProfile: async (userId, userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          address: userData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Смена пароля
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      // Здесь должна быть логика смены пароля
      // Для Supabase это делается через auth.updateUser()
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};