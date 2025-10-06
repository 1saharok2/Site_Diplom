// context/ReviewContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { reviewService } from '../services/reviewService';
import { useAuth } from './AuthContext';

const ReviewContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

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
      setUserReviews(reviewsData);
      return reviewsData;
    } catch (error) {
      console.error('Error loading user reviews:', error);
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
      const reviewsData = await reviewService.getReviewsForModeration();
      console.log('✅ Отзывы для модерации получены:', reviewsData);
      setModerationReviews(reviewsData || []);
      return reviewsData || [];
    } catch (error) {
      console.error('❌ Ошибка загрузки отзывов для модерации:', error);
      setModerationReviews([]);
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
      const approvedReview = await reviewService.approveReview(reviewId);
      
      // Обновляем списки
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
      const rejectedReview = await reviewService.rejectReview(reviewId, reason);
      
      // Обновляем списки
      setModerationReviews(prev => prev.filter(review => review.id !== reviewId));
      await loadModerationReviews();
      
      return rejectedReview;
    } catch (error) {
      console.error('Error rejecting review:', error);
      throw error;
    }
  }, [loadModerationReviews]);

  // Получить статистику отзывов
  const getReviewStats = useCallback(async () => {
    try {
      return await reviewService.getReviewStats();
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
    createReview,
    approveReview,
    rejectReview,
    getReviewStats
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

export default ReviewProvider;