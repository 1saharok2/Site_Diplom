// src/pages/OrderSuccess/OrderSuccessPage.jsx
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccessPage = () => {
  const location = useLocation();
  const { orderNumber, totalAmount } = location.state || {};

  React.useEffect(() => {
    if (!orderNumber) {
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
      }
    }
  }, [orderNumber]);

  return (
    <Container sx={{ py: 8, minHeight: '60vh' }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
          Заказ оформлен успешно!
        </Typography>
        
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время для подтверждения.
        </Typography>

        {orderNumber && (
          <Alert severity="info" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            <Box>
              <Typography fontWeight="bold">
                Номер вашего заказа: #{orderNumber}
              </Typography>
              {totalAmount && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Сумма заказа: {totalAmount.toLocaleString('ru-RU')} ₽
                </Typography>
              )}
            </Box>
          </Alert>
        )}

        {!orderNumber && (
          <Alert severity="warning" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Информация о заказе не найдена. Проверьте историю заказов в личном кабинете.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/catalog"
            variant="contained"
            size="large"
            sx={{ px: 4 }}
          >
            Продолжить покупки
          </Button>
          <Button
            component={Link}
            to="/orders"
            variant="outlined"
            size="large"
            sx={{ px: 4 }}
          >
            Мои заказы
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            ⏰ Время обработки заказа: 1-2 часа в рабочее время
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage;