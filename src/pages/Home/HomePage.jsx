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
      <Header/>
      <Container maxWidth="lg" sx={{ mt: 4 }}>


        {/* Дополнительный контент страницы */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Популярные категории
          </Typography>
          {/* Здесь можно добавить сетку товаров или категорий */}
        </Box>
      </Container>
    </div>       
  );
}

export default HomePage;