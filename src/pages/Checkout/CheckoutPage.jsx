// pages/Checkout/CheckoutPage.jsx
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  MenuItem
} from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Россия',
    paymentMethod: 'card'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🟢 handleSubmit вызван');
    setLoading(true);
    setError('');

    // Валидация формы
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.city || !formData.postalCode) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }

    // Проверяем пользователя
    if (!currentUser || !currentUser.id) {
      setError('Требуется авторизация');
      setLoading(false);
      return;
    }

    // Проверяем корзину
    if (items.length === 0) {
      setError('Корзина пуста');
      setLoading(false);
      return;
    }

    try {
      console.log('📦 Создание заказа...');
      const orderData = {
        userId: currentUser.id,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.products?.price || 0,
          name: item.products?.name || '',
          image: item.products?.image_url?.[0] || ''
        })),
        totalAmount: getTotalPrice(),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      };

      console.log('🚀 Данные заказа:', orderData);

      // Создаем заказ
      const order = await createOrder(orderData);
      console.log('✅ Заказ создан:', order);
      
      // Очищаем корзину после успешного заказа
      await clearCart();
      console.log('🛒 Корзина очищена');
      
      // Перенаправляем на страницу подтверждения
      navigate(`/order-success/${order.id}`);
      
    } catch (err) {
      console.error('❌ Ошибка создания заказа:', err);
      setError(err.message || 'Ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Добавим кнопку для отладки
  const debugCheck = () => {
    console.log('🔍 Отладка:');
    console.log('currentUser:', currentUser);
    console.log('items:', items);
    console.log('items length:', items.length);
    console.log('formData:', formData);
  };

  if (items.length === 0) {
    return (
      <Container sx={{ py: 8, minHeight: '60vh' }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            Корзина пуста
          </Typography>
          <Typography>
            Добавьте товары в корзину перед оформлением заказа
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Оформление заказа
      </Typography>

      {/* Кнопка отладки */}
      <Button onClick={debugCheck} variant="outlined" sx={{ mb: 2 }}>
        Debug Info
      </Button>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Данные для доставки
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Имя *"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Фамилия *"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email *"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="tel"
                    label="Телефон *"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+7 (999) 999-99-99"
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Адрес доставки *"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="ул. Примерная, д. 1, кв. 1"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Город *"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Почтовый индекс *"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    placeholder="123456"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Страна"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <MenuItem value="Россия">Россия</MenuItem>
                    <MenuItem value="Казахстан">Казахстан</MenuItem>
                    <MenuItem value="Беларусь">Беларусь</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Способ оплаты *"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <MenuItem value="card">Банковская карта</MenuItem>
                    <MenuItem value="cash">Наличные при получении</MenuItem>
                    <MenuItem value="sbp">СБП (Система быстрых платежей)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Ваш заказ
              </Typography>

              <Box sx={{ mb: 2 }}>
                {items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      {item.products?.name} × {item.quantity}
                    </Typography>
                    <Typography variant="body2">
                      {((item.products?.price || 0) * item.quantity).toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Итого:</Typography>
                <Typography variant="h6" color="primary">
                  {getTotalPrice().toLocaleString('ru-RU')} ₽
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? 'Оформление...' : `Оформить заказ - ${getTotalPrice().toLocaleString('ru-RU')} ₽`}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default CheckoutPage;