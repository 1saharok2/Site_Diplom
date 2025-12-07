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
  MenuItem,
  CircularProgress,
  Avatar
} from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const CheckoutPage = (props) => {
  // Переменные из хуков
  const { items, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated: isAuthHook, currentUser: authUser } = useAuth();
  const navigate = useNavigate();

  const { apiService } = props; 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: authUser?.first_name || authUser?.firstName || '',
    lastName: authUser?.last_name || authUser?.lastName || '',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Россия',
    paymentMethod: 'card'
  });

  const getProductName = (item) => {
    return item?.product_name || 
           item?.products?.name || 
           item?.name || 
           'Товар';
  };

  const getProductPrice = (item) => {
    return item?.price || 
           item?.products?.price || 
           item?.product_price || 
           0;
  };

  const getProductId = (item) => {
    return item?.product_id || 
           item?.id || 
           item?.products?.id || 
           0;
  };

  const getProductImage = (item) => {
    try {
      // Если image_url - это JSON строка
      if (item?.image_url) {
        // Проверяем, это JSON массив или обычная строка
        if (item.image_url.startsWith('[')) {
          const images = JSON.parse(item.image_url);
          if (Array.isArray(images) && images.length > 0) {
            return images[0];
          }
        } else {
          // Это обычная строка с путем
          return item.image_url;
        }
      }
      
      // Проверяем другие возможные поля
      return item?.product_image || 
            item?.products?.image_url || 
            '';
    } catch (e) {
      console.error('Ошибка парсинга image_url:', e);
      return '';
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Включаем загрузку
    setError(''); // Сбрасываем ошибку

    // Используем переменные из useAuth
    if (!isAuthHook) {
        alert('Пожалуйста, авторизуйтесь для оформления заказа.');
        setLoading(false);
        return;
    }

    if (!items || items.length === 0) {
        setError('Корзина пуста.');
        setLoading(false);
        return;
    }

    if (!authUser || !authUser.id) {
        setError('Ошибка авторизации: не найден ID пользователя.');
        setLoading(false);
        return;
    }

    // --- 2. Подготовка ПОЛНЫХ данных для сервера ---
    
    const orderData = {
        userId: authUser.id,
        items: items.map(item => {
            // !!! ГЛАВНОЕ ИСПРАВЛЕНИЕ: Использование вашей безопасной функции !!!
            const product_id = getProductId(item);
            const price = getProductPrice(item);

            // ОТЛАДКА: Проверка, что ID не равен 0
            console.log('🔍 Полный объект товара в корзине:', item); 
            console.log(`🔍 Извлеченный ID: ${product_id}. Цена: ${price}`);
            if (product_id === 0) {
                console.error("⛔️ Ошибка: product_id равен 0. Проверьте структуру данных в CartContext.");
            }
            const pid = getProductId(item)
            return {
                product_id: pid, 
                name: getProductName(item),
                price: price,
                quantity: item.quantity || 1,
                image: getProductImage(item)
            };
        }),
        totalAmount: getTotalPrice(),
        
        // !!! МАРКЕР ИСПРАВЛЕННОГО КОДА !!!
        DEBUG_VERSION: 'FINAL_FIX_V2025_03', 
        
        // !!! ВОССТАНОВЛЕНО ОБЯЗАТЕЛЬНОЕ ПОЛЕ !!!
        shippingAddress: {
           firstName: formData.firstName,
           lastName: formData.lastName,
           email: formData.email,
           phone: formData.phone,
           address: formData.address,
           city: formData.city,
           postalCode: formData.postalCode,
           country: formData.country || 'N/A'
        },
        paymentMethod: formData.paymentMethod || 'card'
    };

    console.log('🟢 Отправка данных заказа:', orderData); 
    
    // --- 3. Отправка заказа через API ---
    try {
        
        const response = await apiService.createOrder(orderData); 

        if (response && response.success) {
            alert(`Заказ #${response.orderNumber || 'создан'} успешно оформлен!`);
            clearCart(); // Очистка корзины
            navigate('/order-success'); // Перенаправление
        } else {
            throw new Error(response?.message || 'Неизвестная ошибка сервера.');
        }

    } catch (error) {
        console.error('Error creating order:', error);
        setError(`❌ Ошибка оформления заказа: ${error.message}`);
    } finally {
        setLoading(false);
    }
};

  // Отладочная функция
  const debugCheck = () => {
    console.log('🔍 Отладочная информация о корзине:');
    console.log('Все элементы корзины:', items);
    
    // Детальная информация о каждом товаре
    items.forEach((item, index) => {
      console.log(`\nТовар ${index + 1}:`);
      console.log('  Полный объект:', item);
      console.log('  ID (getProductId):', getProductId(item)); // Выводим ID через функцию
      console.log('  Имя (getProductName):', getProductName(item));
      console.log('  Цена (getProductPrice):', getProductPrice(item));
      console.log('  quantity:', item.quantity);
      
    });
    
    console.log('\nФорма данных:', formData);
    console.log('Общая сумма:', getTotalPrice());
  };

  // Здесь мы используем authUser (из useAuth), который является фактическим объектом пользователя
  const currentUser = authUser; 

  if (items.length === 0) {
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

  if (!currentUser) {
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
            <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Ваш заказ
              </Typography>

              <Box sx={{ mb: 2, maxHeight: 200, overflow: 'auto' }}>
                {items.map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      mb: 1, 
                      pb: 1, 
                      borderBottom: index < items.length - 1 ? '1px solid #eee' : 'none' 
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