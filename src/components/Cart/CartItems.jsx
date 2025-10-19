// src/components/Cart/CartItems.jsx
import React from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  TextField,
  Divider,
  Chip,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import { Delete, Add, Remove, ShoppingBag, Favorite } from '@mui/icons-material';
import { cartService } from '../../services/cartService';

const CartItems = ({ cartItems, onCartUpdate, onRefreshCart }) => {
  const theme = useTheme();

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    try {
      await cartService.updateCartItem(cartItemId, newQuantity);
      onRefreshCart();
    } catch (error) {
      console.error('Ошибка изменения количества:', error);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await cartService.removeFromCart(cartItemId);
      const updatedItems = cartItems.filter(item => item.id !== cartItemId);
      onCartUpdate(updatedItems);
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      onRefreshCart();
    }
  };

  const handleAddToWishlist = (item) => {
    console.log('Добавить в избранное:', item);
  };

  const getField = (item, field) => {
    return item[field] || item.products?.[field] || null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.1),
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Заголовок */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          p: 2,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(theme.palette.primary.main, 0.1)
        }}
      >
        <ShoppingBag sx={{ color: 'primary.main', fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Товары в корзине
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cartItems.length} {cartItems.length === 1 ? 'товар' : 'товаров'}
          </Typography>
        </Box>
      </Box>

      {/* Список товаров */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {cartItems.map((item, index) => {
          const name = getField(item, 'product_name') || getField(item, 'name') || 'Неизвестный товар';
          const price = parseFloat(getField(item, 'price') || 0);
          const oldPrice = parseFloat(getField(item, 'old_price') || 0);
          const image = getField(item, 'image_url') || getField(item, 'image') || '/images/no-image.jpg';

          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(248, 250, 252, 0.8)',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
                {/* Изображение товара */}
                <Avatar
                  src={image}
                  variant="rounded"
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 2,
                    bgcolor: 'grey.100',
                    '& .MuiAvatar-img': {
                      objectFit: 'cover'
                    }
                  }}
                >
                  <ShoppingBag sx={{ color: 'grey.400' }} />
                </Avatar>

                {/* Информация о товаре */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip
                      label={`${price.toLocaleString('ru-RU')} ₽`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    {oldPrice > 0 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          textDecoration: 'line-through'
                        }}
                      >
                        {oldPrice.toLocaleString('ru-RU')} ₽
                      </Typography>
                    )}
                  </Box>

                  {/* Управление количеством */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'white',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        overflow: 'hidden'
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        sx={{
                          borderRadius: 0,
                          color: item.quantity <= 1 ? 'grey.400' : 'primary.main',
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Remove />
                      </IconButton>

                      <TextField
                        value={item.quantity}
                        sx={{
                          width: 60,
                          '& .MuiInputBase-root': {
                            border: 'none',
                            background: 'transparent'
                          },
                          '& .MuiInputBase-input': {
                            textAlign: 'center',
                            fontWeight: 600,
                            py: 1
                          }
                        }}
                        inputProps={{
                          style: { textAlign: 'center', fontSize: '1rem' }
                        }}
                        disabled
                      />

                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        sx={{
                          borderRadius: 0,
                          color: 'primary.main',
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    {/* Итоговая цена */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        minWidth: 120
                      }}
                    >
                      {(price * item.quantity).toLocaleString('ru-RU')} ₽
                    </Typography>
                  </Box>
                </Box>

                {/* Действия */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                  <IconButton
                    onClick={() => handleAddToWishlist(item)}
                    sx={{
                      color: 'grey.600',
                      '&:hover': {
                        color: 'error.main',
                        background: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  >
                    <Favorite />
                  </IconButton>

                  <IconButton
                    onClick={() => handleRemoveItem(item.id)}
                    sx={{
                      color: 'grey.600',
                      '&:hover': {
                        color: 'error.main',
                        background: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>

              {index < cartItems.length - 1 && (
                <Divider
                  sx={{
                    mt: 3,
                    borderStyle: 'dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  }}
                />
              )}
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
};

export default CartItems;
