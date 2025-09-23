// pages/Admin/ReviewModerationPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  RateReview,
  CheckCircle,
  Cancel,
  Warning,
  BarChart,
  Person
} from '@mui/icons-material';
import { useReviews } from '../../../context/ReviewContext';
import { useAuth } from '../../../context/AuthContext';

const ReviewModerationPage = () => {
  const { moderationReviews, loading, loadModerationReviews, approveReview, rejectReview, getReviewStats } = useReviews();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadModerationReviews();
      loadStats();
    }
  }, [currentUser]);

  const loadStats = async () => {
    const statsData = await getReviewStats();
    setStats(statsData);
  };

  const handleApprove = async (reviewId) => {
    try {
      await approveReview(reviewId);
      setMessage('✅ Отзыв одобрен и опубликован');
      await loadStats();
    } catch (error) {
      setMessage('❌ Ошибка при одобрении отзыва: ' + error.message);
    }
  };

  const handleReject = async () => {
    if (!selectedReview || !rejectReason.trim()) return;

    try {
      await rejectReview(selectedReview.id, rejectReason.trim());
      setMessage('❌ Отзыв отклонен');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedReview(null);
      await loadStats();
    } catch (error) {
      setMessage('❌ Ошибка при отклонении отзыва: ' + error.message);
    }
  };

  const openRejectDialog = (review) => {
    setSelectedReview(review);
    setRejectDialogOpen(true);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Alert severity="error">
          У вас нет доступа к этой странице
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          textFillColor: 'transparent'
        }}>
          🛡️ Модерация отзывов
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Управление отзывами пользователей
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.includes('✅') ? 'success' : 'error'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <BarChart sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
            <Typography color="text.secondary">Всего отзывов</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light' }}>
            <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.pending}</Typography>
            <Typography color="text.secondary">На модерации</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.approved}</Typography>
            <Typography color="text.secondary">Одобрено</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2, bgcolor: 'error.light' }}>
            <Cancel sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">{stats.rejected}</Typography>
            <Typography color="text.secondary">Отклонено</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Список отзывов для модерации */}
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RateReview /> Отзывы на модерации ({moderationReviews.length})
        </Typography>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : moderationReviews.length === 0 ? (
          <Alert severity="success">
            Все отзывы проверены! Новых отзывов на модерации нет.
          </Alert>
        ) : (
          <Box sx={{ spaceY: 2 }}>
            {moderationReviews.map((review) => (
              <Card key={review.id} sx={{ mb: 2, border: '2px solid', borderColor: 'warning.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {review.products?.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Person />
                        <Typography>{review.users?.name}</Typography>
                        <Chip label={`Оценка: ${review.rating}/5`} color="primary" size="small" />
                      </Box>
                    </Box>
                    <Chip icon={<Warning />} label="На модерации" color="warning" />
                  </Box>

                  <Typography paragraph sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                    {review.comment}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleApprove(review.id)}
                    >
                      Одобрить
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => openRejectDialog(review)}
                    >
                      Отклонить
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>

      {/* Диалог отклонения отзыва */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Отклонить отзыв</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Укажите причину отклонения отзыва:
          </Typography>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Например: нарушение правил сообщества, нецензурная лексика..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleReject} 
            color="error"
            disabled={!rejectReason.trim()}
          >
            Отклонить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReviewModerationPage;