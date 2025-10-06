import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme,
  Snackbar,
  Avatar,
  Rating,
  MenuItem
} from '@mui/material';
import {
  Search,
  FilterList,
  CheckCircle,
  Cancel,
  ThumbUp,
  ThumbDown,
  Person,
  Comment,
  Refresh,
  Delete,
  Warning
} from '@mui/icons-material';
import { useReviews } from '../../context/ReviewContext';

const AdminReviewsPage = () => {
  const {
    moderationReviews = [],
    loading = false,
    loadModerationReviews,
    approveReview,
    rejectReview,
    deleteReview,
    getReviewStats
  } = useReviews();

  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();

  const loadData = useCallback(async () => {
    try {
      if (loadModerationReviews) {
        await loadModerationReviews();
      }
      if (getReviewStats) {
        const statsData = await getReviewStats();
        setStats(statsData || { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      showSnackbar('Ошибка загрузки данных', 'error');
    }
  }, [loadModerationReviews, getReviewStats]);

  const filterReviews = useCallback(() => {
    let filtered = moderationReviews.filter(review =>
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(review => review.status === statusFilter);
    }

    setFilteredReviews(filtered);
  }, [moderationReviews, searchTerm, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterReviews();
  }, [filterReviews]);

  const handleApprove = async (reviewId) => {
    try {
      await approveReview(reviewId);
      showSnackbar('Отзыв успешно одобрен', 'success');
      await loadData();
    } catch (error) {
      console.error('Ошибка одобрения отзыва:', error);
      showSnackbar('Ошибка при одобрении отзыва', 'error');
    }
  };

  const handleRejectClick = (review) => {
    setSelectedReview(review);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedReview) return;

    try {
      await rejectReview(selectedReview.id, rejectReason || 'Отклонено модератором');
      showSnackbar('Отзыв отклонен', 'success');
      setRejectDialogOpen(false);
      setSelectedReview(null);
      await loadData();
    } catch (error) {
      console.error('Ошибка отклонения отзыва:', error);
      showSnackbar('Ошибка при отклонении отзыва', 'error');
    }
  };

  const handleDeleteClick = (review) => {
    setSelectedReview(review);
    setDeleteReason('');
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;

    try {
      await deleteReview(selectedReview.id, deleteReason || 'Удалено модератором');
      showSnackbar('Отзыв успешно удален', 'success');
      setDeleteDialogOpen(false);
      setSelectedReview(null);
      await loadData();
    } catch (error) {
      console.error('Ошибка удаления отзыва:', error);
      showSnackbar('Ошибка при удалении отзыва', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: 'warning', label: 'На модерации', icon: <FilterList /> },
      approved: { color: 'success', label: 'Одобрено', icon: <CheckCircle /> },
      rejected: { color: 'error', label: 'Отклонено', icon: <Cancel /> }
    };
    return configs[status] || configs.pending;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, ml: 0 }}>
      {/* Заголовок и кнопка обновления */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Модерация отзывов
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadData}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 0.8,
            fontWeight: 'bold'
          }}
        >
          Обновить
        </Button>
      </Box>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {stats.total}
              </Typography>
              <Typography variant="body2">Всего отзывов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {stats.pending}
              </Typography>
              <Typography variant="body2">На модерации</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {stats.approved}
              </Typography>
              <Typography variant="body2">Одобрено</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {stats.rejected}
              </Typography>
              <Typography variant="body2">Отклонено</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Панель поиска и фильтров */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Поиск по пользователям, товарам или тексту..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Статус отзыва"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            >
              <MenuItem value="all">Все статусы</MenuItem>
              <MenuItem value="pending">На модерации</MenuItem>
              <MenuItem value="approved">Одобренные</MenuItem>
              <MenuItem value="rejected">Отклоненные</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Чипсы для быстрой фильтрации */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<FilterList />}
            label="Быстрый фильтр:"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
          <Chip
            label={`Все (${moderationReviews.length})`}
            onClick={() => setStatusFilter('all')}
            variant={statusFilter === 'all' ? 'filled' : 'outlined'}
            color={statusFilter === 'all' ? 'primary' : 'default'}
            clickable
          />
          <Chip
            label={`На модерации (${stats.pending})`}
            onClick={() => setStatusFilter('pending')}
            variant={statusFilter === 'pending' ? 'filled' : 'outlined'}
            color={statusFilter === 'pending' ? 'warning' : 'default'}
            clickable
          />
        </Box>
      </Paper>

      {/* Список отзывов */}
      <Paper sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        {filteredReviews.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Comment sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Отзывы не найдены
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {moderationReviews.length === 0 ? 'Нет отзывов для модерации' : 'Попробуйте изменить параметры фильтрации'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 900 }}>
              {/* Заголовок таблицы */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: '80px minmax(250px, 1fr) 120px 100px 150px 200px',
                gap: 3.5,
                p: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${theme.palette.divider}`,
                alignItems: 'center'
              }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ minWidth: 100 }}>
                  Пользователь
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ minWidth: 250 }}>
                  Товар / Отзыв
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ textAlign: 'center', minWidth: 120 }}>
                  Оценка
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ textAlign: 'center', minWidth: 100 }}>
                  Статус
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ textAlign: 'center', minWidth: 150 }}>
                  Дата
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ textAlign: 'center', minWidth: 200 }}>
                  Действия
                </Typography>
              </Box>

              {/* Список отзывов */}
              {filteredReviews.map((review) => {
                const statusConfig = getStatusConfig(review.status);

                return (
                  <Box
                    key={review.id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '80px minmax(250px, 1fr) 120px 100px 150px 200px',
                      gap: 2,
                      p: 2,
                      alignItems: 'center',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02)
                      }
                    }}
                  >
                    {/* Аватар пользователя */}
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 80 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: theme.palette.primary.main
                        }}
                      >
                        <Person />
                      </Avatar>
                    </Box>

                    {/* Информация о товаре и отзыве */}
                    <Box sx={{ minWidth: 250 }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom noWrap>
                        {review.product?.name || 'Товар не найден'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {review.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.user?.name || 'Аноним'}
                      </Typography>
                    </Box>

                    {/* Оценка */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      justifyContent: 'center',
                      minWidth: 120 
                    }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" fontWeight="bold">
                        {review.rating}.0
                      </Typography>
                    </Box>

                    {/* Статус */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 100 }}>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Дата */}
                    <Typography variant="body2" color="text.secondary" sx={{ 
                      textAlign: 'center',
                      minWidth: 150 
                    }}>
                      {formatDate(review.created_at)}
                    </Typography>

                    {/* Действия */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      justifyContent: 'center',
                      minWidth: 200 
                    }}>
                      {review.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleApprove(review.id)}
                            sx={{
                              color: 'success.main',
                              '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) }
                            }}
                            title="Одобрить отзыв"
                          >
                            <ThumbUp />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleRejectClick(review)}
                            sx={{
                              color: 'error.main',
                              '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                            }}
                            title="Отклонить отзыв"
                          >
                            <ThumbDown />
                          </IconButton>
                        </>
                      )}
                      
                      {/* Кнопка удаления для всех статусов */}
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(review)}
                        sx={{
                          color: 'error.dark',
                          '&:hover': { 
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            color: 'error.main'
                          }
                        }}
                        title="Удалить отзыв"
                      >
                        <Delete />
                      </IconButton>

                      {(review.status === 'approved' || review.status === 'rejected') && 
                       review.status !== 'pending' && (
                        <Typography variant="caption" color="text.secondary">
                          Обработан
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Диалог отклонения отзыва */}
      <Dialog 
        open={rejectDialogOpen} 
        onClose={() => setRejectDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Отклонить отзыв
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Укажите причину отклонения отзыва от пользователя{' '}
            <strong>{selectedReview?.user?.name}</strong>
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
          {selectedReview && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Текст отзыва: "{selectedReview.comment}"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setRejectDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleRejectConfirm} 
            variant="contained" 
            color="error"
            disabled={!rejectReason.trim()}
            sx={{ borderRadius: 1 }}
          >
            Отклонить отзыв
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог удаления отзыва */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Warning />
          Удалить отзыв
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
            Это действие нельзя отменить! Отзыв будет полностью удален из системы.
          </Alert>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить отзыв от пользователя{' '}
            <strong>{selectedReview?.user?.name}</strong>?
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            placeholder="Причина удаления отзыва (обязательно)..."
            variant="outlined"
            required
          />
          
          {selectedReview && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Текст отзыва: "{selectedReview.comment}"
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                Статус: {getStatusConfig(selectedReview.status).label}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            disabled={!deleteReason.trim()}
            startIcon={<Delete />}
            sx={{ borderRadius: 1 }}
          >
            Удалить навсегда
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={handleCloseSnackbar}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminReviewsPage;