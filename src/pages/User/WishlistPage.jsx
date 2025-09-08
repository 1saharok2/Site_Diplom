import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const WishlistPage = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Избранные товары
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Здесь будут ваши избранные товары</Typography>
      </Paper>
    </Container>
  );
};

export default WishlistPage;