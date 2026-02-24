// src/components/Cart/CartItems.jsx
import React, { useState } from 'react';
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
  alpha,
  Snackbar,
  Alert
} from '@mui/material';
import { Delete, Add, Remove, ShoppingBag, Favorite } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { wishlistService } from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext';

const CartItems = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const { items: cartItems, updateQuantity, removeFromCart, loading } = useCart();
  const [updatingItems, setUpdatingItems] = useState({});
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      setSnackbar({
        open: true,
        message: 'Не удалось обновить количество',
        severity: 'error'
      });
    } finally {
      setUpdatingItems(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    setUpdatingItems(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      await removeFromCart(cartItemId);
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      setSnackbar({
        open: true,
        message: 'Не удалось удалить товар',
        severity: 'error'
      });
    } finally {
      setUpdatingItems(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleAddToWishlist = async (item) => {
    if (!user?.id) {
      setSnackbar({
        open: true,
        message: 'Для добавления в избранное необходимо авторизоваться',
        severity: 'warning'
      });
      return;
    }

    try {
      const result = await wishlistService.toggleWishlist(user.id, item.product_id);
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка добавления в избранное',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getField = (item, field) => {
    return item[field] || item.products?.[field] || null;
  };

  if (cartItems.length === 0) {
    return null; // или можно вернуть сообщение, но это уже обработано в CartPage
  }

  return (
    <>
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
            const isUpdating = updatingItems[item.id];

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
                  opacity: isUpdating ? 0.7 : 1,
                  '&:hover': {
                    transform: isUpdating ? 'none' : 'translateY(-2px)',
                    boxShadow: isUpdating ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.12)',
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
                      {name} {isUpdating && '(обновление...)'}
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
                          overflow: 'hidden',
                          opacity: isUpdating ? 0.5 : 1
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => !isUpdating && handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || isUpdating}
                          sx={{
                            borderRadius: 0,
                            color: (item.quantity <= 1 || isUpdating) ? 'grey.400' : 'primary.main',
                            '&:hover': {
                              background: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <Remove />
                        </IconButton>

                        <TextField
                          value={isUpdating ? '...' : item.quantity}
                          sx={{
                            width: 60,
                            '& .MuiInputBase-root': {
                              border: 'none',
                              background: 'transparent'
                            },
                            '& .MuiInputBase-input': {
                              textAlign: 'center',
                              fontWeight: 600,
                              py: 1,
                              color: isUpdating ? 'text.secondary' : 'text.primary'
                            }
                          }}
                          inputProps={{
                            style: { textAlign: 'center', fontSize: '1rem' }
                          }}
                          disabled={isUpdating}
                        />

                        <IconButton
                          size="small"
                          onClick={() => !isUpdating && handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          sx={{
                            borderRadius: 0,
                            color: isUpdating ? 'grey.400' : 'primary.main',
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
                          color: isUpdating ? 'text.secondary' : 'primary.main',
                          minWidth: 120
                        }}
                      >
                        {isUpdating ? 'Обновление...' : `${(price * item.quantity).toLocaleString('ru-RU')} ₽`}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Действия */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <IconButton
                      onClick={() => !isUpdating && handleAddToWishlist(item)}
                      disabled={isUpdating}
                      sx={{
                        color: isUpdating ? 'grey.400' : 'grey.600',
                        '&:hover': {
                          color: isUpdating ? 'grey.400' : 'error.main',
                          background: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      <Favorite />
                    </IconButton>

                    <IconButton
                      onClick={() => removeFromCart(item.id)}
                      disabled={isUpdating}
                      sx={{
                        color: isUpdating ? 'grey.400' : 'grey.600',
                        '&:hover': {
                          color: isUpdating ? 'grey.400' : 'error.main',
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CartItems;