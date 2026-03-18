import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { useReviews } from '../../context/ReviewContext';
import { useAuth } from '../../context/AuthContext';

const UserReviewsPage = () => {
  const { userReviews, loading, loadUserReviews, deleteOwnReview } = useReviews();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadUserReviews();
    }
  }, [currentUser, loadUserReviews]);

  const handleDelete = async (reviewId) => {
    if (window.confirm('Вы уверены, что хотите удалить отзыв?')) {
      try {
        await deleteOwnReview(reviewId);
        loadUserReviews(); // обновляем список
      } catch (error) {
        console.error('Ошибка удаления отзыва:', error);
      }
    }
  };

  const getStatusChip = (status) => {
    const config = {
      approved: { color: 'success', label: 'Одобрен' },
      pending: { color: 'warning', label: 'На модерации' },
      rejected: { color: 'error', label: 'Отклонён' }
    };
    const { color, label } = config[status] || { color: 'default', label: status };
    return <Chip size="small" color={color} label={label} />;
  };

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          <Typography variant="h6">Для просмотра отзывов необходимо войти в систему</Typography>
          <Button component={Link} to="/login" variant="contained" sx={{ mt: 2 }}>
            Войти
          </Button>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Загрузка отзывов...</Typography>
      </Container>
    );
  }

  // Проверка, что userReviews — массив
  if (!Array.isArray(userReviews)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Ошибка загрузки данных. Пожалуйста, обновите страницу.</Alert>
      </Container>
    );
  }

  if (userReviews.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>У вас пока нет отзывов</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Вы можете оставить отзыв на любой товар из каталога
          </Typography>
          <Button component={Link} to="/catalog" variant="contained">
            Перейти в каталог
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Мои отзывы
      </Typography>

      <Grid container spacing={3}>
        {userReviews.map((review) => {
          // Определяем имя и изображение товара (поддержка разных форматов данных)
          const productName = review.product?.name || review.product_name || 'Товар';
          const productImage = review.product?.image_url || review.product_image || '';

          return (
            <Grid item xs={12} key={review.id}>
              <Card variant="outlined" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                {productImage && (
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', sm: 150 }, height: { xs: 150, sm: 'auto' }, objectFit: 'cover' }}
                    image={productImage || '/images/placeholder.jpg'}
                    alt={productName}
                    onError={(e) => {
                      console.warn('Ошибка загрузки изображения:', productImage);
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                )}
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography
                      variant="h6"
                      component={Link}
                      to={`/product/${review.product_id}`}
                      sx={{ textDecoration: 'none', color: 'primary.main' }}
                    >
                      {productName}
                    </Typography>
                    {getStatusChip(review.status)}
                  </Box>

                  <Rating value={review.rating} readOnly precision={0.5} sx={{ mb: 1 }} />

                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {review.comment}
                  </Typography>

                  {review.rejection_reason && review.status === 'rejected' && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Причина отклонения:</Typography>
                      {review.rejection_reason}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(review.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </Typography>

                    {review.status === 'pending' && (
                      <Button size="small" color="error" onClick={() => handleDelete(review.id)}>
                        Удалить
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default UserReviewsPage;