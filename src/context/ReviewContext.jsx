import React, { createContext, useContext, useState, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import { adminService } from '../services/adminService';
import { fetchWithAuth } from '../services/adminService';
import { useAuth } from './AuthContext';

const ReviewContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

// Добавьте этот экспорт
export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [moderationReviews, setModerationReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  // Загрузить отзывы для товара
  const loadProductReviews = useCallback(async (productId) => {
    try {
      setLoading(true);
      const reviewsData = await reviewService.getProductReviews(productId);
      setReviews(reviewsData);
      return reviewsData;
    } catch (error) {
      console.error('Error loading product reviews:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить отзывы пользователя
  const loadUserReviews = useCallback(async () => {
    if (!currentUser) return [];
    try {
      setLoading(true);
      const reviewsData = await reviewService.getUserReviews(currentUser.id);
      setUserReviews(Array.isArray(reviewsData) ? reviewsData : []);
      return reviewsData;
    } catch (error) {
      console.error('Error loading user reviews:', error);
      setUserReviews([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Загрузить отзывы для модерации
  const loadModerationReviews = useCallback(async () => {
    try {
      console.log('🔄 Загрузка отзывов для модерации...');
      setLoading(true);
      const data = await fetchWithAuth('/admin/reviews?action=pending');
      console.log('✅ Отзывы для модерации получены:', data);
      setModerationReviews(data || []);
      return data || [];
    } catch (error) {
      console.error('❌ Ошибка загрузки отзывов для модерации:', error);
      setModerationReviews([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить все отзывы (для админки)
  const loadAllReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/admin/reviews'); // без action
      setReviews(data || []);
      return data || [];
    } catch (error) {
      console.error('Ошибка загрузки всех отзывов:', error);
      setReviews([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Создать отзыв
  const createReview = useCallback(async (reviewData) => {
    if (!currentUser) {
      throw new Error('User must be logged in to create a review');
    }

    const reviewDataWithUser = {
      ...reviewData,
      user_id: currentUser.id
    };

    console.log('📝 Создание отзыва с данными:', reviewDataWithUser);

    try {
      setLoading(true);
      const newReview = await reviewService.createReview(reviewDataWithUser);
      
      // Обновляем списки
      await loadUserReviews();
      
      return newReview;
    } catch (error) {
      console.error('❌ Ошибка создания отзыва в контексте:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser, loadUserReviews]);

  // Одобрить отзыв (админ)
  const approveReview = useCallback(async (reviewId) => {
    try {
      const approvedReview = await fetchWithAuth(`/admin/reviews/${reviewId}?action=approve`, {
        method: 'PUT'
      });
      setModerationReviews(prev => prev.filter(review => review.id !== reviewId));
      await loadModerationReviews();
      return approvedReview;
    } catch (error) {
      console.error('Error approving review:', error);
      throw error;
    }
  }, [loadModerationReviews]);

  // Отклонить отзыв (админ)
  const rejectReview = useCallback(async (reviewId, reason) => {
    try {
      const rejectedReview = await fetchWithAuth(`/admin/reviews/${reviewId}?action=reject`, {
        method: 'PUT',
        body: JSON.stringify({ rejection_reason: reason })
      });
      setModerationReviews(prev => prev.filter(review => review.id !== reviewId));
      await loadModerationReviews();
      return rejectedReview;
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw error;
    }
  }, [loadModerationReviews]);

  const deleteOwnReview = useCallback(async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId); // предполагается, что такой метод есть
      setUserReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error('❌ Ошибка удаления своего отзыва:', error);
      throw error;
    }
  }, []);

  // Удалить отзыв (админ)
  const deleteReview = useCallback(async (reviewId, reason) => {
    try {
      const deleted = await fetchWithAuth(`/admin/reviews/${reviewId}?reason=${encodeURIComponent(reason)}`, {
        method: 'DELETE'
      });
      setModerationReviews(prev => prev.filter(review => review.id !== reviewId));
      await loadModerationReviews();
      return deleted;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }, [loadModerationReviews]);

  // Получить статистику отзывов
  const getReviewStats = useCallback(async () => {
    try {
      return await fetchWithAuth('/admin/reviews?action=stats');
    } catch (error) {
      console.error('Error getting review stats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }, []);

  const value = {
    reviews,
    userReviews,
    moderationReviews,
    loading,
    loadProductReviews,
    loadUserReviews,
    loadModerationReviews,
    loadAllReviews,
    createReview,
    approveReview,
    rejectReview,
    deleteOwnReview,
    deleteReview,
    getReviewStats
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

// Убедитесь что этот экспорт есть
export default ReviewProvider;