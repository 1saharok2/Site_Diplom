import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Rating,
  Button,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Grid,
  Divider,
  Avatar
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  Warning,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { useReviews } from '../../context/ReviewContext';

const AdminReviewsPage = () => {
  // Правильное использование хука useReviews
  const {
    moderationReviews = [],
    loading = false,
    loadModerationReviews,
    approveReview,
    rejectReview,
    getReviewStats
  } = useReviews();

    console.log('🔴 AdminReviewsPage запущен');
  console.log('📊 moderationReviews:', moderationReviews);
  console.log('⏳ loading:', loading);
  console.log('🔄 loadModerationReviews:', typeof loadModerationReviews);

  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('🔄 useEffect запущен');
    loadData();
  }, []);

  const loadData = async () => {
    console.log('📥 loadData начал работу');
    try {
      if (loadModerationReviews && typeof loadModerationReviews === 'function') {
        console.log('🔄 Загружаем отзывы для модерации...');
        const reviews = await loadModerationReviews();
        console.log('✅ Отзывы загружены:', reviews);
      } else {
        console.error('❌ loadModerationReviews не является функцией');
      }

      if (getReviewStats && typeof getReviewStats === 'function') {
        console.log('📊 Загружаем статистику...');
        const statsData = await getReviewStats();
        console.log('✅ Статистика загружена:', statsData);
        setStats(statsData || { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      setMessage('Ошибка загрузки данных: ' + error.message);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      if (approveReview) {
        await approveReview(reviewId);
        setMessage('Отзыв одобрен');
        await loadData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Ошибка одобрения отзыва:', error);
      setMessage('Ошибка при одобрении отзыва');
    }
  };

  const handleRejectClick = (review) => {
    setSelectedReview(review);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedReview || !rejectReview) return;

    try {
      await rejectReview(selectedReview.id, rejectReason || 'Отклонено модератором');
      setMessage('Отзыв отклонен');
      setRejectDialogOpen(false);
      setSelectedReview(null);
      await loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Ошибка отклонения отзыва:', error);
      setMessage('Ошибка при отклонении отзыва');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <Warning />, label: 'На модерации' },
      approved: { color: 'success', icon: <CheckCircle />, label: 'Одобрено' },
      rejected: { color: 'error', icon: <Cancel />, label: 'Отклонено' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Загрузка отзывов...
        </Typography>
      </Container>
    );
  }

  const pendingReviews = moderationReviews.filter(r => r.status === 'pending');

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок и статистика */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Модерация отзывов
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Управление отзывами пользователей
        </Typography>

        {/* Статистика */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">{stats.total}</Typography>
              <Typography variant="body2">Всего отзывов</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light' }}>
              <Typography variant="h4" color="warning.dark">{stats.pending}</Typography>
              <Typography variant="body2">На модерации</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light' }}>
              <Typography variant="h4" color="success.dark">{stats.approved}</Typography>
              <Typography variant="body2">Одобрено</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light' }}>
              <Typography variant="h4" color="error.dark">{stats.rejected}</Typography>
              <Typography variant="body2">Отклонено</Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Сообщения */}
      {message && (
        <Alert severity={message.includes('Ошибка') ? 'error' : 'success'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Список отзывов */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Отзывы на модерации ({pendingReviews.length})
        </Typography>

        {moderationReviews.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Нет отзывов для модерации
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Все отзывы обработаны
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
            {moderationReviews.map((review, index) => (
              <Card key={review.id} sx={{ mb: 2, border: review.status === 'pending' ? '2px solid #ff9800' : '1px solid #e0e0e0' }}>
                <CardContent>
                  {/* Заголовок отзыва */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.user?.name || 'Анонимный пользователь'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {review.user?.email}
                        </Typography>
                      </Box>
                    </Box>
                    {getStatusChip(review.status)}
                  </Box>

                  {/* Информация о товаре */}
                  <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Товар: <strong>{review.product?.name}</strong>
                    </Typography>
                  </Box>

                  {/* Рейтинг и комментарий */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>
                        {review.rating}.0
                      </Typography>
                    </Box>
                    <Typography variant="body1" paragraph>
                      {review.comment}
                    </Typography>
                  </Box>

                  {/* Даты и действия */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(review.created_at)}
                    </Typography>

                    {review.status === 'pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<ThumbUp />}
                          onClick={() => handleApprove(review.id)}
                        >
                          Одобрить
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<ThumbDown />}
                          onClick={() => handleRejectClick(review)}
                        >
                          Отклонить
                        </Button>
                      </Box>
                    )}
                  </Box>

                  {review.rejection_reason && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <strong>Причина отклонения:</strong> {review.rejection_reason}
                    </Alert>
                  )}

                  {index < moderationReviews.length - 1 && <Divider sx={{ mt: 2 }} />}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Диалог отклонения отзыва */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Отклонить отзыв</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Укажите причину отклонения отзыва от пользователя <strong>{selectedReview?.user?.name}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Причина отклонения отзыва..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleRejectConfirm} 
            variant="contained" 
            color="error"
            disabled={!rejectReason.trim()}
          >
            Отклонить отзыв
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminReviewsPage;