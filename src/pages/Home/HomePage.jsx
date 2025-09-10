import React, { useState, useEffect } from 'react';
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
  Zoom,
  useScrollTrigger,
  Fade,
  Slide,
  Grow
} from '@mui/material';
import {
  ShoppingBasket,
  LocalShipping,
  Security,
  SupportAgent,
  Star,
  Favorite,
  KeyboardArrowDown,
  Category
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductsContext';

// Анимированный компонент для плавного появления
const AnimatedBox = ({ children, delay = 0, ...props }) => (
  <Fade in timeout={800} style={{ transitionDelay: `${delay}ms` }} {...props}>
    <Box>{children}</Box>
  </Fade>
);

const ScrollTopButton = () => {
  const trigger = useScrollTrigger({
    threshold: 100,
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={trigger}>
      <Fab
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.dark'
          }
        }}
        aria-label="scroll back to top"
      >
        <KeyboardArrowDown sx={{ transform: 'rotate(180deg)' }} />
      </Fab>
    </Zoom>
  );
};

const HomePage = () => {
  const { addToCart } = useCart();
  const { products, categories, loading, error, refreshData } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (products.length > 0) {
      const featured = products
        .filter(product => product.rating >= 4.0)
        .slice(0, 4);
      setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 8));
    }
  }, [products]);

  const scrollToCategories = () => {
    setIsScrolling(true);
    
    // Даем время на рендеринг перед скроллом
    setTimeout(() => {
      const categoriesSection = document.getElementById('categories-section');
      if (categoriesSection) {
        const headerOffset = 100;
        const elementPosition = categoriesSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      setIsScrolling(false);
    }, 100);
  };

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

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity: 1
    });
  };

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
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ pt: 0 }}>
      {error && (
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" onClick={refreshData}>
              Обновить
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <AnimatedBox>
                  <Chip
                    label="Новая коллекция"
                    sx={{ 
                      mb: 3, 
                      fontSize: '14px', 
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }}
                  />
                </AnimatedBox>
                
                <AnimatedBox delay={200}>
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      fontWeight: 800,
                      lineHeight: 1.2,
                      mb: 3,
                      background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Техника будущего
                    <br />
                    уже сегодня
                  </Typography>
                </AnimatedBox>

                <AnimatedBox delay={400}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 4,
                      opacity: 0.9,
                      fontWeight: 300,
                      fontSize: { xs: '1.1rem', md: '1.3rem' }
                    }}
                  >
                    Откройте для себя новейшие гаджеты и устройства 
                    по лучшим ценам с гарантией качества
                  </Typography>
                </AnimatedBox>

                <AnimatedBox delay={600}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<KeyboardArrowDown />}
                    onClick={scrollToCategories}
                    disabled={isScrolling}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 3,
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[8],
                        backgroundColor: '#f5f5f5'
                      },
                      '&:disabled': {
                        opacity: 0.7
                      }
                    }}
                  >
                    {isScrolling ? 'Скроллим...' : 'Перейти к покупкам'}
                  </Button>
                </AnimatedBox>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Slide direction="left" in timeout={1000}>
                <Box
                  sx={{
                    position: 'relative',
                    textAlign: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                    alt="Техника"
                    sx={{
                      width: '100%',
                      maxWidth: 500,
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: theme.shadows[10],
                      transform: 'rotate3d(0.5, 1, 0, 15deg)',
                      transition: 'transform 0.5s ease, box-shadow 0.5s ease',
                      '&:hover': {
                        transform: 'rotate3d(0.5, 1, 0, 5deg) scale(1.02)',
                        boxShadow: theme.shadows[16]
                      }
                    }}
                  />
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Преимущества */}
      <Container sx={{ py: 8 }}>
        <AnimatedBox>
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
        </AnimatedBox>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Grow in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s ease',
                    borderRadius: 3,
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
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
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Популярные категории - добавляем ID */}
      <Box 
        id="categories-section"
        sx={{ py: 8, backgroundColor: 'grey.50', scrollMarginTop: '100px' }}
      >
        <Container>
          <AnimatedBox>
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
          </AnimatedBox>

          <Grid container spacing={3}>
            {categories.slice(0, 4).map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={category.id}>
                <Grow in timeout={1000} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Card
                    component={Link}
                    to={`/catalog?category=${category.slug}`}
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
                    <Box
                      sx={{
                        height: 200,
                        backgroundImage: `url(${category.image_url || 'https://via.placeholder.com/300x200/6c757d/ffffff?text=Категория'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Category sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" gutterBottom>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {category.description}
                      </Typography>
                      <Chip
                        label={`${category.product_count || 0} товаров`}
                        color="primary"
                        variant="outlined"
                      />
                    </CardContent>
                    <Box sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        component={Link}
                        to={`/catalog?category=${category.slug}`}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600
                        }}
                      >
                        Смотреть товары
                      </Button>
                    </Box>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>

          {categories.length > 4 && (
            <AnimatedBox>
              <Box textAlign="center" mt={6}>
                <Button
                  component={Link}
                  to="/catalog"
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 6,
                    py: 1.5,
                    fontSize: '1rem',
                    borderRadius: 3,
                    borderWidth: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[4]
                    }
                  }}
                >
                  Все категории
                </Button>
              </Box>
            </AnimatedBox>
          )}
        </Container>
      </Box>

      {/* Остальной код */}
      {/* ... */}

      <ScrollTopButton />
    </Box>
  );
};

export default HomePage;