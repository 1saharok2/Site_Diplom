import React from 'react';
import { Button, Container, Box, Typography } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header/Header';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGoToCart = () => {
    navigate('/cart');
  };

  return(
    <div>

    </div>       
  );
}

export default HomePage;