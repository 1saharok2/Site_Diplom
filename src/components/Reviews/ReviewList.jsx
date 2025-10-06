import React from 'react';
import { Spinner } from 'react-bootstrap';
import { FaStar, FaCheckCircle, FaClock, FaQuoteLeft, FaHeart, FaRegStar } from 'react-icons/fa';

const ReviewList = ({ reviews, loading, currentUser }) => {
  console.log('🔴 ReviewList - получены отзывы:', reviews);
  console.log('🔴 ReviewList - количество отзывов:', reviews?.length);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="position-relative">
          <Spinner 
            animation="border" 
            variant="primary" 
            style={{ 
              width: '4rem', 
              height: '4rem',
              borderWidth: '3px'
            }} 
          />
          <FaHeart 
            className="position-absolute top-50 start-50 translate-middle text-primary"
            style={{ fontSize: '1.5rem' }}
          />
        </div>
        <p className="mt-4 fs-5 text-muted fw-light">Загружаем мнения покупателей...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="modern-empty-state">
          <div className="gradient-icon mb-4">
            <FaStar className="text-white" size={48} />
          </div>
          <h4 className="fw-semibold text-dark mb-3">Станьте первым!</h4>
          <p className="text-muted mb-4 opacity-75">
            Поделитесь своим опытом и помогите другим покупателям
          </p>
          <div className="modern-chip">
            💡 Ваш отзыв будет очень полезен
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Вчера';
    if (diffDays <= 7) return `${diffDays} дней назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // ПРАВИЛЬНОЕ отображение звезд в соответствии с оценкой
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1;
      const isFilled = starNumber <= rating;
      
      return (
        <span key={i} className="star-container" title={`${rating}/5`}>
          {isFilled ? (
            <FaStar className="text-warning filled-star" />
          ) : (
            <FaRegStar className="text-light empty-star" />
          )}
        </span>
      );
    });
  };

  // Для распределения оценок - правильное отображение
  const renderDistributionStars = (count) => {
    return Array.from({ length: count }, (_, i) => (
      <FaStar key={i} className="text-warning" size={12} />
    ));
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: { 
        bg: 'success', 
        icon: FaCheckCircle, 
        text: 'Одобрено',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      },
      pending: { 
        bg: 'warning', 
        icon: FaClock, 
        text: 'На модерации',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      },
      rejected: { 
        bg: 'danger', 
        icon: FaClock, 
        text: 'Отклонено',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      }
    };
    return configs[status] || configs.pending;
  };

  // Расчет распределения оценок
  const ratingDistribution = [0, 0, 0, 0, 0];
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingDistribution[5 - review.rating]++;
    }
  });

  return (
    <div className="modern-reviews-container">
      {/* Статистика в стиле карточек */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="modern-stat-card gradient-primary">
            <div className="stat-content">
              <div className="stat-number">{reviews.length}</div>
              <div className="stat-label">Всего отзывов</div>
            </div>
            <div className="stat-icon">💬</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="modern-stat-card gradient-success">
            <div className="stat-content">
              <div className="stat-number">
                {(
                  reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
                ).toFixed(1)}
              </div>
              <div className="stat-label">Средняя оценка</div>
            </div>
            <div className="stat-icon">⭐</div>
          </div>
        </div>
      </div>

      {/* Распределение оценок */}
      <div className="rating-distribution mb-4">
        <h6 className="fw-semibold mb-3 text-dark">Распределение оценок</h6>
        {[5, 4, 3, 2, 1].map((stars, index) => (
          <div key={stars} className="distribution-item">
            <div className="stars">
              {renderDistributionStars(stars)}
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{
                  width: `${(ratingDistribution[index] / reviews.length) * 100}%`
                }}
              ></div>
            </div>
            <div className="count">{ratingDistribution[index]}</div>
          </div>
        ))}
      </div>

      {/* Список отзывов */}
      <div className="reviews-grid">
        {reviews.map((review, index) => {
          const statusConfig = getStatusConfig(review.status);
          const StatusIcon = statusConfig.icon;
          const isUserReview = currentUser && review.user_id === currentUser.id;

          return (
            <article 
              key={review.id}
              className={`modern-review-card ${isUserReview ? 'user-review' : ''}`}
              style={{
                '--delay': `${index * 0.1}s`
              }}
            >
              {/* Аватар и заголовок */}
              <header className="review-header">
                <div className="user-avatar">
                  <div className="avatar-gradient">
                    {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="user-info">
                  <h6 className="username">
                    {review.user?.name || 'Анонимный покупатель'}
                    {isUserReview && (
                      <span className="user-badge">Вы</span>
                    )}
                  </h6>
                  <div className="review-meta">
                    <span className="date">{formatDate(review.created_at)}</span>
                    <span className="divider">•</span>
                    <span className="rating-display">
                      <span className="stars-small">
                        {renderStars(review.rating)}
                      </span>
                      <strong className="rating-value ms-1">{review.rating}.0</strong>
                    </span>
                  </div>
                </div>
                <div 
                  className="status-badge"
                  style={{ background: statusConfig.gradient }}
                >
                  <StatusIcon size={10} className="me-1" />
                  {statusConfig.text}
                </div>
              </header>

              {/* Текст отзыва */}
              <div className="review-content">
                <FaQuoteLeft className="quote-icon" />
                <p className="review-text">{review.comment}</p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Добавим CSS стили */}
      <style jsx>{`
        .modern-reviews-container {
          max-width: 100%;
        }

        .modern-empty-state {
          padding: 3rem 1rem;
        }

        .gradient-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .modern-chip {
          display: inline-block;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }

        .modern-stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          transition: transform 0.3s ease;
        }

        .modern-stat-card:hover {
          transform: translateY(-2px);
        }

        .gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .gradient-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .rating-distribution {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .distribution-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .stars {
          width: 60px;
          display: flex;
          gap: 2px;
        }

        .progress-bar-container {
          flex: 1;
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          margin: 0 1rem;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
          border-radius: 3px;
          transition: width 1s ease;
        }

        .count {
          width: 30px;
          text-align: right;
          font-weight: 600;
          color: #64748b;
        }

        .reviews-grid {
          display: grid;
          gap: 1.5rem;
        }

        .modern-review-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 25px rgba(0,0,0,0.06);
          border: 1px solid rgba(255,255,255,0.3);
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUp 0.6s ease var(--delay) both;
        }

        .modern-review-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
        }

        .user-review {
          border: 2px solid #667eea;
          background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
        }

        .review-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .user-avatar {
          margin-right: 1rem;
        }

        .avatar-gradient {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .user-info {
          flex: 1;
        }

        .username {
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: #1e293b;
        }

        .user-badge {
          background: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 0.7rem;
          margin-left: 0.5rem;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #64748b;
        }

        .divider {
          opacity: 0.5;
        }

        .rating-display {
          display: flex;
          align-items: center;
        }

        .stars-small {
          display: flex;
          gap: 1px;
        }

        .star-container {
          display: inline-flex;
          margin-right: 1px;
        }

        .filled-star {
          color: #fbbf24;
          filter: drop-shadow(0 1px 2px rgba(251, 191, 36, 0.3));
        }

        .empty-star {
          color: #e5e7eb;
        }

        .rating-value {
          color: #1f2937;
          font-size: 0.9rem;
        }

        .status-badge {
          color: white;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
        }

        .review-content {
          position: relative;
          margin-bottom: 1rem;
        }

        .quote-icon {
          position: absolute;
          top: -5px;
          left: -5px;
          color: #e2e8f0;
          font-size: 1.5rem;
        }

        .review-text {
          margin-left: 1.5rem;
          line-height: 1.6;
          color: #475569;
          font-style: italic;
        }

        .review-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 1rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          transition: color 0.3s ease;
        }

        .action-btn:hover {
          color: #667eea;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .modern-review-card {
            padding: 1rem;
          }
          
          .review-header {
            flex-wrap: wrap;
          }
          
          .status-badge {
            margin-top: 0.5rem;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ReviewList;