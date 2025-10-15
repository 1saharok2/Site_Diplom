import { apiService } from './api';

export const userService = {
  // Получение данных пользователя
  getUserProfile: async (userId) => {
    try {
      const user = await apiService.get(`/users/${userId}`);
      return user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Обновление профиля пользователя
  updateUserProfile: async (userId, userData) => {
    try {
      const user = await apiService.put(`/users/${userId}`, {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        address: userData.address
      });
      return user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Смена пароля
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const result = await apiService.put(`/users/${userId}/password`, {
        current_password: currentPassword,
        new_password: newPassword
      });
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};