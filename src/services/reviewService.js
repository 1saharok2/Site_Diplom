import { apiService } from './api';

export const reviewService = {
  // Получить отзывы для товара (только одобренные)
  getProductReviews: async (productId) => {
    try {
      const numericProductId = parseInt(productId, 10);
      console.log('🔄 Загрузка отзывов для товара ID:', numericProductId);
      
      const reviews = await apiService.get(`/reviews/product/${numericProductId}`);
      
      console.log('📊 Данные от API:', reviews);

      // Преобразование данных
      const transformedData = reviews ? reviews.map(review => ({
        ...review,
        user: {
          name: review.user_name || `${review.first_name || ''} ${review.last_name || ''}`.trim() || 'Аноним'
        }
      })) : [];

      console.log('✅ Преобразованные данные:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('❌ Ошибка в getProductReviews:', error);
      return [];
    }
  },

  // Получить отзывы пользователя
  getUserReviews: async (userId) => {
    try {
      const reviews = await apiService.get(`/reviews/user/${userId}`);
      return reviews || [];
    } catch (error) {
      console.error('❌ Ошибка в getUserReviews:', error);
      return [];
    }
  },

  // Получить отзывы для модерации (только pending)
  getReviewsForModeration: async () => {
    try {
      console.log('🔄 Запрос отзывов для модерации к API...');
      
      const reviews = await apiService.get('/admin/reviews/pending');

      // Преобразуем данные
      const transformedData = reviews ? reviews.map(review => ({
        ...review,
        user: {
          name: review.user_name || `${review.first_name || ''} ${review.last_name || ''}`.trim(),
          email: review.user_email
        },
        product: {
          name: review.product_name
        }
      })) : [];

      console.log('✅ Данные от API (преобразованные):', transformedData);
      return transformedData;
    } catch (error) {
      console.error('❌ Ошибка в getReviewsForModeration:', error);
      return [];
    }
  },

  // Создать отзыв
  createReview: async (reviewData) => {
    try {
      console.log('🔄 Создание отзыва:', reviewData);

      // Проверяем обязательные поля
      if (!reviewData.product_id) throw new Error('ID товара обязательно');
      if (!reviewData.user_id) throw new Error('ID пользователя обязательно');

      const numericProductId = parseInt(reviewData.product_id, 10);
      
      // Создаем отзыв со статусом 'pending'
      const review = await apiService.post('/reviews', {
        user_id: reviewData.user_id,
        product_id: numericProductId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        status: 'pending' // ← НА МОДЕРАЦИИ!
      });

      console.log('✅ Отзыв создан (на модерации):', review);
      return review;
    } catch (error) {
      console.error('❌ Ошибка создания отзыва:', error);
      throw error;
    }
  },

  // Одобрить отзыв
  approveReview: async (reviewId) => {
    try {
      const review = await apiService.put(`/admin/reviews/${reviewId}/approve`);
      return review;
    } catch (error) {
      console.error('❌ Ошибка в approveReview:', error);
      throw error;
    }
  },

  // Отклонить отзыв
  rejectReview: async (reviewId, reason) => {
    try {
      const review = await apiService.put(`/admin/reviews/${reviewId}/reject`, {
        rejection_reason: reason
      });
      return review;
    } catch (error) {
      console.error('❌ Ошибка в rejectReview:', error);
      throw error;
    }
  },

  // Получить статистику отзывов
  getReviewStats: async () => {
    try {
      const stats = await apiService.get('/admin/reviews/stats');
      return stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
    } catch (error) {
      console.error('❌ Ошибка в getReviewStats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }
};