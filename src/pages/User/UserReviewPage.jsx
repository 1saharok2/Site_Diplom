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
    return (
      <Chip
        size="small"
        color={color}
        label={label}
        sx={{
          borderRadius: 999,
          fontWeight: 700
        }}
      />
    );
  };

  const reviewsSafe = Array.isArray(userReviews) ? userReviews : [];
  const totalCount = reviewsSafe.length;
  const approvedCount = reviewsSafe.filter(r => r.status === 'approved').length;
  const pendingCount = reviewsSafe.filter(r => r.status === 'pending').length;
  const rejectedCount = reviewsSafe.filter(r => r.status === 'rejected').length;
  const avgRating = totalCount
    ? reviewsSafe.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / totalCount
    : 0;

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
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.06) 100%)'
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 800 }}>
            У вас пока нет отзывов
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 520, mx: 'auto' }}>
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
      <Box
        sx={{
          mb: 3,
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
          background: 'linear-gradient(135deg, rgba(102,126,234,0.18) 0%, rgba(118,75,162,0.12) 45%, rgba(16,185,129,0.10) 100%)',
          border: '1px solid rgba(255,255,255,0.25)'
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Мои отзывы
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 760 }}>
          Здесь отображаются ваши отзывы и их статус. Пока отзыв на модерации — вы можете удалить его.
        </Typography>

        <Grid container spacing={2.5} sx={{ mt: 1.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.72)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {totalCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Всего отзывов
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.72)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {approvedCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Одобрены
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.72)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {pendingCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                На модерации
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.72)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {avgRating.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Средняя оценка
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {userReviews.map((review) => {
          // Определяем имя и изображение товара (поддержка разных форматов данных)
          const productName = review.product?.name || review.product_name || 'Товар';
          const productImage = review.product?.image_url || review.product_image || '';
          const productImageToUse = productImage || '/images/placeholder.jpg';

          return (
            <Grid size={{ xs: 12 }} key={review.id}>
              <Card
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  borderRadius: 4,
                  overflow: 'hidden',
                  borderColor: 'rgba(0,0,0,0.08)',
                  background: 'rgba(255,255,255,0.96)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 18px 45px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: '100%', sm: 180 },
                    height: { xs: 170, sm: 150 },
                    objectFit: 'cover'
                  }}
                  image={productImageToUse}
                  alt={productName}
                  onError={(e) => {
                    // На случай битого плейсхолдера
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />

                <CardContent
                  sx={{
                    flex: 1,
                    p: { xs: 2, md: 2.25 }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography
                      variant="h6"
                      component={Link}
                      to={`/product/${review.product_id}`}
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        fontWeight: 900,
                        lineHeight: 1.25
                      }}
                    >
                      {productName}
                    </Typography>
                    {getStatusChip(review.status)}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={review.rating} readOnly precision={0.5} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {Number(review.rating) || 0}/5
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mb: 2,
                      borderRadius: 3,
                      p: 1.5,
                      background:
                        review.status === 'rejected'
                          ? 'rgba(239, 68, 68, 0.08)'
                          : review.status === 'pending'
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {review.comment}
                    </Typography>
                  </Box>

                  {review.rejection_reason && review.status === 'rejected' && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                        Причина отклонения
                      </Typography>
                      {review.rejection_reason}
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(review.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </Typography>

                    {review.status === 'pending' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(review.id)}
                        sx={{ borderRadius: 999, fontWeight: 800 }}
                      >
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