// components/Reviews/ReviewForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Rating,
  Typography,
  Alert,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { Send, Star, RateReview } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const ReviewForm = ({ product, productName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем наличие product_id
    if (!product?.id) {
      setError('Ошибка: товар не найден');
      return;
    }

    if (rating === 0) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Отзыв должен содержать минимум 10 символов');
      return;
    }

    setError('');
    setIsSubmitting(true);
    
    try {
      console.log('🔄 Отправка отзыва для товара:', product.id);
      
      // Убедимся, что rating - целое число
      const integerRating = Math.round(rating);
      console.log('🔢 Рейтинг (исходный/целый):', rating, integerRating);
      
      await onSubmit({
        product_id: product.id,
        rating: integerRating,
        comment: comment.trim()
      });
      
      setRating(0);
      setComment('');
      if (onClose) onClose();
    } catch (error) {
      console.error('❌ Ошибка в форме отзыва:', error);
      setError('Ошибка при отправке отзыва: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RateReview /> Оставить отзыв
        </Typography>
        <Typography color="text.secondary">
          Войдите в систему, чтобы оставить отзыв о товаре
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <RateReview /> Оставить отзыв о товаре
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Расскажите о вашем опыте использования товара "{productName}"
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography component="legend" gutterBottom>
            Ваша оценка *
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              name="rating"
              value={rating}
              onChange={(event, newValue) => {
                setRating(newValue);
              }}
              size="large"
              precision={0.5}
              icon={<Star sx={{ fontSize: 32 }} />}
              emptyIcon={<Star sx={{ fontSize: 32, opacity: 0.3 }} />}
            />
            <Typography variant="body2" color="text.secondary">
              {rating > 0 ? `${rating} из 5` : 'Поставьте оценку'}
            </Typography>
          </Box>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Ваш отзыв *"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Расскажите о вашем опыте использования товара..."
          sx={{ mb: 2 }}
          helperText={`Минимум 10 символов (${comment.length}/10)`}
          error={comment.length > 0 && comment.length < 10}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            * Все отзывы проходят проверку модерацией
          </Typography>
          
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <Send />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 2,
              px: 3,
              '&:hover': {
                transform: 'translateY(-1px)'
              }
            }}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить на модерацию'}
          </Button>
        </Box>
      </form>

      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
          <Star sx={{ fontSize: 14, mr: 0.5 }} />
          После проверки модератором отзыв будет опубликован
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReviewForm;