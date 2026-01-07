// services/favoritesService.js
import { apiService } from './api';

export const favoritesService = {
  getUserFavorites: async (userId) => {
    try {
      console.log(`📥 Запрос избранного пользователя ${userId}`);
      
      const response = await apiService.get(`/wishlist.php?userId=${userId}`);
      console.log('✅ Wishlist ответ:', response);
      
      let favorites = [];
      let count = 0;
      
      // Проверяем структуру ответа
      if (response && response.success) {
        // Структура 1: { success: true, items: [...] }
        if (response.items && Array.isArray(response.items)) {
          favorites = response.items;
          count = response.items.length;
        }
        // Структура 2: { success: true, data: { items: [...] } }
        else if (response.data && response.data.items && Array.isArray(response.data.items)) {
          favorites = response.data.items;
          count = response.data.items.length;
        }
        // Структура 3: { success: true, data: [...] }
        else if (response.data && Array.isArray(response.data)) {
          favorites = response.data;
          count = response.data.length;
        }
        // Используем count из ответа если есть
        else if (response.count !== undefined) {
          count = response.count;
        }
      }
      
      console.log(`📊 Избранное после обработки: ${count} товаров (массив: ${favorites.length})`);
      
      return {
        success: true,
        items: favorites,
        data: favorites, // для обратной совместимости
        count: count
      };
      
    } catch (error) {
      console.error('❌ Ошибка загрузки избранного:', error);
      return { 
        success: false, 
        items: [], 
        data: [],
        count: 0 
      };
    }
  }
};