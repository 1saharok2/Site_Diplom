import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import { 
  CheckCircle, 
  ShoppingBag, 
  Home, 
  Email,
  Phone,
  AccessTime,
  LocalShipping,
  Payment
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📍 Location state:', location.state); // Отладка
    
    // 1. Пробуем получить данные из location.state
    if (location.state) {
      console.log('✅ Данные получены из location.state:', location.state);
      setOrderInfo(location.state);
      
      // Сохраняем в localStorage для повторного посещения
      if (location.state.orderNumber) {
        localStorage.setItem('lastOrder', JSON.stringify(location.state));
        console.log('💾 Данные сохранены в localStorage');
      }
    } 
    // 2. Если нет в location.state, пробуем из localStorage
    else {
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          console.log('📦 Данные загружены из localStorage:', parsedOrder);
          setOrderInfo(parsedOrder);
        } catch (e) {
          console.error('❌ Ошибка парсинга saved order:', e);
          localStorage.removeItem('lastOrder');
        }
      } else {
        console.log('⚠️ Данные о заказе не найдены нигде');
      }
    }
    
    setLoading(false);
    
    // Прокрутка вверх
    window.scrollTo(0, 0);
    
    // Очистка через 1 час
    const cleanupTimer = setTimeout(() => {
      localStorage.removeItem('lastOrder');
      console.log('🧹 localStorage очищен');
    }, 60 * 60 * 1000);
    
    return () => clearTimeout(cleanupTimer);
  }, [location.state]);

  // Форматирование суммы
  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) return '0';
    
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    
    if (isNaN(num)) {
      console.error('❌ Некорректная сумма:', amount);
      return '0';
    }
    
    return num.toLocaleString('ru-RU');
  };

  // Форматирование способа оплаты
  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'card': return 'Банковская карта';
      case 'cash': return 'Наличные при получении';
      case 'sbp': return 'СБП (Система быстрых платежей)';
      default: return method || 'Не указан';
    }
  };

  const handleContinueShopping = () => {
    navigate('/catalog');
  };

  const handleViewOrders = () => {
    navigate('/orders');
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
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 4, 
              maxWidth: 600, 
              mx: 'auto',
              borderRadius: 2,
              textAlign: 'left'
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingBag /> Детали заказа
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Номер заказа:
                </Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  #{orderInfo.orderNumber}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Сумма:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatAmount(orderInfo.totalAmount)} ₽
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Способ оплаты:
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Payment fontSize="small" /> {formatPaymentMethod(orderInfo.paymentMethod)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Статус:
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime fontSize="small" /> Ожидает обработки
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body2" color="text.secondary">
              Информация о заказе отправлена на ваш email.
            </Typography>
          </Paper>
        ) : (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 4, 
              maxWidth: 600, 
              mx: 'auto',
              borderRadius: 2 
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              Информация о заказе не найдена
            </Typography>
            <Typography variant="body2">
              Проверьте историю заказов в личном кабинете или свяжитесь с поддержкой.
            </Typography>
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
      </Paper>
      
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