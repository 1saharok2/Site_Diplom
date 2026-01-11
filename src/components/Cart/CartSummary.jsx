// components/Cart/CartSummary.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

const CartSummary = ({ cartItems, onClearCart, onRefreshCart }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const totalAmount = cartService.getCartTotal(cartItems);
  const itemsCount = cartService.getCartItemsCount(cartItems);

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cartItems.length === 0) {
      setError('Корзина пуста');
      setShowError(true);
      return;
    }

    // Просто уходим на страницу оформления, ничего не отправляя на сервер!
    navigate('/checkout'); 
  };

  const handleClearCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await cartService.clearCart(user.id);
      if (onClearCart) onClearCart();
      if (onRefreshCart) onRefreshCart();
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
      setError('Ошибка очистки корзины');
      setShowError(true);
    }
  };

  const handleContinueShopping = () => {
    navigate('/catalog');
  };

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Итоги заказа
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          <strong>Товары ({itemsCount})</strong>
          <Box component="span" sx={{ float: 'right' }}>
            {totalAmount.toLocaleString('ru-RU')} ₽
          </Box>
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Общая сумма
      </Typography>
      <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 'bold' }}>
        {totalAmount.toLocaleString('ru-RU')} ₽
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handlePlaceOrder}
          disabled={loading || cartItems.length === 0}
          sx={{ 
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'ОФОРМЛЕНИЕ...' : 'ОФОРМИТЬ ЗАКАЗ'}
        </Button>

        <Button
          variant="outlined"
          color="error"
          fullWidth
          onClick={handleClearCart}
          disabled={cartItems.length === 0 || loading}
        >
          ОЧИСТИТЬ КОРЗИНУ
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleContinueShopping}
          disabled={loading}
        >
          ПРОДОЛЖИТЬ ПОКУПКИ
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          textAlign: 'center',
          fontSize: '0.9rem'
        }}
      >
        Быстрый ответ • 14 дней на возврат • Защита покупателя
      </Typography>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={handleCloseError}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CartSummary;