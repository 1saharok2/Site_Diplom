// pages/Cart/CartPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Button,
  Paper,
  Alert,
  Chip
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  ArrowBack,
  Login,
  Store,
  Home,
  LocalShipping,
  AssignmentReturn,
  Security,
  Discount,
  SupportAgent
} from '@mui/icons-material';
import CartItems from '../../components/Cart/CartItems';
import CartSummary from '../../components/Cart/CartSummary';
import { cartService } from '../../services/cartService';
import { useAuth } from '../../context/AuthContext';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      let items = [];
      
      if (isAuthenticated && user) {
        items = await cartService.getCart(user.id);
      } else {
        const localCart = localStorage.getItem('guestCart');
        if (localCart) {
          items = JSON.parse(localCart);
        }
      }
      
      setCartItems(items || []);
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading) {
      fetchCartItems();
    }
  }, [authLoading, fetchCartItems]);

  const handleClearCart = () => {
    setCartItems([]);
    if (isAuthenticated && user) {
      cartService.clearCart(user.id);
    } else {
      localStorage.removeItem('guestCart');
    }
  };

  const handleRefreshCart = () => {
    fetchCartItems();
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (authLoading || loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Box sx={{ textAlign: 'center', color: 'white' }}>
          <CircularProgress 
            size={80} 
            thickness={4} 
            sx={{ 
              color: 'white', 
              mb: 3,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }} 
          />
          <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>
            Загрузка корзины...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ 
              color: 'text.secondary',
              mb: 2,
              borderRadius: 3,
              px: 2,
              py: 1,
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateX(-4px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Назад
          </Button>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            color: 'white',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
          }}>
            <Box sx={{
              width: 60,
              height: 60,
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <ShoppingCart sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h2" sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '2rem', md: '2.8rem' },
                mb: 1
              }}>
                Корзина
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                {cartItems.length > 0 ? `Ваши товары (${getTotalItems()})` : 'Ваши покупки'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {!isAuthenticated && (
          <Alert 
            severity="info"
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              p: 3,
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              border: '2px solid #3b82f6',
              color: '#1e40af',
              '& .MuiAlert-icon': { color: '#1e40af' }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2
            }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  🔐 Войдите в аккаунт
                </Typography>
                <Typography variant="body2">
                  Сохраните корзину и получите доступ к истории заказов
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/login"
                state={{ from: '/cart' }}
                variant="contained"
                size="large"
                startIcon={<Login />}
                sx={{ 
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #3b82f6 0%, #1d4ed8 100%)',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #2563eb 0%, #1e40af 100%)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Войти
              </Button>
            </Box>
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
            <Box sx={{
              position: 'relative',
              width: 200,
              height: 200,
              mx: 'auto',
              mb: 4
            }}>
              <Box sx={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.05)', opacity: 0.8 },
                  '100%': { transform: 'scale(1)', opacity: 1 }
                }
              }}>
                <ShoppingCart sx={{ fontSize: 80, color: 'white' }} />
              </Box>
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a52 100%)',
                color: 'white',
                borderRadius: '50%',
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                0
              </Box>
            </Box>

            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              background: 'linear-gradient(45deg, #2d3748 0%, #4a5568 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Корзина пуста
            </Typography>
            
            <Typography variant="h6" sx={{ 
              color: 'text.secondary', 
              mb: 4, 
              maxWidth: 500,
              mx: 'auto',
              fontWeight: 400
            }}>
              Добавьте товары из нашего каталога, чтобы начать покупки
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              gap: 3, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              mb: 6
            }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/catalog')}
                startIcon={<Store />}
                sx={{ 
                  px: 5,
                  py: 2,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 15px 40px rgba(102, 126, 234, 0.6)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                В каталог
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/')}
                startIcon={<Home />}
                sx={{ 
                  px: 5,
                  py: 2,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-3px)',
                    bgcolor: 'primary.main',
                    color: 'white'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                На главную
              </Button>
            </Box>

            {/* Benefits Section */}
            <Grid container spacing={3} sx={{ maxWidth: 1000, mx: 'auto' }}>
              {[
                {
                  icon: <LocalShipping sx={{ fontSize: 40, color: '#10b981' }} />,
                  title: 'Бесплатная доставка',
                  description: 'При заказе от 5 000 ₽'
                },
                {
                  icon: <AssignmentReturn sx={{ fontSize: 40, color: '#f59e0b' }} />,
                  title: 'Легкий возврат',
                  description: '14 дней на возврат товара'
                },
                {
                  icon: <Security sx={{ fontSize: 40, color: '#ef4444' }} />,
                  title: 'Безопасность',
                  description: 'SSL шифрование данных'
                },
                {
                  icon: <SupportAgent sx={{ fontSize: 40, color: '#8b5cf6' }} />,
                  title: 'Поддержка 24/7',
                  description: 'Всегда готовы помочь'
                }
              ].map((benefit, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    borderRadius: 3,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                    }
                  }}>
                    {benefit.icon}
                    <Typography variant="h6" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
  <Box sx={{ position: 'relative' }}>
    {/* Декоративные элементы */}
    <Box sx={{
      position: 'absolute',
      top: -100,
      right: -100,
      width: 300,
      height: 300,
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
      borderRadius: '50%',
      zIndex: 0,
      filter: 'blur(40px)'
    }} />
    
    <Box sx={{
      position: 'absolute',
      bottom: -50,
      left: -50,
      width: 200,
      height: 200,
      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(238, 90, 82, 0.1) 100%)',
      borderRadius: '50%',
      zIndex: 0,
      filter: 'blur(30px)'
    }} />

    <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
      {/* Колонка с товарами */}
      <Grid item xs={12} lg={8}>
        <Paper sx={{ 
          p: { xs: 3, md: 4 }, 
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #ff6b6b 100%)'
          }
        }}>
          {/* Заголовок секции товаров */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 4,
            p: 3,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: 3,
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                width: 50,
                height: 50,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShoppingCart sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Ваша корзина
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {getTotalItems()} {getTotalItems() === 1 ? 'товар' : 'товаров'} на сумму
                </Typography>
              </Box>
            </Box>
            
            <Chip
              label={`${getTotalItems()} ${getTotalItems() === 1 ? 'товар' : 'товаров'}`}
              sx={{
                background: 'linear-gradient(45deg, #ff6b6b 0%, #ee5a52 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                height: 40,
                px: 2
              }}
            />
          </Box>

          {/* Список товаров */}
          <Box sx={{ 
            background: 'rgba(248, 250, 252, 0.8)',
            borderRadius: 3,
            p: 2,
            mb: 3
          }}>
            <CartItems 
              cartItems={cartItems}
              onCartUpdate={setCartItems}
              onRefreshCart={handleRefreshCart}
            />
          </Box>

          {/* Дополнительная информация */}
          <Box sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            borderRadius: 3,
            border: '1px solid rgba(226, 232, 240, 0.8)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Discount sx={{ color: 'primary.main' }} />
              Специальные предложения
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Добавьте еще 2 000 ₽ к заказу для бесплатной доставки
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* Боковая панель с итогами и информацией */}
      <Grid item xs={12} lg={4}>
        <Box sx={{ position: 'sticky', top: 120 }}>
          {/* Итоги заказа */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
            mb: 3
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
              💰 Итоги заказа
            </Typography>
            <CartSummary 
              cartItems={cartItems}
              onClearCart={handleClearCart}
              onRefreshCart={handleRefreshCart}
            />
          </Paper>

          {/* Преимущества */}
          <Paper sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
              🚀 Почему выбирают нас
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                {
                  icon: <LocalShipping sx={{ color: '#10b981' }} />,
                  title: 'Бесплатная доставка',
                  desc: 'При заказе от 5 000 ₽'
                },
                {
                  icon: <AssignmentReturn sx={{ color: '#f59e0b' }} />,
                  title: 'Возврат 14 дней',
                  desc: 'Без лишних вопросов'
                },
                {
                  icon: <Security sx={{ color: '#ef4444' }} />,
                  title: 'Безопасная оплата',
                  desc: 'SSL шифрование'
                },
                {
                  icon: <SupportAgent sx={{ color: '#8b5cf6' }} />,
                  title: 'Поддержка 24/7',
                  desc: 'Всегда на связи'
                }
              ].map((item, index) => (
                <Box key={index} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(248, 250, 252, 0.8)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(241, 245, 249, 1)',
                    transform: 'translateX(4px)'
                  }
                }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  </Box>
)}
      </Container>
    </Box>
  );
};

export default CartPage;