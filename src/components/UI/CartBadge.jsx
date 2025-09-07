// components/UI/CartBadge.jsx
import React from 'react';
import { Badge } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useCart } from '../../context/CartContext/CartContext';

const CartBadge = () => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Badge badgeContent={totalItems} color="error">
      <ShoppingCart />
    </Badge>
  );
};

export default CartBadge;