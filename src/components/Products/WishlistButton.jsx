// components/Product/WishlistButton.jsx
import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WishlistButton = ({ product, size = 'medium' }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { addToWishlist, removeFromWishlistByProduct, isInWishlist } = useWishlist();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isFavorite = isInWishlist(product.id);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClick = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFromWishlistByProduct(product.id);
        showSnackbar('Товар удален из избранного');
      } else {
        await addToWishlist(product.id);
        showSnackbar('Товар добавлен в избранное');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      showSnackbar('Произошла ошибка', 'error');
    } finally {
      setLoading(false);
    }
  };

  const buttonSize = {
    small: { fontSize: 20 },
    medium: { fontSize: 24 },
    large: { fontSize: 30 }
  }[size];

  return (
    <>
      <Tooltip title={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}>
        <IconButton
          onClick={handleClick}
          disabled={loading}
          color={isFavorite ? "error" : "default"}
          sx={{
            color: isFavorite ? '#ff4757' : 'inherit',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              color: '#ff4757',
              backgroundColor: 'rgba(255, 71, 87, 0.1)'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : isFavorite ? (
            <Favorite sx={buttonSize} />
          ) : (
            <FavoriteBorder sx={buttonSize} />
          )}
        </IconButton>
      </Tooltip>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WishlistButton;