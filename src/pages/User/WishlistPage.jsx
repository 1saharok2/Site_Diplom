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
  Badge,
  useMediaQuery
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

  // Медиа-запросы для адаптивности
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        py: 8,
        px: 2
      }}>
        <Container maxWidth="sm">
          <Slide direction="down" in={mounted} timeout={800}>
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Avatar sx={{ 
                width: { xs: 80, sm: 100, md: 120 }, 
                height: { xs: 80, sm: 100, md: 120 }, 
                mx: 'auto', 
                mb: 3,
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)'
              }}>
                <Favorite sx={{ fontSize: { xs: 40, sm: 50, md: 60 } }} />
              </Avatar>
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }
              }}>
                💝 Избранное
              </Typography>
              <Typography variant="h6" sx={{ 
                mb: 4, 
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.25rem' },
                px: { xs: 1, sm: 0 }
              }}>
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
                  px: { xs: 3, sm: 4 },
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
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
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        px: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={isMobile ? 60 : 80} 
            thickness={3}
            sx={{ 
              color: 'primary.main',
              mb: 3
            }} 
          />
          <Typography variant="h5" color="text.secondary" sx={{ 
            fontWeight: 'bold',
            fontSize: { xs: '1.3rem', sm: '1.5rem' }
          }}>
            Загружаем ваши желания...
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ 
            mt: 1,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
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
      <Container maxWidth="xl" sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        {/* Анимированный хедер */}
        <Slide direction="down" in={mounted} timeout={600}>
          <Box sx={{ 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            borderRadius: { xs: 2, sm: 3, md: 4 },
            p: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 2, sm: 3, md: 4 },
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
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
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: { xs: 'center', sm: 'flex-start' },
              mb: 2, 
              position: 'relative',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <IconButton 
                  onClick={() => navigate(-1)}
                  sx={{ 
                    mr: { xs: 0, sm: 2 },
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
                  width: { xs: 50, sm: 60 }, 
                  height: { xs: 50, sm: 60 }, 
                  mr: { xs: 1, sm: 2 },
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                  <Favorite sx={{ fontSize: { xs: 24, sm: 30 } }} />
                </Avatar>
              </Box>
              
              <Box sx={{ 
                textAlign: { xs: 'center', sm: 'left' },
                flex: 1
              }}>
                <Typography variant="h2" component="h1" sx={{ 
                  fontWeight: 'bold', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}>
                  Мое избранное
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}>
                  {wishlist.length} {wishlist.length === 1 ? 'желанный товар' : wishlist.length < 5 ? 'желанных товара' : 'желанных товаров'}
                </Typography>
              </Box>
            </Box>
            
            {wishlist.length > 0 && (
              <Fade in={mounted} timeout={1000}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: 'center', 
                  mt: 2, 
                  flexWrap: 'wrap',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/catalog')}
                    startIcon={<TrendingUp />}
                    sx={{ 
                      borderRadius: 3,
                      borderWidth: 2,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      px: { xs: 2, sm: 3 }
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
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      px: { xs: 2, sm: 3 },
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
            <Box sx={{ 
              textAlign: 'center', 
              py: { xs: 6, sm: 8, md: 12 },
              px: 2
            }}>
              <Avatar sx={{ 
                width: { xs: 100, sm: 120, md: 140 }, 
                height: { xs: 100, sm: 120, md: 140 }, 
                mx: 'auto', 
                mb: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `3px dashed ${alpha(theme.palette.primary.main, 0.3)}`
              }}>
                <HeartBroken sx={{ 
                  fontSize: { xs: 40, sm: 50, md: 60 }, 
                  color: 'text.secondary' 
                }} />
              </Avatar>
              
              <Typography variant="h3" gutterBottom sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                background: 'linear-gradient(135deg, #666 0%, #999 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
              }}>
                Список желаний пуст
              </Typography>
              
              <Typography variant="h6" color="text.secondary" sx={{ 
                mb: 4, 
                maxWidth: 500, 
                mx: 'auto', 
                lineHeight: 1.6,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
              }}>
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
                  px: { xs: 4, sm: 5 },
                  py: 1.5,
                  fontSize: { xs: '1rem', sm: '1.1rem' },
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
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
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
                      onMouseEnter={() => !isMobile && setHoveredCard(product.id)}
                      onMouseLeave={() => !isMobile && setHoveredCard(null)}
                      onClick={() => handleViewProduct(product)}
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: { xs: 2, sm: 3, md: 4 },
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        position: 'relative',
                        transform: !isMobile && hoveredCard === product.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                        boxShadow: !isMobile && hoveredCard === product.id 
                          ? '0 20px 40px rgba(0,0,0,0.12)' 
                          : '0 4px 12px rgba(0,0,0,0.05)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
                          transform: !isMobile && hoveredCard === product.id ? 'scaleX(1)' : 'scaleX(0)',
                          transition: 'transform 0.3s ease',
                        }
                      }}
                    >
                      {/* Бейджи на изображении */}
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height={isMobile ? 200 : 250}
                          image={product?.image_url?.[0] || '/images/placeholder.jpg'}
                          alt={product?.name}
                          sx={{ 
                            objectFit: 'cover',
                            transition: !isMobile ? 'transform 0.4s ease' : 'none',
                            transform: !isMobile && hoveredCard === product.id ? 'scale(1.05)' : 'scale(1)'
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
                          opacity: !isMobile && hoveredCard === product.id ? 1 : 0,
                          transition: 'opacity 0.3s ease'
                        }} />
                        
                        {/* Бейджи */}
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          left: 12, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1 
                        }}>
                          {product?.is_new && (
                            <Chip 
                              icon={<NewReleases sx={{ fontSize: 16 }} />}
                              label="Новинка" 
                              size="small"
                              sx={{ 
                                background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                height: { xs: 24, sm: 28 }
                              }}
                            />
                          )}
                          {product?.discount > 0 && (
                            <Chip 
                              icon={<LocalOffer sx={{ fontSize: 16 }} />}
                              label={`-${product.discount}%`} 
                              size="small"
                              sx={{ 
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                height: { xs: 24, sm: 28 }
                              }}
                            />
                          )}
                        </Box>

                        {/* Кнопки действий */}
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          right: 12, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: 1,
                          opacity: !isMobile ? (hoveredCard === product.id ? 1 : 0.7) : 1,
                          transform: !isMobile ? (hoveredCard === product.id ? 'translateX(0)' : 'translateX(10px)') : 'translateX(0)',
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
                          bottom: 12,
                          left: 12,
                          opacity: !isMobile && hoveredCard === product.id ? 1 : 0,
                          transform: !isMobile && hoveredCard === product.id ? 'translateY(0)' : 'translateY(10px)',
                          transition: 'all 0.3s ease'
                        }}>
                          <Typography variant="h5" sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            fontSize: { xs: '1rem', sm: '1.25rem' }
                          }}>
                            {product?.price?.toLocaleString('ru-RU')} ₽
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        p: { xs: 2, sm: 3 }, 
                        pb: { xs: 1, sm: 2 } 
                      }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom 
                          sx={{ 
                            fontWeight: 'bold',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: { xs: 48, sm: 64 },
                            lineHeight: 1.3,
                            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
                          }}
                        >
                          {product?.name}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mb: 2 
                        }}>
                          <Inventory sx={{ 
                            fontSize: { xs: 16, sm: 18 }, 
                            color: stockColor 
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'bold',
                              color: stockColor,
                              fontSize: { xs: '0.75rem', sm: '0.8rem' }
                            }}
                          >
                            {stockText}
                          </Typography>
                        </Box>

                        {product?.old_price && product.old_price > product?.price && (
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'baseline', 
                              gap: { xs: 1, sm: 2 }, 
                              flexWrap: 'wrap' 
                            }}>
                              <Typography variant="h4" color="primary" sx={{ 
                                fontWeight: 'bold',
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                              }}>
                                {product?.price?.toLocaleString('ru-RU')} ₽
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ 
                                textDecoration: 'line-through',
                                fontSize: { xs: '0.8rem', sm: '0.9rem' }
                              }}>
                                {product.old_price.toLocaleString('ru-RU')} ₽
                              </Typography>
                              <Chip 
                                label={`Экономия ${((product.old_price - product.price) / product.old_price * 100).toFixed(0)}%`}
                                size="small"
                                color="success"
                                sx={{ 
                                  fontWeight: 'bold',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                }}
                              />
                            </Box>
                          </Box>
                        )}

                        {(!product?.old_price || product.old_price <= product?.price) && (
                          <Typography variant="h5" color="primary" sx={{ 
                            fontWeight: 'bold', 
                            mb: 2,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                          }}>
                            {product?.price?.toLocaleString('ru-RU')} ₽
                          </Typography>
                        )}
                      </CardContent>

                      <Divider sx={{ mx: 2 }} />
                      
                      <Box sx={{ 
                        p: 2, 
                        display: 'flex', 
                        gap: 1,
                        flexDirection: { xs: 'column', sm: 'row' }
                      }}>
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
                            borderRadius: 2,
                            py: { xs: 1, sm: 1.2 },
                            background: inStock 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                            fontWeight: 'bold',
                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                            '&:hover': inStock ? {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                            } : {},
                            transition: 'all 0.3s ease',
                            order: { xs: 2, sm: 1 }
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
                              transition: 'all 0.3s ease',
                              order: { xs: 1, sm: 2 },
                              alignSelf: { xs: 'flex-end', sm: 'center' },
                              minWidth: 'auto',
                              width: { xs: 40, sm: 48 },
                              height: { xs: 40, sm: 48 }
                            }}
                          >
                            <Delete sx={{ fontSize: { xs: 20, sm: 24 } }} />
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
                bottom: { xs: 16, sm: 24 },
                right: { xs: 16, sm: 24 },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                '&:hover': {
                  transform: 'scale(1.1)',
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              <Badge 
                badgeContent={cartItemsCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 18, sm: 20 },
                    minWidth: { xs: 18, sm: 20 }
                  }
                }}
              >
                <ShoppingCart sx={{ fontSize: { xs: 24, sm: 28 } }} />
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
          sx={{
            bottom: { xs: 80, sm: 24 }
          }}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={handleCloseSnackbar}
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              alignItems: 'center',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
            iconMapping={{
              success: <Star sx={{ fontSize: { xs: 20, sm: 24 } }} />,
              error: <Favorite sx={{ fontSize: { xs: 20, sm: 24 } }} />,
              warning: <FlashOn sx={{ fontSize: { xs: 20, sm: 24 } }} />
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