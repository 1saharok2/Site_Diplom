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
  MenuItem,
  Tab,
  Tabs
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
  Warning,
  AllInbox,
  Pending,
  CheckCircleOutline,
  CancelOutlined
} from '@mui/icons-material';
import { useReviews } from '../../context/ReviewContext';

const AdminReviewsPage = () => {
  const {
    reviews = [], // ДОБАВЛЕНО: все отзывы
    moderationReviews = [],
    loading = false,
    loadAllReviews, // ДОБАВЛЕНО: функция загрузки всех отзывов
    loadModerationReviews,
    approveReview,
    rejectReview,
    deleteReview,
    getReviewStats
  } = useReviews();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const theme = useTheme();

  // Загрузка всех данных
  const loadData = useCallback(async () => {
    try {
      // Загружаем статистику всегда
      if (getReviewStats) {
        const statsData = await getReviewStats();
        setStats(statsData || { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
      
      // Загружаем отзывы в зависимости от активной вкладки
      if (activeTab === 'all' && loadAllReviews) {
        await loadAllReviews();
      } else if (activeTab === 'pending' && loadModerationReviews) {
        await loadModerationReviews();
      } else if (activeTab === 'approved' && loadAllReviews) {
        // Можно либо загрузить все и отфильтровать, либо сделать отдельный эндпоинт
        await loadAllReviews();
      } else if (activeTab === 'rejected' && loadAllReviews) {
        await loadAllReviews();
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      showSnackbar('Ошибка загрузки данных', 'error');
    }
  }, [activeTab, loadAllReviews, loadModerationReviews, getReviewStats]);

  useEffect(() => {
    loadData();
  }, [activeTab, loadData]);

  // Фильтрация отзывов
  const filterReviews = useCallback(() => {
    // Определяем источник данных в зависимости от активной вкладки
    let sourceReviews = [];
    
    if (activeTab === 'all') {
      sourceReviews = reviews.length > 0 ? reviews : moderationReviews;
    } else if (activeTab === 'pending') {
      sourceReviews = moderationReviews; // На модерации
    } else {
      // Для одобренных и отклоненных фильтруем из всех отзывов
      sourceReviews = reviews.filter(r => r.status === activeTab);
    }

    // Применяем поиск
    let filtered = sourceReviews.filter(review => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        review.user?.name?.toLowerCase().includes(searchLower) ||
        review.user?.email?.toLowerCase().includes(searchLower) ||
        review.product?.name?.toLowerCase().includes(searchLower) ||
        review.comment?.toLowerCase().includes(searchLower) ||
        review.id?.toString().includes(searchLower)
      );
    });

    // Сортируем по дате (сначала новые)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredReviews(filtered);
  }, [reviews, moderationReviews, searchTerm, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterReviews();
  }, [filterReviews]);

  // Обработчики действий
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      pending: { color: 'warning', label: 'На модерации', icon: <Pending /> },
      approved: { color: 'success', label: 'Одобрено', icon: <CheckCircleOutline /> },
      rejected: { color: 'error', label: 'Отклонено', icon: <CancelOutlined /> }
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
          Управление отзывами
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
            borderRadius: 2,
            cursor: 'pointer',
            transform: activeTab === 'all' ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }} onClick={() => setActiveTab('all')}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <AllInbox sx={{ fontSize: 32, mb: 1 }} />
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
            borderRadius: 2,
            cursor: 'pointer',
            transform: activeTab === 'pending' ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }} onClick={() => setActiveTab('pending')}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Pending sx={{ fontSize: 32, mb: 1 }} />
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
            borderRadius: 2,
            cursor: 'pointer',
            transform: activeTab === 'approved' ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }} onClick={() => setActiveTab('approved')}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <CheckCircle sx={{ fontSize: 32, mb: 1 }} />
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
            borderRadius: 2,
            cursor: 'pointer',
            transform: activeTab === 'rejected' ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)'
            }
          }} onClick={() => setActiveTab('rejected')}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Cancel sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h5" gutterBottom>
                {stats.rejected}
              </Typography>
              <Typography variant="body2">Отклонено</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Табы для быстрого переключения */}
      <Paper sx={{ mb: 2, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              fontWeight: 'bold'
            }
          }}
        >
          <Tab 
            icon={<AllInbox />} 
            label={`Все (${stats.total})`} 
            value="all"
            iconPosition="start"
          />
          <Tab 
            icon={<Pending />} 
            label={`На модерации (${stats.pending})`} 
            value="pending"
            iconPosition="start"
          />
          <Tab 
            icon={<CheckCircle />} 
            label={`Одобренные (${stats.approved})`} 
            value="approved"
            iconPosition="start"
          />
          <Tab 
            icon={<Cancel />} 
            label={`Отклоненные (${stats.rejected})`} 
            value="rejected"
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Панель поиска */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Поиск по пользователям, товарам, тексту или ID отзыва..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: filteredReviews.length > 0 && (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary">
                      Найдено: {filteredReviews.length}
                    </Typography>
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
        </Grid>
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
              {searchTerm 
                ? 'Попробуйте изменить параметры поиска' 
                : activeTab === 'all' 
                  ? 'Нет отзывов в системе'
                  : `Нет ${activeTab === 'pending' ? 'ожидающих' : activeTab === 'approved' ? 'одобренных' : 'отклоненных'} отзывов`}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 1000 }}>
              {/* Заголовок таблицы */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: '80px minmax(250px, 1fr) 120px 100px 150px 200px',
                gap: 2,
                p: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${theme.palette.divider}`,
                alignItems: 'center'
              }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ minWidth: 80 }}>
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
                        src={review.user?.avatar}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: theme.palette.primary.main
                        }}
                      >
                        {review.user?.name ? review.user.name[0] : <Person />}
                      </Avatar>
                    </Box>

                    {/* Информация о товаре и отзыве */}
                    <Box sx={{ minWidth: 250 }}>
                      <Typography variant="subtitle2" fontWeight="medium" gutterBottom noWrap>
                        {review.product?.name || 'Товар не найден'} 
                        {review.product?.id && (
                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            (ID: {review.product.id})
                          </Typography>
                        )}
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
                        {review.user?.name || 'Аноним'} • ID: {review.user?.id || 'Н/Д'}
                      </Typography>
                    </Box>

                    {/* Оценка */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      gap: 0.5, 
                      justifyContent: 'center',
                      minWidth: 120 
                    }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="body2" fontWeight="bold">
                        {review.rating}.0 / 5.0
                      </Typography>
                    </Box>

                    {/* Статус */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 100 }}>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                        variant={review.status === 'pending' ? 'filled' : 'outlined'}
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
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
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
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
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
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.error.main, 0.2),
                            color: 'error.main'
                          }
                        }}
                        title="Удалить отзыв"
                      >
                        <Delete />
                      </IconButton>
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
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Укажите причину отклонения отзыва от пользователя{' '}
            <strong>{selectedReview?.user?.name || 'Пользователь'}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Причина отклонения отзыва..."
            variant="outlined"
            autoFocus
          />
          {selectedReview && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Текст отзыва:</strong>
              </Typography>
              <Typography variant="body2">
                "{selectedReview.comment}"
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
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
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
            Это действие нельзя отменить! Отзыв будет полностью удален из системы.
          </Alert>
          
          <Typography variant="body2" sx={{ mb: 2 }}>
            Вы уверены, что хотите удалить отзыв от пользователя{' '}
            <strong>{selectedReview?.user?.name || 'Пользователь'}</strong>?
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
            autoFocus
          />
          
          {selectedReview && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                <strong>Текст отзыва:</strong>
              </Typography>
              <Typography variant="body2">
                "{selectedReview.comment}"
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Статус: {getStatusConfig(selectedReview.status).label}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
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