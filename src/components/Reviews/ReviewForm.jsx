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

const ReviewForm = ({ open = true, product, productName, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const minLen = 10;
  const maxLen = 1000;
  const trimmedLen = comment.trim().length;

  if (!open) {
    return null;
  }

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

    if (trimmedLen < minLen) {
      setError(`Отзыв должен содержать минимум ${minLen} символов`);
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
        background: 'linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 100%)',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        overflow: 'hidden',
        position: 'relative'
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
        <Box sx={{ mb: 2.25 }}>
          <Typography component="legend" gutterBottom>
            Ваша оценка *
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
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
          rows={5}
          label="Ваш отзыв *"
          value={comment}
          onChange={(e) => {
            const next = e.target.value;
            setComment(next.length > maxLen ? next.slice(0, maxLen) : next);
          }}
          placeholder="Расскажите о вашем опыте использования товара..."
          sx={{
            mb: 1.25,
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
          inputProps={{ maxLength: maxLen }}
          helperText={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color={trimmedLen > 0 && trimmedLen < minLen ? 'error.main' : 'text.secondary'}>
                Минимум {minLen} символов
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {trimmedLen}/{maxLen}
              </Typography>
            </Box>
          }
          error={trimmedLen > 0 && trimmedLen < minLen}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            * Все отзывы проходят проверку модерацией
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {onClose && (
              <Button
                type="button"
                variant="outlined"
                onClick={onClose}
                disabled={isSubmitting}
                sx={{ borderRadius: 2, px: 2.5 }}
              >
                Отмена
              </Button>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || rating === 0 || trimmedLen < minLen}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : <Send />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                px: 3,
                boxShadow: '0 10px 18px rgba(102,126,234,0.18)',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 14px 24px rgba(102,126,234,0.24)'
                }
              }}
            >
              {isSubmitting ? 'Отправка...' : 'Отправить на модерацию'}
            </Button>
          </Box>
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