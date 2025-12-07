// src/pages/OrderSuccess/OrderSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { 
  CheckCircle, 
  ShoppingBag, 
  Home, 
  Email,
  Phone,
  AccessTime
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem('lastOrder');
    
    // Пробуем получить данные из location.state
    if (location.state) {
      setOrderInfo(location.state);
      
      // Сохраняем в localStorage для повторного посещения
      if (location.state.orderNumber) {
        localStorage.setItem('lastOrder', JSON.stringify(location.state));
      }
    } 
    // Если нет в location.state, пробуем получить из localStorage
    else if (savedOrder) {
      try {
        setOrderInfo(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Error parsing saved order:', e);
        localStorage.removeItem('lastOrder');
      }
    }
    
    // Прокрутка вверх при загрузке
    window.scrollTo(0, 0);
    
    // Очистка localStorage через 1 час
    const cleanupTimer = setTimeout(() => {
      localStorage.removeItem('lastOrder');
    }, 60 * 60 * 1000);
    
    return () => clearTimeout(cleanupTimer);
  }, [location.state]);

  const handleContinueShopping = () => {
    navigate('/catalog');
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleContactSupport = () => {
    // Можно добавить ссылку на чат или email
    window.location.href = 'mailto:support@electronic.tw1.ru';
  };

  if (loading) {
    return (
      <Container sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Загружаем информацию о заказе...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, minHeight: '70vh' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 3, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        {/* Анимация успеха */}
        <Box sx={{ 
          width: { xs: 80, md: 100 }, 
          height: { xs: 80, md: 100 }, 
          borderRadius: '50%', 
          bgcolor: 'success.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 4,
          animation: 'scaleIn 0.5s ease-out'
        }}>
          <CheckCircle sx={{ fontSize: { xs: 50, md: 60 }, color: 'white' }} />
        </Box>
        
        {/* Заголовок */}
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            color: 'success.main',
            fontSize: { xs: '1.8rem', md: '2.5rem' },
            mb: 2
          }}
        >
          Заказ оформлен успешно!
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.secondary" 
          gutterBottom 
          sx={{ 
            mb: 4,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Спасибо за доверие! Мы уже начали обработку вашего заказа и скоро свяжемся с вами.
        </Typography>

        {/* Информация о заказе */}
        {orderInfo && orderInfo.orderNumber ? (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, 
              maxWidth: 500, 
              mx: 'auto',
              borderRadius: 2,
              textAlign: 'left',
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                Номер заказа: <Box component="span" sx={{ color: 'primary.main' }}>#{orderInfo.orderNumber}</Box>
              </Typography>
              
              {orderInfo.totalAmount && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Сумма: <strong>{orderInfo.totalAmount.toLocaleString('ru-RU')} ₽</strong>
                </Typography>
              )}
              
              {orderInfo.paymentMethod && (
                <Typography variant="body2" color="text.secondary">
                  Способ оплаты: {orderInfo.paymentMethod === 'card' ? 'Банковская карта' : 
                                orderInfo.paymentMethod === 'cash' ? 'Наличные при получении' : 
                                orderInfo.paymentMethod}
                </Typography>
              )}
            </Box>
          </Alert>
        ) : (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4, 
              maxWidth: 500, 
              mx: 'auto',
              borderRadius: 2 
            }}
          >
            Информация о заказе не найдена. Проверьте историю заказов в личном кабинете.
          </Alert>
        )}

        {/* Кнопки действий */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          mb: 4 
        }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleContinueShopping}
            startIcon={<Home />}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Продолжить покупки
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleViewOrders}
            startIcon={<ShoppingBag />}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 3,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Мои заказы
          </Button>
        </Box>

        {/* Дополнительная информация */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            bgcolor: 'grey.50', 
            borderRadius: 3,
            maxWidth: 800,
            mx: 'auto'
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Что дальше?
          </Typography>
          
          <Grid container spacing={3} sx={{ textAlign: 'left' }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Подтверждение
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Мы проверим ваш заказ в течение 1-2 часов в рабочее время (Пн-Пт, 9:00-18:00)
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Email sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Уведомления
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                На ваш email будут отправлены все обновления по статусу заказа
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Phone sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Поддержка
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Есть вопросы? Напишите нам на support@electronic.tw1.ru
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <span>💡</span> Вы можете отслеживать статус заказа в разделе "Мои заказы" в любое время
            </Typography>
          </Box>
        </Paper>
      </Paper>
      
      {/* Добавляем стили для анимации */}
      <style jsx>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Container>
  );
};

export default OrderSuccessPage;