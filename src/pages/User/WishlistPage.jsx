// pages/User/WishlistPage.jsx
import React, { useEffect } from 'react';
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
  Divider
} from '@mui/material';
import { Favorite, ShoppingBasket, ArrowBack, Delete } from '@mui/icons-material';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const WishlistPage = () => {
  const { wishlist, loading, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      refreshWishlist();
    }
  }, [currentUser, refreshWishlist]);

  const handleRemoveFromWishlist = async (wishlistItemId) => {
    try {
      await removeFromWishlist(wishlistItemId);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      // Можно добавить уведомление об успехе
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!currentUser) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Необходима авторизация
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Войдите в систему, чтобы просматривать избранные товары
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
        >
          Войти
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Загрузка избранного...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Избранное
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {wishlist.length} товаров
        </Typography>
      </Box>

      {wishlist.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Favorite sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            В избранном пока пусто
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Добавляйте товары в избранное, чтобы не потерять
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/catalog')}
            startIcon={<ShoppingBasket />}
          >
            Перейти в каталог
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlist.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}>
                <CardMedia
                  component="img"
                  height="250"
                  image={item.products?.image_url?.[0] || '/images/placeholder.jpg'}
                  alt={item.products?.name}
                  sx={{ objectFit: 'cover' }}
                />
                
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom noWrap>
                    {item.products?.name}
                  </Typography>
                  
                  <Chip 
                    label={item.products?.category_slug} 
                    size="small" 
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {item.products?.price?.toLocaleString('ru-RU')} ₽
                    </Typography>
                    {item.products?.old_price && (
                      <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        {item.products.old_price.toLocaleString('ru-RU')} ₽
                      </Typography>
                    )}
                  </Box>

                  {item.products?.is_new && (
                    <Chip label="Новинка" color="success" size="small" sx={{ mr: 1 }} />
                  )}
                  {item.products?.discount > 0 && (
                    <Chip 
                      label={`-${item.products.discount}%`} 
                      color="error" 
                      size="small" 
                    />
                  )}
                </CardContent>

                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<ShoppingBasket />}
                    fullWidth
                    onClick={() => handleAddToCart(item.products)}
                    sx={{ flex: 1 }}
                  >
                    В корзину
                  </Button>
                  
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.1)'
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WishlistPage;