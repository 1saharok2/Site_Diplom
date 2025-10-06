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
  CardMedia,
  useMediaQuery
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
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

  const handleNextSlide = useCallback(() => {
    if (isTransitioning || carouselProducts.length === 0) return;
    
    setIsTransitioning(true);
    const nextSlide = (currentSlide + 1) % carouselProducts.length;
    
    setCurrentSlide(nextSlide);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [isTransitioning, currentSlide, carouselProducts.length]);

  const handlePrevSlide = () => {
    if (isTransitioning || carouselProducts.length === 0) return;
    
    setIsTransitioning(true);
    const prevSlide = (currentSlide - 1 + carouselProducts.length) % carouselProducts.length;
    
    setCurrentSlide(prevSlide);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide || carouselProducts.length === 0) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Автопрокрутка карусели
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
      icon: <LocalShipping sx={{ fontSize: { xs: 32, md: 40 } }} />,
      title: 'Бесплатная доставка',
      description: 'При заказе от 3000 рублей'
    },
    {
      icon: <Security sx={{ fontSize: { xs: 32, md: 40 } }} />,
      title: 'Гарантия качества',
      description: '14 дней на возврат товара'
    },
    {
      icon: <SupportAgent sx={{ fontSize: { xs: 32, md: 40 } }} />,
      title: 'Поддержка 24/7',
      description: 'Всегда готовы помочь'
    },
    {
      icon: <ShoppingBasket sx={{ fontSize: { xs: 32, md: 40 } }} />,
      title: 'Широкий ассортимент',
      description: `Более ${products.length} товаров`
    }
  ];

  return (
    <Box sx={{ pt: 0, overflow: 'hidden' }}>
      {/* Карусель товаров - ИСПРАВЛЕННАЯ */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 'auto', md: '80vh' },
          minHeight: { xs: '500px', md: '600px' },
          overflow: 'hidden',
          bgcolor: 'grey.900',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.95)} 100%)`
        }}
      >
        {carouselProducts.length > 0 ? (
          <>
            {/* Контейнер слайдов - ИСПРАВЛЕННЫЙ */}
            <Box
              sx={{
                display: 'flex',
                width: `${carouselProducts.length * 100}%`,
                height: '100%',
                transform: `translateX(-${(currentSlide * 100) / carouselProducts.length}%)`,
                transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
                willChange: 'transform'
              }}
            >
              {carouselProducts.map((product, index) => {
                const imageUrl = getProductImage(product);
                
                return (
                  <Box
                    key={product.id}
                    sx={{
                      width: `${100 / carouselProducts.length}%`,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Container 
                      maxWidth="lg" 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        py: { xs: 2, md: 0 }
                      }}
                    >
                      <Grid 
                        container 
                        spacing={3}
                        alignItems="center"
                        sx={{ 
                          height: '100%',
                          flexDirection: { xs: 'column-reverse', md: 'row' }
                        }}
                      >
                        {/* Текстовая часть */}
                        <Grid item xs={12} md={6}>
                          <Box 
                            sx={{ 
                              color: 'white',
                              textAlign: { xs: 'center', md: 'left' },
                              px: { xs: 1, md: 0 }
                            }}
                          >
                            <Chip
                              label="ХИТ ПРОДАЖ"
                              color="secondary"
                              sx={{ 
                                mb: 3,
                                fontWeight: 'bold',
                                fontSize: { xs: '0.7rem', md: '0.8rem' }
                              }}
                            />
                            
                            <Typography
                              variant="h2"
                              sx={{
                                fontWeight: 700,
                                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                                lineHeight: 1.2,
                                mb: 2
                              }}
                            >
                              {product.name}
                            </Typography>
                            
                            <Typography
                              variant="body1"
                              sx={{
                                mb: 3,
                                opacity: 0.9,
                                lineHeight: 1.6,
                                fontSize: { xs: '0.9rem', md: '1rem' },
                                display: { xs: 'none', sm: 'block' }
                              }}
                            >
                              {product.description?.substring(0, 120) || 'Премиум качество по доступной цене'}...
                            </Typography>
                            
                            {/* Цена */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              mb: 3,
                              justifyContent: { xs: 'center', md: 'flex-start' }
                            }}>
                              <Typography
                                variant="h3"
                                sx={{
                                  color: 'secondary.main',
                                  fontWeight: 'bold',
                                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                                }}
                              >
                                {product.price?.toLocaleString('ru-RU')} ₽
                              </Typography>
                              {product.old_price && (
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: 'grey.300',
                                    textDecoration: 'line-through',
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                  }}
                                >
                                  {product.old_price?.toLocaleString('ru-RU')} ₽
                                </Typography>
                              )}
                            </Box>
                            
                            {/* Кнопки */}
                            <Box sx={{ 
                              display: 'flex', 
                              gap: 2,
                              flexWrap: 'wrap',
                              justifyContent: { xs: 'center', md: 'flex-start' } 
                            }}>
                              <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleAddToCart(product)}
                                startIcon={<ShoppingBasket />}
                                sx={{
                                  px: 4,
                                  py: 1.5,
                                  borderRadius: 2,
                                  fontWeight: 600,
                                  minWidth: '140px'
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
                                  py: 1.5,
                                  borderRadius: 2,
                                  borderWidth: 2,
                                  borderColor: 'white',
                                  color: 'white',
                                  fontWeight: 600,
                                  minWidth: '140px',
                                  '&:hover': {
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)'
                                  }
                                }}
                              >
                                Подробнее
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                        
                        {/* Изображение */}
                        <Grid item xs={12} md={6}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              height: { xs: '250px', sm: '350px', md: '100%' }
                            }}
                          >
                            <Box
                              component="img"
                              src={imageUrl}
                              alt={product.name}
                              sx={{
                                maxWidth: '100%',
                                maxHeight: { xs: '200px', sm: '300px', md: '400px' },
                                height: 'auto',
                                borderRadius: 2,
                                objectFit: 'contain'
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
            {carouselProducts.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevSlide}
                  disabled={isTransitioning}
                  sx={{
                    position: 'absolute',
                    left: { xs: 10, md: 20 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: 'grey.800',
                    width: { xs: 40, md: 50 },
                    height: { xs: 40, md: 50 },
                    '&:hover': {
                      bgcolor: 'white'
                    },
                    display: { xs: 'none', md: 'flex' }
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <IconButton
                  onClick={handleNextSlide}
                  disabled={isTransitioning}
                  sx={{
                    position: 'absolute',
                    right: { xs: 10, md: 20 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: 'grey.800',
                    width: { xs: 40, md: 50 },
                    height: { xs: 40, md: 50 },
                    '&:hover': {
                      bgcolor: 'white'
                    },
                    display: { xs: 'none', md: 'flex' }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}

            {/* Индикаторы слайдов */}
            {carouselProducts.length > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 1
                }}
              >
                {carouselProducts.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => goToSlide(index)}
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: index === currentSlide ? 'secondary.main' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: index === currentSlide ? 'secondary.main' : 'rgba(255,255,255,0.7)'
                      }
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Управление автопрокруткой */}
            {carouselProducts.length > 1 && (
              <IconButton
                onClick={toggleAutoplay}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'grey.800',
                  '&:hover': {
                    bgcolor: 'white'
                  }
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            )}
          </>
        ) : (
          /* Заглушка если нет товаров для карусели */
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
              <Typography 
                variant="h2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Добро пожаловать
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9 
                }}
              >
                Лучшие товары по доступным ценам
              </Typography>
              <Button
                component={Link}
                to="/catalog"
                variant="contained"
                size="large"
                sx={{
                  px: 6,
                  py: 1.5,
                  fontSize: '1.1rem',
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                Начать покупки
              </Button>
            </Container>
          </Box>
        )}
      </Box>

      {/* Преимущества - ВЫРОВНЕННЫЕ */}
      <Container 
        sx={{ 
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 3, md: 4 } // Добавил горизонтальные отступы
        }}
      >
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Почему выбирают нас
        </Typography>

        <Grid 
          container 
          spacing={3}
          justifyContent="center" // Центрируем элементы
        >
          {features.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3} 
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  maxWidth: 280, // Фиксируем максимальную ширину
                  width: '100%',
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 2
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 600
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Популярные категории - ВЫРОВНЕННЫЕ */}
      <Box 
        sx={{ 
          py: { xs: 6, md: 8 }, 
          backgroundColor: 'grey.50',
          px: { xs: 0, sm: 0 } // Убираем горизонтальные отступы у контейнера
        }}
      >
        <Container>
          <Box 
            textAlign="center" 
            mb={6}
            sx={{ px: { xs: 2, sm: 3 } }} // Добавляем отступы только для текста
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Популярные категории
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
            >
              Выберите категорию и откройте для себя лучшие товары
            </Typography>
          </Box>

          <Grid 
            container 
            spacing={3}
            justifyContent="center" // Центрируем карточки
            sx={{ px: { xs: 2, sm: 3 } }} // Добавляем отступы для сетки
          >
            {categories.slice(0, 4).map((category) => {
              const categoryImageUrl = getCategoryImage(category);
              
              return (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={3} 
                  key={category.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Card
                    component={Link}
                    to={`/catalog?category=${category.slug || category.id}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      width: '100%',
                      maxWidth: 280, // Фиксируем максимальную ширину
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={categoryImageUrl}
                      alt={category.name || 'Категория'}
                      sx={{
                        objectFit: 'cover'
                      }}
                    />
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Category 
                        sx={{ 
                          fontSize: 32, 
                          color: 'primary.main', 
                          mb: 1 
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {category.name || 'Категория'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          minHeight: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {category.description || 'Описание категории'}
                      </Typography>
                      <Chip
                        label={`${category.product_count || 0} товаров`}
                        color="primary"
                        variant="outlined"
                        size="small"
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
        size="medium"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': {
            bgcolor: 'primary.dark'
          }
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Box>
  );
};

export default HomePage;