import React from 'react';
import { Card, Spinner, Badge } from 'react-bootstrap';
import { FaUser, FaStar, FaCheckCircle, FaClock } from 'react-icons/fa';

const ReviewList = ({ reviews, loading, currentUser }) => {
  console.log('🔴 ReviewList - получены отзывы:', reviews);
  console.log('🔴 ReviewList - количество отзывов:', reviews?.length);
  console.log('🔴 ReviewList - текущий пользователь:', currentUser);

  // Проверяем структуру первого отзыва
  if (reviews && reviews.length > 0) {
    console.log('🔴 ReviewList - структура отзыва:', {
      id: reviews[0].id,
      rating: reviews[0].rating,
      comment: reviews[0].comment,
      user: reviews[0].user,
      status: reviews[0].status
    });
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Загружаем отзывы...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    console.log('🔴 ReviewList - нет отзывов для отображения');
    return (
      <Card className="text-center py-4">
        <Card.Body>
          <FaStar size={48} className="text-muted mb-3" />
          <h5>Пока нет отзывов</h5>
          <p className="text-muted">Будьте первым, кто оставит отзыв об этом товаре!</p>
        </Card.Body>
      </Card>
    );
  }

  console.log('🔴 ReviewList - отображаем', reviews.length, 'отзывов');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} className={i < rating ? 'text-warning' : 'text-muted'} />
    ));
  };

  return (
    <div className="reviews-list">
      {reviews.map((review, index) => (
        <Card key={review.id} className={`mb-3 ${index === 0 ? 'border-primary' : ''}`}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="d-flex align-items-center">
                <FaUser className="text-muted me-2" />
                <strong>{review.user?.name || 'Анонимный пользователь'}</strong>
                {currentUser && review.user_id === currentUser.id && (
                  <Badge bg="primary" className="ms-2">Ваш отзыв</Badge>
                )}
              </div>
              
              <div className="d-flex align-items-center">
                <div className="me-2">
                  {renderStars(review.rating)}
                </div>
                <small className="text-muted">{formatDate(review.created_at)}</small>
              </div>
            </div>
            
            <p className="mb-2">{review.comment}</p>
            
            <div className="d-flex justify-content-between align-items-center">
              <Badge 
                bg={review.status === 'approved' ? 'success' : 'warning'} 
                className="d-flex align-items-center"
              >
                {review.status === 'approved' ? (
                  <FaCheckCircle className="me-1" size={12} />
                ) : (
                  <FaClock className="me-1" size={12} />
                )}
                {review.status === 'approved' ? 'Одобрено' : 'На модерации'}
              </Badge>
              
              <span className="text-muted small">Оценка: {review.rating}.0</span>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default ReviewList;