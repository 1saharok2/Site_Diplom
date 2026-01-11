// pages/Orders/OrdersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ShoppingBag,
  CalendarToday,
  LocalShipping,
  CheckCircle,
  Cancel,
  Visibility,
  HistoryOutlined,
  ReceiptLongOutlined,
  WarningAmber
} from '@mui/icons-material';
import { orderService } from '../../services/orderService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(Array.isArray(userOrders) ? userOrders : []);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      setError('Не удалось загрузить историю заказов');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchOrders]);

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setCancelling(true);
    try {
      // Используем adminService.updateOrderStatus
      await adminService.updateOrderStatus(orderToCancel.id, 'cancelled');
      
      setSuccessMessage('Заказ успешно отменен');
      setCancelDialogOpen(false);
      fetchOrders(); // Обновляем список заказов
      
    } catch (error) {
      console.error('Ошибка отмены заказа:', error);
      
      // Проверяем тип ошибки
      let errorMessage = 'Не удалось отменить заказ';
      
      if (error.message.includes('Токен не найден')) {
        errorMessage = 'Ошибка авторизации. Пожалуйста, войдите заново.';
      } else if (error.message.includes('Недостаточно данных')) {
        errorMessage = 'Ошибка в данных заказа';
      } else if (error.message.includes('403') || error.message.includes('Доступ запрещен')) {
        errorMessage = 'У вас нет прав для отмены заказа';
      }
      
      setError(errorMessage);
    } finally {
      setCancelling(false);
      setOrderToCancel(null);
    }
  };

  const openCancelDialog = (order) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setOrderToCancel(null);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'completed': 'success',
      'processing': 'info',
      'shipped': 'warning',
      'cancelled': 'error',
      'delivered': 'success',
      'pending': 'default'
    };
    return statusColors[status?.toLowerCase()] || 'default';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      'completed': <CheckCircle />,
      'processing': <ShoppingBag />,
      'shipped': <LocalShipping />,
      'cancelled': <Cancel />,
      'delivered': <CheckCircle />,
      'pending': <ShoppingBag />
    };
    return statusIcons[status?.toLowerCase()] || <ShoppingBag />;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'В обработке',
      'processing': 'Обрабатывается',
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    };
    return statusMap[status?.toLowerCase()] || status;
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

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const canCancelOrder = (order) => {
    return order.status === 'pending' || order.status === 'processing';
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            p: 3,
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            border: '2px solid #ffd54f'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            🔐 Для просмотра заказов необходимо авторизоваться
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ 
        py: 12, 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress 
          size={70} 
          thickness={3} 
          sx={{ 
            color: 'primary.main', 
            mb: 3,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }} 
        />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Загрузка истории заказов...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      py: { xs: 3, md: 4 }, 
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Заголовок */}
      <Box sx={{ 
        mb: 6, 
        width: '100%',
        maxWidth: '1200px'
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          px: 4,
          py: 3,
          borderRadius: 4,
          color: 'white',
          mb: 3
        }}>
          <HistoryOutlined sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h2" sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}>
              История заказов
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              {orders.length > 0 ? `Всего заказов: ${orders.length}` : 'Ваши заказы появятся здесь'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 4, width: '100%', maxWidth: '1200px' }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 4, width: '100%', maxWidth: '1200px' }} 
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            textAlign: 'center', 
            py: { xs: 8, md: 12 }, 
            px: { xs: 3, md: 4 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '2px dashed',
            borderColor: 'divider',
            maxWidth: 600,
            width: '100%'
          }}
        >
          <Box sx={{
            width: 100,
            height: 100,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 4
          }}>
            <ReceiptLongOutlined sx={{ fontSize: 50, color: 'white' }} />
          </Box>
          <Typography variant="h4" gutterBottom sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            color: 'text.primary'
          }}>
            Заказов пока нет
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ 
            mb: 4, 
            maxWidth: 400, 
            mx: 'auto',
            fontSize: '1.1rem'
          }}>
            После оформления заказа он появится в этом разделе
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/catalog')}
            sx={{ 
              px: 5,
              py: 1.5,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            🛒 Начать покупки
          </Button>
        </Paper>
      ) : (
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          px: { xs: 2, sm: 3, md: 4 }
        }}>
          <Grid 
            container 
            spacing={3} 
            sx={{ 
              maxWidth: '1200px',
              justifyContent: 'center'
            }}
          >
            {orders.map((order) => (
              <Grid 
                item 
                xs={12} 
                md={10} 
                lg={8} 
                key={order.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: { xs: 3, md: 4 }, 
                    borderRadius: 3,
                    background: 'white',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    '&:hover': {
                      boxShadow: 4
                    }
                  }}
                >
                  {/* Шапка заказа */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: 3,
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2
                  }}>
                    <Box>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Заказ #{order.order_number || order.id}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' }
                    }}>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<Visibility />}
                        onClick={() => handleViewOrder(order.id)}
                      >
                        Детали
                      </Button>
                    </Box>
                  </Box>

                  {/* Итого и действия */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Итого: {order.total_amount?.toLocaleString('ru-RU')} ₽
                    </Typography>
                    
                    {canCancelOrder(order) && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="medium"
                        startIcon={<Cancel />}
                        onClick={() => openCancelDialog(order)}
                      >
                        Отменить заказ
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Диалог подтверждения отмены заказа */}
      <Dialog
        open={cancelDialogOpen}
        onClose={closeCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmber color="warning" />
          Подтверждение отмены заказа
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите отменить заказ #{orderToCancel?.order_number || orderToCancel?.id}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Сумма заказа: {orderToCancel?.total_amount?.toLocaleString('ru-RU')} ₽
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Это действие невозможно отменить!
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelDialog} disabled={cancelling}>
            Отмена
          </Button>
          <Button
            onClick={handleCancelOrder}
            color="error"
            variant="contained"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={20} /> : <Cancel />}
          >
            {cancelling ? 'Отмена...' : 'Да, отменить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrdersPage;