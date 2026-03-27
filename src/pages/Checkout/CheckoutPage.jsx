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
  Avatar,
  Chip,
  useMediaQuery,
  useTheme,
  alpha
} from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { ShoppingCartCheckout, LocalShipping, Lock, CreditCard } from '@mui/icons-material';

const CheckoutPage = () => {
  const { items: cartItems, getTotalPrice, clearCart, loading: cartLoading } = useCart();
  const { isAuthenticated: isAuthHook, currentUser: authUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: { xs: 1, sm: 2, md: 3 }
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2, md: 3 } }}>
        {/* Header */}
        <Paper elevation={0} sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 2, sm: 3, md: 4 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 20px 45px rgba(102, 126, 234, 0.35)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.18) 0%, transparent 55%)'
          }} />

          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Box sx={{
              width: { xs: 44, sm: 56 },
              height: { xs: 44, sm: 56 },
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              flexShrink: 0
            }}>
              <ShoppingCartCheckout sx={{ fontSize: { xs: 22, sm: 28 } }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h2" sx={{
                fontWeight: 800,
                fontSize: { xs: '1.35rem', sm: '1.75rem', md: '2.2rem' },
                lineHeight: 1.15
              }}>
                Оформление заказа
              </Typography>
              <Typography sx={{ opacity: 0.92, mt: 0.5, fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>
                Заполните данные доставки и подтвердите оплату
              </Typography>
            </Box>
            <Chip
              label={`${cartItems.length} ${cartItems.length === 1 ? 'товар' : 'товаров'}`}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                background: 'rgba(255,255,255,0.18)',
                color: 'white',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.25)'
              }}
            />
          </Box>
        </Paper>

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
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="flex-start">
          <Grid item xs={12} lg={8} order={{ xs: 2, lg: 1 }}>
            <Paper elevation={0} sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: { xs: 2, sm: 3, md: 4 },
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(18px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.10),
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #ff6b6b 100%)'
              }} />

              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: { xs: 2, sm: 3 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.10),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main'
                  }}>
                    <LocalShipping />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                      Доставка и контакты
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Поля со звёздочкой обязательны
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  icon={<Lock />}
                  label="Защищённая форма"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.10),
                    color: theme.palette.success.dark,
                    fontWeight: 700,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.18)}`
                  }}
                />
              </Box>

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
                    size={isMobile ? 'small' : 'medium'}
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
                    size={isMobile ? 'small' : 'medium'}
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
                    size={isMobile ? 'small' : 'medium'}
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
                    size={isMobile ? 'small' : 'medium'}
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
                    size={isMobile ? 'small' : 'medium'}
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
                    size={isMobile ? 'small' : 'medium'}
                  >
                    <MenuItem value="card">Банковская карта</MenuItem>
                    <MenuItem value="cash">Наличные при получении</MenuItem>
                    <MenuItem value="sbp">СБП (Система быстрых платежей)</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4} order={{ xs: 1, lg: 2 }}>
            <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>
              <Paper elevation={0} sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: { xs: 2, sm: 3, md: 4 },
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(18px)',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.10),
                boxShadow: '0 14px 40px rgba(0, 0, 0, 0.08)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.secondary.main, 0.10),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'secondary.main'
                    }}>
                      <CreditCard />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
                        Ваш заказ
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Итог и состав корзины
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label="Без предоплаты"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.10),
                      color: theme.palette.info.dark,
                      fontWeight: 700,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.18)}`
                    }}
                  />
                </Box>

                <Box sx={{
                  mb: 2,
                  maxHeight: { xs: 220, sm: 260 },
                  overflow: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': { width: 8 },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.25),
                    borderRadius: 999
                  }
                }}>
                  {cartItems.map((item, index) => (
                    <Box
                      key={`${getProductId(item) ?? index}-${index}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                        py: 1.25,
                        borderBottom: index < cartItems.length - 1 ? `1px dashed ${alpha(theme.palette.primary.main, 0.18)}` : 'none'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
                        <Avatar
                          src={getProductImage(item) || undefined}
                          alt={getProductName(item)}
                          variant="rounded"
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            flexShrink: 0,
                            '& .MuiAvatar-img': { objectFit: 'cover' }
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {getProductName(item)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {`${getProductPrice(item).toLocaleString('ru-RU')} ₽ × ${item.quantity || 1}`}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 84, textAlign: 'right' }}>
                        {(getProductPrice(item) * (item.quantity || 1)).toLocaleString('ru-RU')} ₽
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Итого:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {getTotalPrice().toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>

                <Alert severity="info" icon={<Lock fontSize="inherit" />} sx={{
                  mt: 2,
                  borderRadius: 2,
                  background: alpha(theme.palette.info.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.18)}`
                }}>
                  Оплата и персональные данные защищены.
                </Alert>

                <Button
                  type="submit"
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  fullWidth
                  disabled={loading}
                  startIcon={!loading ? <ShoppingCartCheckout /> : undefined}
                  sx={{
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    fontWeight: 900,
                    mt: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.35)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a67d8 0%, #6b46c1 100%)',
                      transform: loading ? 'none' : 'translateY(-2px)',
                      boxShadow: '0 14px 32px rgba(102, 126, 234, 0.45)'
                    },
                    transition: 'all 0.25s ease'
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={22} sx={{ mr: 1.5, color: 'white' }} />
                      Оформляем заказ…
                    </>
                  ) : (
                    `Подтвердить заказ — ${getTotalPrice().toLocaleString('ru-RU')} ₽`
                  )}
                </Button>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </form>
      </Container>
    </Box>
  );
};

export default CheckoutPage;