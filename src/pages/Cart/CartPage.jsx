// pages/Cart/CartPage.jsx
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleClearCart = () => {
    clearCart();
  };

  if (items.length === 0) {
    return (
      <Container sx={{ py: 8, minHeight: '60vh' }}>
        <Box textAlign="center">
          <ShoppingCartIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="text.secondary">
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
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Перейти к покупкам
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Корзина покупок
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Товар</TableCell>
                  <TableCell align="center">Цена</TableCell>
                  <TableCell align="center">Количество</TableCell>
                  <TableCell align="center">Сумма</TableCell>
                  <TableCell align="center">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.name}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {item.name}
                          </Typography>
                          {item.specifications && (
                            <Typography variant="body2" color="text.secondary">
                              {item.specifications.memory || item.specifications.color}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="medium">
                        {item.price.toLocaleString()} ₽
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          sx={{ border: '1px solid', borderColor: 'grey.300' }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography variant="body1" sx={{ minWidth: 40, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          sx={{ border: '1px solid', borderColor: 'grey.300' }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {(item.price * item.quantity).toLocaleString()} ₽
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleRemoveItem(item.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={handleClearCart}
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
            >
              Очистить корзину
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Итого
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Товары ({getTotalItems()} шт.)</Typography>
                <Typography variant="body2">{getTotalPrice().toLocaleString()} ₽</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Доставка</Typography>
                <Typography variant="body2">Бесплатно</Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Общая сумма
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {getTotalPrice().toLocaleString()} ₽
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                mb: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
              component={Link}
              to="/checkout"
            >
              Перейти к оформлению
            </Button>

            <Button
              component={Link}
              to="/catalog"
              variant="outlined"
              size="large"
              fullWidth
            >
              Продолжить покупки
            </Button>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <Box component="span" fontWeight="bold">Бесплатная доставка</Box> при заказе от 3000 ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Box component="span" fontWeight="bold">14 дней</Box> на возврат товара
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;