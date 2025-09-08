import React from 'react';
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
  TextField
} from '@mui/material';
import {
  ShoppingBasket,
  LocalShipping,
  Security,
  SupportAgent,
  Star,
  Favorite
} from '@mui/icons-material';
import { mockProducts, mockCategories } from '../../data/mockData'; // Импортируем конкретные данные
import { useCart } from '../../context/CartContext';

const HomePage = () => {
  const { addToCart } = useCart();

  // Используем конкретные товары из mockData
  const featuredProducts = mockProducts.slice(0, 4);
  // Используем конкретные категории из mockData
  const categories = mockCategories;

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
      description: 'Более 1000 товаров'
    }
  ];

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <Box sx={{ pt: 0 }}>
      
      {/* Герой секция */}
<Box
  sx={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    py: { xs: 8, md: 12 },
    position: 'relative',
    overflow: 'hidden'
  }}
>
  <Container maxWidth="lg">
    <Grid container spacing={4} alignItems="center">
      {/* Текстовый блок - занимает 6 колонок */}
      <Grid item xs={12} md={6}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            mb: 3,
            lineHeight: 1.2
          }}
        >
          Добро пожаловать в наш магазин
        </Typography>
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            opacity: 0.9,
            fontWeight: 300
          }}
        >
          Откройте для себя лучшие товары по выгодным ценам. 
          Техника, аксессуары и многое другое с гарантией качества.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/catalog"
            variant="contained"
            size="large"
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Перейти к покупкам
          </Button>
          <Button
            component={Link}
            to="/categories"
            variant="outlined"
            size="large"
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'white'
              }
            }}
          >
            Все категории
          </Button>
        </Box>
      </Grid>

      {/* Блок с фотографией - занимает 6 колонок и центрируется */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            minHeight: 400
          }}
        >
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
            alt="Магазин электроники"
            sx={{
              width: '100%',
              maxWidth: 500,
              height: 'auto',
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              objectFit: 'cover'
            }}
          />
        </Box>
      </Grid>
    </Grid>
  </Container>
</Box>

      {/* Преимущества */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)'
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
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              mb: 6
            }}
          >
            Популярные категории
          </Typography>
          <Grid container spacing={3}>
            {categories.slice(0, 4).map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category.id}>
                <Card
                  component={Link}
                  to={`/catalog?category=${category.slug}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.productsCount || 0} товаров
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Хиты продаж */}
      <Container sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold'
            }}
          >
            Хиты продаж
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Самые популярные товары
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 250,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {product.isNew && (
                    <Chip
                      label="NEW"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12
                      }}
                    />
                  )}
                  <Button
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      minWidth: 'auto',
                      padding: '4px'
                    }}
                  >
                    <Favorite sx={{ fontSize: 20 }} />
                  </Button>
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {product.name}
                  </Typography>
                  {product.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Star sx={{ color: 'gold', fontSize: 18, mr: 0.5 }} />
                      <Typography variant="body2">
                        {product.rating}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      {product.price.toLocaleString()} ₽
                    </Typography>
                    {product.oldPrice && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'line-through'
                        }}
                      >
                        {product.oldPrice.toLocaleString()} ₽
                      </Typography>
                    )}
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingBasket />}
                    onClick={() => handleAddToCart(product)}
                    sx={{
                      py: 1
                    }}
                  >
                    В корзину
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            component={Link}
            to="/catalog"
            variant="outlined"
            size="large"
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Смотреть все товары
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;