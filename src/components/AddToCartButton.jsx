// components/AddToCartButton.jsx
import React, { useState } from 'react';
import {
  Button,
  Box,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  AddShoppingCart,
  Check
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const AddToCartButton = ({ product, size = 'medium', variant = 'contained' }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      alert('Пожалуйста, авторизуйтесь чтобы добавить товар в корзину');
      return;
    }
    try {
      setLoading(true);
      await addToCart(product.id, 1);
      setShowSuccess(true);
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      alert('Не удалось добавить товар в корзину');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
  };
  const isInCart = false; 
  if (size === 'icon') {
    return (
      <>
        <IconButton
          onClick={handleAddToCart}
          disabled={loading}
          color="primary"
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isInCart ? (
            <Check />
          ) : (
            <AddShoppingCart />
          )}
        </IconButton>

        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" onClose={handleCloseSnackbar}>
            Товар добавлен в корзину!
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        startIcon={
          loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : isInCart ? (
            <Check />
          ) : (
            <AddShoppingCart />
          )
        }
        onClick={handleAddToCart}
        disabled={loading}
        fullWidth
        sx={{
          mt: 1,
          borderRadius: 2,
          py: 1
        }}
      >
        {loading ? 'Добавление...' : isInCart ? 'В корзине' : 'В корзину'}
      </Button>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          Товар добавлен в корзину!
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddToCartButton;