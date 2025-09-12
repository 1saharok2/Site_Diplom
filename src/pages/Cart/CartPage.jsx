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
  TextField
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingCart
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext'; // ИЗМЕНИТЕ ПУТЬ
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();

  // Защита от undefined
  const items = cartItems || [];
  const totalPrice = getTotalPrice ? getTotalPrice() : 0;

  if (items.length === 0) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Корзина пуста
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Добавьте товары в корзину, чтобы сделать заказ
        </Typography>
        <Button
          component={Link}
          to="/catalog"
          variant="contained"
          size="large"
        >
          Перейти в каталог
        </Button>
      </Container>
    );
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Корзина
      </Typography>

      <Grid container spacing={4}>
        {/* Список товаров */}
        <Grid item xs={12} md={8}>
          {items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={3}>
                    <Box
                      component="img"
                      src={item.image}
                      alt={item.name}
                      sx={{
                        width: '100%',
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: 1
                      }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        value={item.quantity}
                        size="small"
                        sx={{ width: 60 }}
                        inputProps={{ 
                          style: { textAlign: 'center' },
                          min: 1 
                        }}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h6" sx={{ textAlign: 'right' }}>
                      {(item.price * item.quantity).toLocaleString()} ₽
                    </Typography>
                    <IconButton
                      onClick={() => removeFromCart(item.id)}
                      sx={{ float: 'right' }}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Итого */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Итого
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Товары ({items.reduce((total, item) => total + item.quantity, 0)})</Typography>
                <Typography>{totalPrice.toLocaleString()} ₽</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Доставка</Typography>
                <Typography>Бесплатно</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Общая сумма</Typography>
                <Typography variant="h6">{totalPrice.toLocaleString()} ₽</Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ mb: 2 }}
              >
                Оформить заказ
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearCart}
              >
                Очистить корзину
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;