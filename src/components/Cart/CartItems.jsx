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
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { useAuth } from '../../context/AuthContext'; // Добавьте этот импорт

const CartItems = ({ cartItems, onCartUpdate, onRefreshCart }) => {
  const theme = useTheme();
  const { user } = useAuth(); // Получаем пользователя из контекста
  const [updatingItems, setUpdatingItems] = useState({});
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const saveToAllCacheKeys = (itemsToSave) => { // ← itemsToSave вместо updatedItems
    try {
      console.log('💾 Начинаем сохранение во все ключи...');
      
      // Все возможные ключи для вашего пользователя
      const possibleKeys = [
        `cart_cache_4d70129c-33d0-4379-ab10-24c64a3e30a9`, // Ваш UUID
        `cart_cache_4`,                                    // Числовой ID
        'cart_cache',                                      // Общий ключ
        'cart',                                            // Простой ключ
        'current_cart'                                     // Единый ключ для всех
      ];
      
      possibleKeys.forEach(key => {
        try {
          localStorage.setItem(key, JSON.stringify(itemsToSave));
          console.log(`✅ Сохранено в ${key}`);
        } catch (e) {
          console.warn(`⚠️ Не удалось сохранить в ${key}:`, e.message);
        }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения:', error);
      return false;
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    console.log(`🔄 Изменение количества: ${cartItemId} -> ${newQuantity}`);
    
    // Блокируем кнопку
    setUpdatingItems(prev => ({ ...prev, [cartItemId]: true }));
    
    // Сохраняем текущее состояние для отката
    const originalItems = [...cartItems];
    
    // Оптимистично обновляем UI мгновенно
    const updatedItems = cartItems.map(item =>
      item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    onCartUpdate(updatedItems);
    
    try {
      // ⚠️ ВАЖНО: Сохраняем во все возможные ключи
      saveToAllCacheKeys(updatedItems);
      
      // Отправляем на сервер в фоне
      cartService.updateCartItem(cartItemId, newQuantity)
        .then(result => {
          console.log('✅ Сервер обновил количество:', result);
        })
        .catch(error => {
          console.error('❌ Ошибка сервера:', error);
        });
        
    } catch (error) {
      console.error('❌ Ошибка сохранения в localStorage:', error);
      
      // При ошибке возвращаем исходное состояние
      onCartUpdate(originalItems);
      alert('Не удалось сохранить изменения');
      
    } finally {
      // Разблокируем кнопку
      setUpdatingItems(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    console.log(`🗑️ Удаление товара: ${cartItemId}`);
    
    // Оптимистичное удаление
    const updatedItems = cartItems.filter(item => item.id !== cartItemId);
    onCartUpdate(updatedItems);
    
    try {
      // Сохраняем во все ключи
      saveToAllCacheKeys(updatedItems);
      
      // Удаляем с сервера в фоне
      cartService.removeFromCart(cartItemId)
        .then(result => {
          console.log('✅ Товар удален с сервера:', result);
        })
        .catch(error => {
          console.error('❌ Ошибка сервера:', error);
        });
        
    } catch (error) {
      console.error('❌ Ошибка при удалении:', error);
    }
  };

  const loadWishlist = async () => {
    if (user?.id) {
      try {
        const items = await wishlistService.getUserWishlist(user.id);
        return items || [];
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        return [];
      }
    }
    return [];
  };

  const handleAddToWishlist = async (item) => {
    console.log('Добавить в избранное:', item);
    
    if (!user?.id) {
      setSnackbar({
        open: true,
        message: 'Для добавления в избранное необходимо авторизоваться',
        severity: 'warning'
      });
      return;
    }

    try {
      // Используем toggleWishlist - он сам проверит, есть ли уже товар
      const result = await wishlistService.toggleWishlist(user.id, item.product_id);
      
      console.log('Результат toggleWishlist:', result);
      
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });
      
      // Обновляем список избранного (опционально, если нужно обновить состояние в родителе)
      // Можно вызвать callback, если передали его через props
      
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

  // Рендер компонента
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
                      onClick={() => !isUpdating && handleRemoveItem(item.id)}
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

      {/* Snackbar для уведомлений */}
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