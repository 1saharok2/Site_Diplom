// components/Product/WishlistButton.jsx
import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const WishlistButton = ({ product, size = 'medium' }) => {
  const [loading, setLoading] = useState(false);
  const { addToWishlist, removeFromWishlistByProduct, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isFavorite = isInWishlist(product.id);

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await removeFromWishlistByProduct(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
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
            color: '#ff4757'
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
  );
};

export default WishlistButton;