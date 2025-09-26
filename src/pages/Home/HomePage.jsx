import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  Fab,
  IconButton,
  CardMedia
} from '@mui/material';
import {
  ShoppingBasket,
  LocalShipping,
  Security,
  SupportAgent,
  KeyboardArrowUp,
  Category,
  ChevronLeft,
  ChevronRight,
  PlayArrow,
  Pause
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductsContext';

const HomePage = () => {
  const { addToCart } = useCart();
  const { products, categories, loading, error, refreshData } = useProducts();
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const theme = useTheme();
  const carouselRef = useRef(null);

  // Загрузка товаров для карусели
  useEffect(() => {
    if (products.length > 0) {
      const carouselItems = products
        .filter(product => {
          const hasImages = Array.isArray(product.image_url) && product.image_url.length > 0;
          return product.rating >= 4.0 && hasImages;
        })
        .slice(0, 6);
      
      setCarouselProducts(carouselItems.length > 0 ? carouselItems : products.slice(0, 4));
    }
  }, [products]);

  const getImageUrl = (imageUrl) => {
    if (typeof imageUrl !== 'string') return '/images/placeholder.jpg';
    
    imageUrl = imageUrl.trim();
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') {
      return '/images/placeholder.jpg';
    }
    
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `http://localhost:3001${imageUrl}`;
    
    return `http://localhost:3001/images/${imageUrl}`;
  };

  const getProductImage = (product) => {
    if (!product) return '/images/placeholder.jpg';
    
    if (Array.isArray(product.image_url) && product.image_url.length > 0) {
      const firstImage = product.image_url[0];
      if (typeof firstImage === 'string') {
        return getImageUrl(firstImage);
      }
    }
    
    return '/images/placeholder.jpg';
  };

  const getCategoryImage = (category) => {
    if (!category) return '/images/placeholder.jpg';
    if (category.image_url && typeof category.image_url === 'string') {
      return getImageUrl(category.image_url);
    }
    return '/images/placeholder.jpg';
  };

  const handleAddToCart = (product) => {
    addToCart(product.id, 1);
  };

  // Используем useCallback для стабильной ссылки на функцию
  const handleNextSlide = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const nextSlide = (currentSlide + 1) % carouselProducts.length;
    
    setCurrentSlide(nextSlide);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  }, [isTransitioning, currentSlide, carouselProducts.length]);

  const handlePrevSlide = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const prevSlide = (currentSlide - 1 + carouselProducts.length) % carouselProducts.length;
    
    setCurrentSlide(prevSlide);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Автопрокрутка карусели с использованием useCallback
  useEffect(() => {
    if (!isPlaying || carouselProducts.length === 0 || isTransitioning) return;

    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, carouselProducts.length, isTransitioning, handleNextSlide]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" action={
          <Button color="inherit" onClick={refreshData}>
            Обновить
          </Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      title: 'Бесплатная доставка',
      description: 'При заказе от 3000 рублей'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Гарантия качества',
      description: '14 дней на возврат товара'
    },
    {
      icon: <SupportAgent sx={{ fontSize: 40 }} />,
      title: 'Поддержка 24/7',
      description: 'Всегда готовы помочь'
    },
    {
      icon: <ShoppingBasket sx={{ fontSize: 40 }} />,
      title: 'Широкий ассортимент',
      description: `Более ${products.length} товаров`
    }
  ];

  return (
    <Box sx={{ pt: 0 }}>
      {/* Карусель товаров */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '70vh', md: '90vh' },
          minHeight: { xs: '600px', md: '800px' },
          overflow: 'hidden',
          bgcolor: 'grey.900',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.95)} 100%)`
        }}
      >
        {carouselProducts.length > 0 ? (
          <>
            {/* Контейнер слайдов */}
            <Box
              ref={carouselRef}
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: `translateX(-${currentSlide * 100}%)`,
                display: 'flex'
              }}
            >
              {carouselProducts.map((product, index) => {
                const imageUrl = getProductImage(product);
                
                return (
                  <Box
                    key={product.id}
                    sx={{
                      minWidth: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Container maxWidth="xl" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                      <Grid container spacing={6} alignItems="center" sx={{ height: '100%' }}>
                        <Grid item xs={12} md={6}>
                          <Box 
                            sx={{ 
                              color: 'white',
                              textAlign: { xs: 'center', md: 'left' },
                              opacity: isTransitioning ? 0.7 : 1,
                              transition: 'opacity 0.3s ease'
                            }}
                          >
                            <Chip
                              label="ХИТ ПРОДАЖ"
                              color="secondary"
                              sx={{ 
                                mb: 3, 
                                color: 'white', 
                                fontWeight: 'bold',
                                background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`
                              }}
                            />
                            
                            <Typography
                              variant="h1"
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: '2.5rem', md: '4rem' },
                                lineHeight: 1.1,
                                mb: 3,
                                textShadow: '2px 2px 8px rgba(0,0,0,0.5)'
                              }}
                            >
                              {product.name}
                            </Typography>
                            
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 4,
                                opacity: 0.9,
                                fontWeight: 300,
                                lineHeight: 1.6
                              }}
                            >
                              {product.description?.substring(0, 120) || 'Премиум качество по доступной цене'}...
                            </Typography>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 3, 
                              mb: 4,
                              justifyContent: { xs: 'center', md: 'flex-start' } 
                            }}>
                              <Typography
                                variant="h2"
                                sx={{
                                  color: 'secondary.main',
                                  fontWeight: 'bold',
                                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                                }}
                              >
                                {product.price?.toLocaleString('ru-RU')} ₽
                              </Typography>
                              {product.old_price && (
                                <Typography
                                  variant="h5"
                                  sx={{
                                    color: 'grey.300',
                                    textDecoration: 'line-through'
                                  }}
                                >
                                  {product.old_price?.toLocaleString('ru-RU')} ₽
                                </Typography>
                              )}
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 3, 
                              flexWrap: 'wrap',
                              justifyContent: { xs: 'center', md: 'flex-start' } 
                            }}>
                              <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleAddToCart(product)}
                                startIcon={<ShoppingBasket />}
                                sx={{
                                  px: 5,
                                  py: 1.8,
                                  borderRadius: 3,
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  background: `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 35px rgba(0,0,0,0.4)'
                                  }
                                }}
                              >
                                В корзину
                              </Button>
                              <Button
                                component={Link}
                                to={`/product/${product.id}`}
                                variant="outlined"
                                size="large"
                                sx={{
                                  px: 4,
                                  py: 1.8,
                                  borderRadius: 3,
                                  borderWidth: 2,
                                  borderColor: 'white',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '1.1rem',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                              >
                                Подробнее
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: '100%'
                            }}
                          >
                            <Box
                              component="img"
                              src={imageUrl}
                              alt={product.name}
                              sx={{
                                maxWidth: '100%',
                                maxHeight: { xs: '300px', md: '500px' },
                                borderRadius: 4,
                                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                                objectFit: 'contain',
                                transition: 'transform 0.5s ease',
                                transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                                opacity: isTransitioning ? 0.8 : 1
                              }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Container>
                  </Box>
                );
              })}
            </Box>

            {/* Навигационные кнопки */}
            <IconButton
              onClick={handlePrevSlide}
              disabled={isTransitioning}
              sx={{
                position: 'absolute',
                left: { xs: 10, md: 30 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'grey.800',
                width: { xs: 50, md: 60 },
                height: { xs: 50, md: 60 },
                transition: 'all 0.3s ease',
                '&:hover:not(:disabled)': {
                  bgcolor: 'white',
                  transform: 'translateY(-50%) scale(1.1)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              <ChevronLeft sx={{ fontSize: { xs: 28, md: 32 } }} />
            </IconButton>

            <IconButton
              onClick={handleNextSlide}
              disabled={isTransitioning}
              sx={{
                position: 'absolute',
                right: { xs: 10, md: 30 },
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'grey.800',
                width: { xs: 50, md: 60 },
                height: { xs: 50, md: 60 },
                transition: 'all 0.3s ease',
                '&:hover:not(:disabled)': {
                  bgcolor: 'white',
                  transform: 'translateY(-50%) scale(1.1)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              <ChevronRight sx={{ fontSize: { xs: 28, md: 32 } }} />
            </IconButton>

            {/* Индикаторы слайдов */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 20, md: 40 },
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
                alignItems: 'center'
              }}
            >
              {carouselProducts.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => !isTransitioning && goToSlide(index)}
                  sx={{
                    width: { xs: 12, md: 14 },
                    height: { xs: 12, md: 14 },
                    borderRadius: '50%',
                    bgcolor: index === currentSlide ? 'secondary.main' : 'rgba(255,255,255,0.5)',
                    cursor: isTransitioning ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    transform: index === currentSlide ? 'scale(1.3)' : 'scale(1)',
                    '&:hover:not(:disabled)': {
                      bgcolor: index === currentSlide ? 'secondary.main' : 'rgba(255,255,255,0.7)',
                      transform: index === currentSlide ? 'scale(1.4)' : 'scale(1.2)'
                    }
                  }}
                />
              ))}
            </Box>

            {/* Кнопка автопрокрутки */}
            <IconButton
              onClick={toggleAutoplay}
              sx={{
                position: 'absolute',
                top: { xs: 20, md: 30 },
                right: { xs: 70, md: 100 },
                bgcolor: 'rgba(255,255,255,0.9)',
                color: 'grey.800',
                width: { xs: 45, md: 50 },
                height: { xs: 45, md: 50 },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>

            {/* Счетчик слайдов */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 20, md: 40 },
                right: { xs: 20, md: 30 },
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.3)',
                px: 2,
                py: 1,
                borderRadius: 2,
                fontSize: '0.9rem'
              }}
            >
              {currentSlide + 1} / {carouselProducts.length}
            </Box>
          </>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Container>
              <Typography variant="h1" gutterBottom sx={{ fontWeight: 800 }}>
                Добро пожаловать
              </Typography>
              <Typography variant="h4" sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}>
                Лучшие товары по доступным ценам
              </Typography>
              <Button
                component={Link}
                to="/catalog"
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 1.8,
                  fontSize: '1.1rem',
                  borderRadius: 3,
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: 'grey.100',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Начать покупки
              </Button>
            </Container>
          </Box>
        )}
      </Box>

      {/* Преимущества */}
      <Container sx={{ py: 8 }}>
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 6,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Почему выбирают нас
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    boxShadow: theme.shadows[4]
                  }
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Популярные категории */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container>
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Популярные категории
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Выберите категорию и откройте для себя лучшие товары
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {categories.slice(0, 4).map((category) => {
              const categoryImageUrl = getCategoryImage(category);
              
              return (
                <Grid item xs={12} sm={6} md={3} key={category.id}>
                  <Card
                    component={Link}
                    to={`/catalog?category=${category.slug || category.id}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8]
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={categoryImageUrl}
                      alt={category.name || 'Категория'}
                    />
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Category sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        {category.name || 'Категория'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {category.description || 'Описание категории'}
                      </Typography>
                      <Chip
                        label={`${category.product_count || 0} товаров`}
                        color="primary"
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Кнопка "Наверх" */}
      <Fab
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'primary.main',
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Box>
  );
};

export default HomePage;