import { supabase } from './supabaseClient';

export const reviewService = {
  // Получить отзывы для товара (только одобренные)
  getProductReviews: async (productId) => {
    try {
      const numericProductId = parseInt(productId, 10);
      console.log('🔄 Загрузка отзывов для товара ID:', numericProductId);
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users (
            first_name,
            last_name
          )
        `)
        .eq('product_id', numericProductId)
        .eq('status', 'approved') // ТОЛЬКО ОДОБРЕННЫЕ!
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📊 Сырые данные от Supabase:', data);

      // ПРАВИЛЬНОЕ преобразование
      const transformedData = data ? data.map(review => ({
        ...review,
        user: {
          name: `${review.users?.first_name || ''} ${review.users?.last_name || ''}`.trim() || 'Аноним'
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
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products (
            name,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Ошибка в getUserReviews:', error);
      return [];
    }
  },

  // Получить отзывы для модерации (только pending)
  getReviewsForModeration: async () => {
    try {
      console.log('🔄 Запрос отзывов для модерации к Supabase...');
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users (
            first_name,
            last_name,
            email
          ),
          products (
            name
          )
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Ошибка Supabase:', error);
        throw error;
      }

      // Преобразуем данные - объединяем first_name и last_name в name
      const transformedData = data ? data.map(review => ({
        ...review,
        user: review.users ? {
          name: `${review.users.first_name || ''} ${review.users.last_name || ''}`.trim(),
          email: review.users.email
        } : null,
        product: review.products ? {
          name: review.products.name
        } : null
      })) : [];

      console.log('✅ Данные от Supabase (преобразованные):', transformedData);
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
      
      // Проверяем существующий отзыв
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', reviewData.user_id)
        .eq('product_id', numericProductId)
        .maybeSingle();

      if (existingReview) {
        throw new Error('Вы уже оставляли отзыв на этот товар');
      }

      // Создаем отзыв со статусом 'pending'
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          user_id: reviewData.user_id,
          product_id: numericProductId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          status: 'pending' // ← НА МОДЕРАЦИИ!
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Отзыв создан (на модерации):', data);
      return data;
    } catch (error) {
      console.error('❌ Ошибка создания отзыва:', error);
      throw error;
    }
  },

  // Одобрить отзыв
  approveReview: async (reviewId) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Ошибка в approveReview:', error);
      throw error;
    }
  },

  // Отклонить отзыв
  rejectReview: async (reviewId, reason) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Ошибка в rejectReview:', error);
      throw error;
    }
  },

  // Получить статистику отзывов
  getReviewStats: async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('status');

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        approved: data?.filter(r => r.status === 'approved').length || 0,
        rejected: data?.filter(r => r.status === 'rejected').length || 0
      };

      return stats;
    } catch (error) {
      console.error('❌ Ошибка в getReviewStats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }
};