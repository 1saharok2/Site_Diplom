import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const OrdersPage = () => {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        История заказов
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography>Здесь будет история ваших заказов</Typography>
      </Paper>
    </Container>
  );
};

export default OrdersPage;