// pages/User/WishlistPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Divider,
  Alert,
  Snackbar,
  alpha,
  useTheme,
  Fab,
  Zoom,
  Slide,
  Fade,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Favorite,
  ArrowBack, 
  Delete, 
  LocalOffer,
  NewReleases,
  Inventory,
  Share,
  Visibility,
  ShoppingCart,
  TrendingUp,
  Rocket,
  Star,
  FlashOn,
  HeartBroken
} from '@mui/icons-material';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart, cartItems } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [addingToCart, setAddingToCart] = useState({});
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mounted, setMounted] = useState(false);

  const cartItemsCount = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  useEffect(() => {
    setMounted(true);
    if (currentUser) {
      refreshWishlist();
    }
  }, [currentUser, refreshWishlist]);

  const handleRemoveFromWishlist = async (wishlistItemId, productName) => {
    try {
      await removeFromWishlist(wishlistItemId);
      showSnackbar(`💔 Товар "${productName}" удален из избранного`, 'info');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showSnackbar('❌ Ошибка при удалении из избранного', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    if (!currentUser) {
      showSnackbar('🔐 Пожалуйста, войдите в систему чтобы добавить товар в корзину', 'warning');
      navigate('/login');
      return;
    }

    const inStock = isProductInStock(product);
    if (!inStock) {
      showSnackbar('📦 Этот товар временно отсутствует', 'warning');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }));
      await addToCart(product.id, 1);
      showSnackbar(`🛒 "${product.name}" добавлен в корзину!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showSnackbar('❌ Ошибка при добавлении в корзину', 'error');
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const handleViewProduct = (product) => {
    if (product && product.id) {
      navigate(`/product/${product.id}`);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleShareProduct = async (product, e) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `❤️ Посмотрите этот товар из моего избранного: ${product.name}`,
          url: `${window.location.origin}/product/${product.id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/product/${product.id}`);
      showSnackbar('🔗 Ссылка скопирована в буфер обмена', 'info');
    }
  };

  const handleQuickAddAll = async () => {
    const inStockProducts = wishlist.filter(item => isProductInStock(item.products));
    
    if (inStockProducts.length === 0) {
      showSnackbar('😔 Нет товаров в наличии для добавления в корзину', 'warning');
      return;
    }

    try {
      for (const item of inStockProducts) {
        await addToCart(item.products.id, 1);
      }
      showSnackbar(`🎉 Все ${inStockProducts.length} товаров добавлены в корзину!`, 'success');
    } catch (error) {
      console.error('Error adding all to cart:', error);
      showSnackbar('❌ Ошибка при добавлении товаров', 'error');
    }
  };

  const isProductInStock = (product) => {
    if (!product) return false;
    
    if (product.stock !== undefined && product.stock !== null) {
      return product.stock > 0;
    }
    if (product.quantity !== undefined && product.quantity !== null) {
      return product.quantity > 0;
    }
    if (product.inStock !== undefined && product.inStock !== null) {
      return product.inStock === true || product.inStock === 'true';
    }
    
    return true;
  };

  const getProductStock = (product) => {
    if (!product) return 0;
    
    if (product.stock !== undefined && product.stock !== null) {
      return product.stock;
    }
    if (product.quantity !== undefined && product.quantity !== null) {
      return product.quantity;
    }
    
    return (product.inStock === true || product.inStock === 'true') ? 1 : 0;
  };

  const getStockText = (product) => {
    const inStock = isProductInStock(product);
    const stockQuantity = getProductStock(product);
    
    if (!inStock) return 'Нет в наличии';
    
    if (stockQuantity > 10) return 'Много в наличии';
    if (stockQuantity > 1) return `В наличии (${stockQuantity} шт.)`;
    
    return 'В наличии';
  };

  const getStockColor = (product) => {
    const inStock = isProductInStock(product);
    const stockQuantity = getProductStock(product);
    
    if (!inStock) return theme.palette.error.main;
    if (stockQuantity > 10) return theme.palette.success.main;
    if (stockQuantity > 3) return theme.palette.warning.main;
    
    return theme.palette.info.main;
  };

  if (!currentUser) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8
      }}>
        <Container maxWidth="sm">
          <Slide direction="down" in={mounted} timeout={800}>
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Avatar sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 3,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <Favorite sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                💝 Избранное
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Войдите в систему, чтобы сохранять понравившиеся товары
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                startIcon={<Rocket />}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Войти в аккаунт
              </Button>
            </Box>
          </Slide>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={80} 
            thickness={3}
            sx={{ 
              color: 'primary.main',
              mb: 3
            }} 
          />
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            Загружаем ваши желания...
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Это займет всего секунду
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #ffffff 100%)',
      pb: 8
    }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Анимированный хедер */}
        <Slide direction="down" in={mounted} timeout={600}>
          <Box sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            borderRadius: 4,
            p: 4,
            mb: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
            }
          }}>
            <Box sx={{ 
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              borderRadius: '50%'
            }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, position: 'relative' }}>
              <IconButton 
                onClick={() => navigate(-1)}
                sx={{ 
                  mr: 2,
                  background: 'rgba(255,255,255,0.9)',
                  '&:hover': { 
                    background: 'white',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ArrowBack />
              </IconButton>
              
              <Avatar sx={{ 
                width: 60, 
                height: 60, 
                mr: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}>
                <Favorite sx={{ fontSize: 30 }} />
              </Avatar>
              
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h2" component="h1" sx={{ 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  Мое избранное
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {wishlist.length} {wishlist.length === 1 ? 'желанный товар' : wishlist.length < 5 ? 'желанных товара' : 'желанных товаров'}
                </Typography>
              </Box>
            </Box>
            
            {wishlist.length > 0 && (
              <Fade in={mounted} timeout={1000}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/catalog')}
                    startIcon={<TrendingUp />}
                    sx={{ 
                      borderRadius: 3,
                      borderWidth: 2,
                      fontWeight: 'bold'
                    }}
                  >
                    Найти больше товаров
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleQuickAddAll}
                    startIcon={<FlashOn />}
                    sx={{ 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 176, 155, 0.3)'
                      }
                    }}
                  >
                    Добавить все в корзину
                  </Button>
                </Box>
              </Fade>
            )}
          </Box>
        </Slide>

        {/* Пустой список */}
        {wishlist.length === 0 ? (
          <Zoom in={mounted} timeout={800}>
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <Avatar sx={{ 
                width: 140, 
                height: 140, 
                mx: 'auto', 
                mb: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `3px dashed ${alpha(theme.palette.primary.main, 0.3)}`
              }}>
                <HeartBroken sx={{ fontSize: 60, color: 'text.secondary' }} />
              </Avatar>
              
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                background: 'linear-gradient(135deg, #666 0%, #999 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent'
              }}>
                Список желаний пуст
              </Typography>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}>
                Ваше избранное пока пусто. Находите интересные товары и добавляйте их сюда, чтобы не потерять!
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/catalog')}
                startIcon={<Rocket />}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 3,
                  px: 5,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Начать покупки
              </Button>
            </Box>
          </Zoom>
        ) : (
          <Grid container spacing={3}>
            {wishlist.map((item, index) => {
              const product = item.products;
              const isAdding = addingToCart[product?.id];
              const inStock = isProductInStock(product);
              const stockText = getStockText(product);
              const stockColor = getStockColor(product);
              
              return (
                <Grid item xs={12} sm={6} lg={4} key={item.id}>
                  <Slide direction="up" in={mounted} timeout={400 + index * 100}>
                    <Card 
                      onMouseEnter={() => setHoveredCard(product.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => handleViewProduct(product)}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 4,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        position: 'relative',
                        transform: hoveredCard === product.id ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',
                        boxShadow: hoveredCard === product.id 
                          ? '0 25px 50px rgba(0,0,0,0.15)' 
                          : '0 8px 25px rgba(0,0,0,0.08)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                          transform: hoveredCard === product.id ? 'scaleX(1)' : 'scaleX(0)',
                          transition: 'transform 0.3s ease',
                        }
                      }}
                    >
                      {/* Бейджи на изображении */}
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="300"
                          image={product?.image_url?.[0] || '/images/placeholder.jpg'}
                          alt={product?.name}
                          sx={{ 
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                            transform: hoveredCard === product.id ? 'scale(1.1)' : 'scale(1)'
                          }}
                        />
                        
                        {/* Градиентный оверлей */}
                        <Box sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '60%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                          opacity: hoveredCard === product.id ? 1 : 0,
                          transition: 'opacity 0.3s ease'
                        }} />
                        
                        {/* Бейджи */}
                        <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {product?.is_new && (
                            <Chip 
                              icon={<NewReleases />}
                              label="Новинка" 
                              size="small"
                              sx={{ 
                                background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(0, 176, 155, 0.3)'
                              }}
                            />
                          )}
                          {product?.discount > 0 && (
                            <Chip 
                              icon={<LocalOffer />}
                              label={`-${product.discount}%`} 
                              size="small"
                              sx={{ 
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
                              }}
                            />
                          )}
                        </Box>

                        {/* Кнопки действий */}
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 16, 
                          right: 16, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1,
                          opacity: hoveredCard === product.id ? 1 : 0.7,
                          transform: hoveredCard === product.id ? 'translateX(0)' : 'translateX(10px)',
                          transition: 'all 0.3s ease'
                        }}>
                          <Tooltip title="Поделиться">
                            <IconButton
                              size="small"
                              onClick={(e) => handleShareProduct(product, e)}
                              sx={{ 
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': { 
                                  background: 'white',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Share fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Быстрый просмотр">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProduct(product);
                              }}
                              sx={{ 
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': { 
                                  background: 'white',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        {/* Цена на изображении */}
                        <Box sx={{ 
                          position: 'absolute',
                          bottom: 16,
                          left: 16,
                          opacity: hoveredCard === product.id ? 1 : 0,
                          transform: hoveredCard === product.id ? 'translateY(0)' : 'translateY(10px)',
                          transition: 'all 0.3s ease'
                        }}>
                          <Typography variant="h5" sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                          }}>
                            {product?.price?.toLocaleString('ru-RU')} ₽
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1, p: 3, pb: 2 }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            fontWeight: 'bold',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 64,
                            lineHeight: 1.3
                          }}
                        >
                          {product?.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Inventory sx={{ fontSize: 18, color: stockColor }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: stockColor
                            }}
                          >
                            {stockText}
                          </Typography>
                        </Box>

                        {product?.old_price && product.old_price > product?.price && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, flexWrap: 'wrap' }}>
                              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                {product?.price?.toLocaleString('ru-RU')} ₽
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                {product.old_price.toLocaleString('ru-RU')} ₽
                              </Typography>
                              <Chip 
                                label={`Экономия ${((product.old_price - product.price) / product.old_price * 100).toFixed(0)}%`}
                                size="small"
                                color="success"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>
                          </Box>
                        )}

                        {(!product?.old_price || product.old_price <= product?.price) && (
                          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
                            {product?.price?.toLocaleString('ru-RU')} ₽
                          </Typography>
                        )}
                      </CardContent>

                      <Divider sx={{ mx: 2 }} />
                      
                      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={isAdding ? <CircularProgress size={16} color="inherit" /> : <ShoppingCart />}
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={isAdding || !inStock}
                          sx={{ 
                            borderRadius: 3,
                            py: 1.2,
                            background: inStock 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            '&:hover': inStock ? {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                            } : {},
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isAdding ? 'Добавление...' : inStock ? 'В корзину' : 'Нет в наличии'}
                        </Button>
                        
                        <Tooltip title="Удалить из избранного">
                          <IconButton
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWishlist(item.id, product?.name);
                            }}
                            sx={{
                              borderRadius: 2,
                              background: 'rgba(244, 67, 54, 0.1)',
                              '&:hover': {
                                background: 'rgba(244, 67, 54, 0.2)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  </Slide>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Плавающая кнопка корзины */}
        {wishlist.length > 0 && (
          <Zoom in={mounted} timeout={1000}>
            <Fab
              color="primary"
              aria-label="cart"
              onClick={() => navigate('/cart')}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              <Badge badgeContent={cartItemsCount} color="error">
                <ShoppingCart />
              </Badge>
            </Fab>
          </Zoom>
        )}

        {/* Уведомления */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={handleCloseSnackbar}
            sx={{ 
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              alignItems: 'center'
            }}
            iconMapping={{
              success: <Star sx={{ fontSize: 24 }} />,
              error: <Favorite sx={{ fontSize: 24 }} />,
              warning: <FlashOn sx={{ fontSize: 24 }} />
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {snackbar.message}
            </Typography>
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default WishlistPage;