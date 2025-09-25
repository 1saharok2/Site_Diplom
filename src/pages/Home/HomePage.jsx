import React, { useState, useEffect, useRef } from 'react';
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
  // featuredProducts удален, так как не используется
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  // imageErrors удален, так как не используется
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const carouselRef = useRef(null);

  // Автопрокрутка карусели
  useEffect(() => {
    if (!isPlaying || carouselProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselProducts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, carouselProducts.length]);

  // Загрузка товаров для карусели
  useEffect(() => {
    if (products.length > 0) {
      // Для карусели берем товары с высоким рейтингом и с изображениями
      const carouselItems = products
        .filter(product => {
          const hasImages = Array.isArray(product.image_url) && product.image_url.length > 0;
          return product.rating >= 4.0 && hasImages;
        })
        .slice(0, 6);
      
      setCarouselProducts(carouselItems.length > 0 ? carouselItems : products.slice(0, 4));
    }
  }, [products]);

  // Функция для проверки и обработки изображений
  const getImageUrl = (imageUrl, type = 'product') => {
    // Проверяем, что imageUrl - строка
    if (typeof imageUrl !== 'string') {
      return getPlaceholderImage(type);
    }
    
    // Убираем лишние пробелы
    imageUrl = imageUrl.trim();
    
    // Проверяем пустые значения
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined' || imageUrl === '') {
      return getPlaceholderImage(type);
    }
    
    // Проверяем корректность URL
    try {
      // Если URL относительный, добавляем базовый путь
      if (imageUrl.startsWith('/')) {
        return `http://localhost:3001${imageUrl}`; // Замените на ваш базовый URL
      }
      
      // Если URL абсолютный, используем как есть
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Если это просто имя файла, добавляем базовый путь
      return `http://localhost:3001/images/${imageUrl}`;
    } catch (error) {
      console.error('Ошибка обработки URL:', imageUrl, error);
      return getPlaceholderImage(type);
    }
  };

  const getPlaceholderImage = (type) => {
    const placeholders = {
      product: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      category: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      default: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    };
    
    return placeholders[type] || placeholders.default;
  };

  // Безопасное получение изображения товара из массива image_url
  const getProductImage = (product) => {
    if (!product) return getPlaceholderImage('product');
    
    // Проверяем массив image_url (основное поле из базы)
    if (Array.isArray(product.image_url) && product.image_url.length > 0) {
      const firstImage = product.image_url[0];
      if (typeof firstImage === 'string' && firstImage.trim()) {
        const url = getImageUrl(firstImage, 'product');
        if (url !== getPlaceholderImage('product')) {
          return url;
        }
      }
    }
    
    // Пробуем другие возможные поля с изображениями (для обратной совместимости)
    const possibleImageFields = [
      product.images?.[0],
      product.image,
      product.thumbnail,
      product.picture
    ];
    
    for (const imageField of possibleImageFields) {
      if (typeof imageField === 'string' && imageField.trim()) {
        const url = getImageUrl(imageField, 'product');
        if (url !== getPlaceholderImage('product')) {
          return url;
        }
      }
    }
    
    return getPlaceholderImage('product');
  };

  // Безопасное получение изображения категории
  const getCategoryImage = (category) => {
    if (!category) return getPlaceholderImage('category');
    
    const possibleImageFields = [
      category.image_url,
      category.image,
      category.thumbnail,
      category.picture
    ];
    
    for (const imageField of possibleImageFields) {
      if (typeof imageField === 'string' && imageField.trim()) {
        const url = getImageUrl(imageField, 'category');
        if (url !== getPlaceholderImage('category')) {
          return url;
        }
      }
    }
    
    return getPlaceholderImage('category');
  };

  const handleImageError = (e, imageId, type = 'product') => {
    console.log(`Ошибка загрузки изображения: ${imageId}`);
    e.target.src = getPlaceholderImage(type);
  };

  const handleAddToCart = (product) => {
    addToCart(product.id, 1);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselProducts.length) % carouselProducts.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Функция для отладки - посмотреть структуру данных товаров
  useEffect(() => {
    if (products.length > 0) {
      console.log('Структура данных товаров:', products[0]);
      console.log('Image_url поле:', products[0].image_url);
      console.log('Тип image_url:', typeof products[0].image_url);
      console.log('Является ли массивом:', Array.isArray(products[0].image_url));
    }
  }, [products]);

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
          height: isMobile ? '60vh' : '80vh',
          overflow: 'hidden',
          bgcolor: 'grey.900'
        }}
      >
        {carouselProducts.length > 0 ? (
          <>
            {/* Слайды */}
            <Box
              ref={carouselRef}
              sx={{
                display: 'flex',
                height: '100%',
                transition: 'transform 0.5s ease-in-out',
                transform: `translateX(-${currentSlide * 100}%)`
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
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`
                    }}
                  >
                    <Container maxWidth="lg">
                      <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                          <Box sx={{ color: 'white', zIndex: 2, position: 'relative' }}>
                            <Chip
                              label="Хит продаж"
                              color="secondary"
                              sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}
                            />
                            <Typography
                              variant="h2"
                              sx={{
                                fontWeight: 800,
                                fontSize: { xs: '2rem', md: '3rem' },
                                lineHeight: 1.2,
                                mb: 2
                              }}
                            >
                              {product.name || 'Название товара'}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                mb: 3,
                                opacity: 0.9,
                                fontWeight: 300
                              }}
                            >
                              {product.description?.substring(0, 150) || 'Отличный товар по выгодной цене'}...
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                              <Typography
                                variant="h4"
                                sx={{
                                  color: 'secondary.main',
                                  fontWeight: 'bold'
                                }}
                              >
                                {product.price?.toLocaleString('ru-RU') || '0'} ₽
                              </Typography>
                              {product.old_price && (
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: 'grey.400',
                                    textDecoration: 'line-through'
                                  }}
                                >
                                  {product.old_price?.toLocaleString('ru-RU')} ₽
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleAddToCart(product)}
                                startIcon={<ShoppingBasket />}
                                sx={{
                                  px: 4,
                                  py: 1.5,
                                  borderRadius: 2,
                                  fontWeight: 600
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
                                  borderColor: 'white',
                                  color: 'white',
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
                              alt={product.name || 'Товар'}
                              onError={(e) => handleImageError(e, product.id, 'product')}
                              sx={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                borderRadius: 4,
                                boxShadow: theme.shadows[10],
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
            <IconButton
              onClick={prevSlide}
              sx={{
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={nextSlide}
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              <ChevronRight />
            </IconButton>

            {/* Индикаторы слайдов */}
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
                    width: 12,
                    height: 12,
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

            {/* Кнопка автопрокрутки */}
            <IconButton
              onClick={toggleAutoplay}
              sx={{
                position: 'absolute',
                top: 20,
                right: 20,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white'
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="h2" align="center" gutterBottom>
                Добро пожаловать в наш магазин
              </Typography>
              <Typography variant="h6" align="center" sx={{ mb: 4, opacity: 0.9 }}>
                Лучшие товары по доступным ценам
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={Link}
                  to="/catalog"
                  variant="contained"
                  size="large"
                  sx={{
                    px: 6,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  Перейти к покупкам
                </Button>
              </Box>
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
                      onError={(e) => handleImageError(e, category.id, 'category')}
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