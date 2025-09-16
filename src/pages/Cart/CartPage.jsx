import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  TextField,
  Chip,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingCart,
  LocalShipping,
  Security,
  Replay,
  ArrowBack
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const theme = useTheme();
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  const cartItems = items || [];
  const totalPrice = getTotalPrice ? getTotalPrice() : 0;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ mb: 4 }}>
          <ShoppingCart sx={{ 
            fontSize: 120, 
            color: alpha(theme.palette.primary.main, 0.2),
            mb: 3
          }} />
          <Typography variant="h3" gutterBottom sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Корзина пуста
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
            Добавьте товары в корзину, чтобы сделать заказ
          </Typography>
          <Button
            component={Link}
            to="/catalog"
            variant="contained"
            size="large"
            startIcon={<ArrowBack />}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
              },
              transition: 'all 0.3s ease'
            }}
          >
            Вернуться в каталог
          </Button>
        </Box>
      </Container>
    );
  }

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Заголовок */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h2" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          🛒 Корзина покупок
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {totalItems} товар{totalItems % 10 === 1 ? '' : 'а'} на сумму {totalPrice.toLocaleString()} ₽
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Список товаров */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Товары в корзине
            </Typography>

            {cartItems.map((item) => (
              <Card 
                key={item.id} 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.1)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container alignItems="center" spacing={3}>
                    {/* Изображение */}
                    <Grid item xs={12} sm={3}>
                      <Box
                        component="img"
                        src={item.products?.image_url?.[0] || '/placeholder-product.jpg'}
                        alt={item.products?.name}
                        sx={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 2,
                          boxShadow: theme.shadows[2]
                        }}
                        onError={(e) => {
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </Grid>

                    {/* Информация о товаре */}
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                        {item.products?.name || 'Неизвестный товар'}
                      </Typography>
                      <Chip
                        label={item.products?.category_slug || 'Без категории'}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Артикул: #{item.products?.id}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 1 }}>
                        {item.products?.price?.toLocaleString() || 0} ₽
                      </Typography>
                    </Grid>

                    {/* Количество */}
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 1 
                      }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.main,
                              color: 'white'
                            }
                          }}
                        >
                          <Remove />
                        </IconButton>
                        <TextField
                          value={item.quantity}
                          size="small"
                          sx={{ 
                            width: 70,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontWeight: 600
                            }
                          }}
                          inputProps={{ 
                            style: { textAlign: 'center' },
                            min: 1 
                          }}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          sx={{
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.main,
                              color: 'white'
                            }
                          }}
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </Grid>

                    {/* Сумма и удаление */}
                    <Grid item xs={12} sm={2}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          color: theme.palette.primary.main,
                          mb: 1
                        }}>
                          {((item.products?.price || 0) * item.quantity).toLocaleString()} ₽
                        </Typography>
                        <IconButton
                          onClick={() => removeFromCart(item.id)}
                          sx={{
                            color: theme.palette.error.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1)
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Боковая панель с итогами */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Paper elevation={3} sx={{ 
              p: 4, 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 700,
                textAlign: 'center',
                mb: 3
              }}>
                💰 Итоги заказа
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Детали стоимости */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2,
                  p: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderRadius: 2
                }}>
                  <Typography variant="body1">
                    Товары ({totalItems})
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {totalPrice.toLocaleString()} ₽
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 2,
                  p: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping fontSize="small" />
                    <Typography variant="body1">Доставка</Typography>
                  </Box>
                  <Chip label="Бесплатно" color="success" size="small" />
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Общая сумма */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4,
                p: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                borderRadius: 2
              }}>
                <Typography variant="h6" fontWeight={700}>
                  Общая сумма
                </Typography>
                <Typography variant="h5" fontWeight={800} color="primary">
                  {totalPrice.toLocaleString()} ₽
                </Typography>
              </Box>

              {/* Кнопки действий */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  🚀 Оформить заказ
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearCart}
                  startIcon={<Replay />}
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main
                    }
                  }}
                >
                  Очистить корзину
                </Button>

                <Button
                  component={Link}
                  to="/catalog"
                  variant="text"
                  startIcon={<ArrowBack />}
                  sx={{
                    borderRadius: 3,
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  Продолжить покупки
                </Button>
              </Box>

              {/* Гарантии */}
              <Box sx={{ 
                mt: 4, 
                p: 2, 
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Security fontSize="small" color="success" />
                  <Typography variant="body2" fontWeight={600}>
                    Гарантии и безопасность
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Бесплатная доставка • 14 дней на возврат • Защита покупателя
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;