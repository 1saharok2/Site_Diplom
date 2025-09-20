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

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cartItems.length === 0) {
      setError('Корзина пуста');
      setShowError(true);
      return;
    }

    setLoading(true);
    setError('');
    setShowError(false);
    
    console.log('🔍 Данные пользователя в корзине:', {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      first_name: user?.first_name, 
      last_name: user?.last_name,
      username: user?.username,
      phone: user?.phone,
      fullObject: user
    });

    try {
      // Подготавливаем данные для заказа
      const orderData = {
        userId: user.id,
        items: cartItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.products?.price || 0,
          name: item.products?.name || 'Неизвестный товар'
        })),
        totalAmount: totalAmount
      };

      console.log('🟢 Отправка данных заказа:', orderData);

      // Создаем заказ
      const order = await orderService.createOrder(orderData, user);
      
      // Проверяем что заказ содержит order_number
      if (!order || !order.order_number) {
        // Если нет номера заказа, но есть ID, создаем номер вручную
        if (order && order.id) {
          order.order_number = 'ORD-' + order.id;
        } else {
          throw new Error('Заказ не содержит номер заказа');
        }
      }

      // Очищаем корзину после успешного оформления
      try {
        await cartService.clearCart(user.id);
        if (onClearCart) onClearCart();
      } catch (clearError) {
        console.warn('⚠️ Ошибка очистки корзины:', clearError);
      }

      // Перенаправляем на страницу успеха
      navigate('/order-success', { 
        state: { 
          orderNumber: order.order_number,
          totalAmount: totalAmount,
          orderId: order.id
        } 
      });

    } catch (error) {
      console.error('❌ Ошибка оформления заказа:', error);
      
      let errorMessage = 'Произошла ошибка при оформлении заказа. ';
      
      if (error.message?.includes('order_number')) {
        errorMessage += 'Проблема с генерацией номера заказа.';
      } else if (error.message?.includes('null value')) {
        errorMessage += 'Не заполнены обязательные поля. Проверьте данные профиля.';
      } else {
        errorMessage += error.message || 'Попробуйте еще раз.';
      }
      
      setError(errorMessage);
      setShowError(true);
    } finally {
      setLoading(false);
    }
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

        <Typography variant="body1" gutterBottom>
          <strong>Доставка</strong>
          <Box component="span" sx={{ float: 'right', color: 'success.main' }}>
            Бесплатно
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
        Бесплатная доставка • 14 дней на возврат • Защита покупателя
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