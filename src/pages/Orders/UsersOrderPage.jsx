// src/pages/Orders/UserOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Alert,
  alpha
} from '@mui/material';
import {
  CalendarToday,
  Visibility
} from '@mui/icons-material';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUserOrders();
  }, []);

  const loadUserOrders = async () => {
    try {
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders || []);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
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

  const getStatusConfig = (status) => {
    const configs = {
      'completed': { color: 'success', text: 'Завершен' },
      'processing': { color: 'info', text: 'В обработке' },
      'shipped': { color: 'warning', text: 'Отправлен' },
      'cancelled': { color: 'error', text: 'Отменен' },
      'pending': { color: 'default', text: 'Ожидание' }
    };
    return configs[status?.toLowerCase()] || { color: 'default', text: status };
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Загрузка ваших заказов...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: 4
    }}>
      <Container maxWidth="md">
        {/* Заголовок */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
            📦 Мои заказы
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {orders.length > 0 ? `Найдено заказов: ${orders.length}` : 'Ваша история заказов'}
          </Typography>
        </Box>

        {orders.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, maxWidth: 400 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                У вас еще нет заказов
              </Alert>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/catalog')}
                sx={{ borderRadius: 2 }}
              >
                Сделать первый заказ
              </Button>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <Paper
                  key={order.id}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    width: '100%',
                    maxWidth: 700,
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  {/* Заголовок заказа */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Заказ #{order.order_number || order.id}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.created_at || order.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={statusConfig.text}
                        color={statusConfig.color}
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewOrder(order.id)}
                        sx={{ borderRadius: 2 }}
                      >
                        Детали
                      </Button>
                    </Box>
                  </Box>

                  {/* Товары */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Состав заказа:
                    </Typography>
                    {(order.items || order.order_items || []).map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: 'grey.50'
                        }}
                      >
                        <Typography variant="body2">
                          {item.name} × {item.quantity}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {((item.price || 0) * item.quantity).toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Итого */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Итого: {(order.total_amount || order.totalAmount)?.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* Декоративные элементы */}
        <Box sx={{
          position: 'fixed',
          top: '20%',
          left: '5%',
          width: 200,
          height: 200,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '50%',
          zIndex: -1,
          filter: 'blur(40px)'
        }} />
        
        <Box sx={{
          position: 'fixed',
          bottom: '20%',
          right: '5%',
          width: 250,
          height: 250,
          background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 82, 0.1) 100%)',
          borderRadius: '50%',
          zIndex: -1,
          filter: 'blur(50px)'
        }} />
      </Container>
    </Box>
  );
};

export default UserOrdersPage;