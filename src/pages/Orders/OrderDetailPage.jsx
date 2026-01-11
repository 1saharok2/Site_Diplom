// pages/Orders/OrderDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Button,
  Card,
  CardContent
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  LocalShipping,
  CheckCircle,
  Cancel,
  ShoppingBag,
  ReceiptLong,
  Person,
  Email,
  Phone,
  Payments,
  Inventory
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';

const OrderDetailPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { orderId } = useParams();
  const navigate = useNavigate();

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const orderData = await orderService.getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Ошибка загрузки заказа:', error);
      setError('Не удалось загрузить информацию о заказе');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
          Загрузка информации о заказе...
        </Typography>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4, 
            borderRadius: 3,
            p: 3,
            background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
            border: '2px solid #f44336'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {error || 'Заказ не найден'}
          </Typography>
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ 
            borderRadius: 3,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a67d8 0%, #6b46c1 100%)'
            }
          }}
        >
          Назад к заказам
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      py: { xs: 3, md: 4 }, 
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #fafbfc 0%, #f5f7fa 50%)'
    }}>
      {/* Шапка */}
      <Box sx={{ mb: 6 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ 
            color: 'text.secondary', 
            mb: 3,
            borderRadius: 2,
            px: 2,
            py: 1,
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateX(-2px)'
            },
            transition: 'all 0.2s ease-in-out'
          }}
        >
          Назад к заказам
        </Button>

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
          <ReceiptLong sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h2" sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}>
              Заказ #{order.order_number}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Детальная информация о вашем заказе
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Левая колонка - товары */}
        <Grid item xs={12} lg={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, md: 4 }, 
              borderRadius: 4,
              background: 'white',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}
          >
            <Typography variant="h5" sx={{ 
              mb: 4, 
              fontWeight: 700, 
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Inventory sx={{ color: 'primary.main' }} />
              Состав заказа ({order.items?.length || 0})
            </Typography>

            <Box sx={{ mb: 4 }}>
              {order.items?.map((item, index) => (
                <Card 
                  key={index} 
                  elevation={0}
                  sx={{ 
                    mb: 2, 
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      {item.product_name || item.name || `Товар #${item.product_id}`}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Количество: {item.quantity} × {item.price?.toLocaleString('ru-RU')} ₽
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              color: 'white'
            }}>
              <Typography variant="h6">
                Общая сумма:
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {order.total_amount?.toLocaleString('ru-RU')} ₽
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Правая колонка - информация */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 100, zIndex: 10 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: 4,
                background: 'white',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}
            >
              <Typography variant="h5" sx={{ 
                mb: 4, 
                fontWeight: 700, 
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Payments sx={{ color: 'primary.main' }} />
                Информация о заказе
              </Typography>

              {/* Статус */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Статус заказа:
                </Typography>
                <Chip
                  icon={getStatusIcon(order.status)}
                  label={getStatusText(order.status)}
                  color={getStatusColor(order.status)}
                  sx={{ 
                    width: '100%',
                    py: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: getStatusColor(order.status) === 'success' ? 
                      'linear-gradient(45deg, #4caf50 0%, #66bb6a 100%)' :
                      getStatusColor(order.status) === 'warning' ?
                      'linear-gradient(45deg, #ff9800 0%, #ffb74d 100%)' :
                      getStatusColor(order.status) === 'error' ?
                      'linear-gradient(45deg, #f44336 0%, #ef5350 100%)' :
                      'linear-gradient(45deg, #2196f3 0%, #42a5f5 100%)',
                    color: 'white'
                  }}
                />
              </Box>

              {/* Дата */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Дата создания:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <CalendarToday sx={{ color: 'primary.main' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(order.created_at)}
                  </Typography>
                </Box>
              </Box>

              {/* Номер заказа */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Номер заказа:
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'monospace', 
                    fontWeight: 600,
                    color: 'primary.main'
                  }}>
                    #{order.order_number}
                  </Typography>
                </Box>
              </Box>

              {/* Информация о клиенте */}
              {(order.customer_name || order.customer_email || order.customer_phone) && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    Информация о получателе:
                  </Typography>
                  
                  {order.customer_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Person sx={{ color: 'primary.main' }} />
                      <Typography variant="body1">
                        {order.customer_name}
                      </Typography>
                    </Box>
                  )}
                  
                  {order.customer_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Email sx={{ color: 'primary.main' }} />
                      <Typography variant="body1">
                        {order.customer_email}
                      </Typography>
                    </Box>
                  )}
                  
                  {order.customer_phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Phone sx={{ color: 'primary.main' }} />
                      <Typography variant="body1">
                        {order.customer_phone}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailPage;