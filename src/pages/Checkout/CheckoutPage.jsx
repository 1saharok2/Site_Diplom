import React, { useState, useEffect } from 'react';
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
  MenuItem,
  CircularProgress,
  Avatar
} from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const CheckoutPage = () => {
  const { items: cartItems, getTotalPrice, clearCart, loading: cartLoading } = useCart();
  const { isAuthenticated: isAuthHook, currentUser: authUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: authUser?.first_name || authUser?.firstName || '',
    lastName: authUser?.last_name || authUser?.lastName || '',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    address: '',
    city: '',
    paymentMethod: 'card'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getProductName = (item) => {
    return item?.product_name || 
          item?.products?.name || 
          item?.name || 
          item?.title || 
          item?.productName ||
          'Товар';
  };

  const getProductPrice = (item) => {
    const price = parseFloat(
      item?.price || 
      item?.products?.price || 
      item?.product_price || 
      item?.unitPrice ||
      0
    );
    return isNaN(price) ? 0 : price;
  };

  const getProductId = (item) => {
    return item?.product_id || 
          item?.id || 
          item?.products?.id || 
          item?.productId ||
          null;
  };

  const getProductImage = (item) => {
    try {
      const possibleImageFields = [
        item?.image_url,
        item?.product_image,
        item?.image,
        item?.products?.image_url,
        item?.products?.image,
        item?.mainImage,
        item?.images?.[0]
      ];

      for (const imageField of possibleImageFields) {
        if (imageField) {
          if (typeof imageField === 'string' && imageField.startsWith('[')) {
            try {
              const images = JSON.parse(imageField);
              if (Array.isArray(images) && images.length > 0) {
                return images[0];
              }
            } catch (e) {}
          }
          return imageField;
        }
      }
      return '';
    } catch (e) {
      console.error('Ошибка получения изображения:', e);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isAuthHook) {
      setError('Пожалуйста, авторизуйтесь для оформления заказа.');
      setLoading(false);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setError('Корзина пуста.');
      setLoading(false);
      return;
    }

    if (!authUser || !authUser.id) {
      setError('Ошибка авторизации: не найден ID пользователя.');
      setLoading(false);
      return;
    }

    // Проверяем, что у всех товаров есть ID
    const itemsWithMissingId = cartItems.filter(item => !getProductId(item));
    if (itemsWithMissingId.length > 0) {
      console.error('Товары без ID:', itemsWithMissingId);
      setError(`Найдено ${itemsWithMissingId.length} товаров без ID. Проверьте структуру данных.`);
      setLoading(false);
      return;
    }

    // Подготовка данных
    const orderData = {
      userId: authUser.id,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      payment_method: formData.paymentMethod || 'card',
      total_amount: getTotalPrice().toFixed(2),
      items: cartItems.map(item => ({
        product_id: getProductId(item),
        quantity: item.quantity || 1,
        price: getProductPrice(item)
      }))
    };

    console.log('🛒 Данные заказа:', orderData);

    try {
      const response = await apiService.createOrder(orderData);
      console.log('✅ Ответ сервера:', response);

      if (response && (response.success || response.orderId || response.id)) {
        // Очищаем корзину через контекст
        clearCart();
        // Также удаляем из localStorage (на всякий случай)
        localStorage.removeItem('current_cart');
        localStorage.removeItem('cart');

        // После clearCart() и перед navigate
        try {
          cartItems.forEach(item => {
            const productId = getProductId(item);
            if (productId && authUser?.id) {
              apiService.post('/api/track-action.php', {
                userId: authUser.id,
                productId: productId,
                action: 'purchase'
              }).catch(err => console.error('Error tracking purchase:', err));
            }
          });
        } catch (trackError) {
          console.error('Error in purchase tracking:', trackError);
        }
        
        navigate('/order-success', { 
          state: {
            orderNumber: response.orderNumber || response.order_number || '12345',
            totalAmount: getTotalPrice(),
            paymentMethod: formData.paymentMethod
          }
        });
      } else {
        setError(`Ошибка сервера: ${response?.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('❌ Ошибка оформления:', error);
      setError(`Ошибка оформления заказа: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const debugCheck = () => {
    console.log('🔍 Детальная отладочная информация о корзине (из контекста):');
    console.log('Всего элементов:', cartItems.length);
    console.log('Полный массив:', JSON.parse(JSON.stringify(cartItems)));
    console.log('Общая сумма (getTotalPrice):', getTotalPrice());
  };

  // Показываем загрузку, пока корзина подгружается
  if (cartLoading) {
    return (
      <Container sx={{ py: 8, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container sx={{ py: 8, minHeight: '60vh' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Корзина пуста
          </Typography>
          <Typography>
            Добавьте товары в корзину перед оформлением заказа
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/catalog')}
          sx={{ mt: 2 }}
        >
          Перейти в каталог
        </Button>
      </Container>
    );
  }

  if (!authUser) {
    return (
      <Container sx={{ py: 8, minHeight: '60vh' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Требуется авторизация
          </Typography>
          <Typography>
            Для оформления заказа необходимо войти в систему
          </Typography>
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Войти
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Оформление заказа
      </Typography>

      {/* Кнопка отладки (только в development) */}
      {process.env.NODE_ENV === 'development' && (
        <Button onClick={debugCheck} variant="outlined" sx={{ mb: 3 }}>
          Debug Cart Items
        </Button>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
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
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Ваш заказ
              </Typography>

              <Box sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                {cartItems.map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 1, 
                      pb: 1, 
                      borderBottom: index < cartItems.length - 1 ? '1px solid #eee' : 'none' 
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, mr: 2 }}>
                      {getProductImage(item) ? (
                        <Avatar 
                          src={getProductImage(item)} 
                          alt={getProductName(item)}
                          sx={{ width: 40, height: 40, mr: 1 }}
                        />
                      ) : (
                        <Avatar sx={{ width: 40, height: 40, mr: 1, bgcolor: 'grey.300' }}>
                          <Typography variant="caption">Т</Typography>
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                          {getProductName(item)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Количество: {item.quantity || 1}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
                      {(getProductPrice(item) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Итого:</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {getTotalPrice().toLocaleString('ru-RU')} ₽
                </Typography>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mt: 2
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 2, color: 'white' }} />
                    Оформление...
                  </>
                ) : (
                  `Оформить заказ - ${getTotalPrice().toLocaleString('ru-RU')} ₽`
                )}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default CheckoutPage;