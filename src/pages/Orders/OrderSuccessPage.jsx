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
import { Link } from 'react-router-dom';

const OrderSuccessPage = () => {
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

        <Alert severity="info" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
          Номер вашего заказа: #{Math.floor(Math.random() * 10000)}
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/catalog"
            variant="contained"
            size="large"
          >
            Продолжить покупки
          </Button>
          <Button
            component={Link}
            to="/profile"
            variant="outlined"
            size="large"
          >
            Мои заказы
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderSuccessPage;