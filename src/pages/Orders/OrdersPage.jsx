import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  ShoppingBag,
  CalendarToday,
  LocalShipping,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const userOrders = await orderService.getUserOrders(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'shipped': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'processing': return <ShoppingBag />;
      case 'shipped': return <LocalShipping />;
      case 'cancelled': return <Cancel />;
      default: return <ShoppingBag />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Загрузка заказов...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Мои заказы
      </Typography>

      {orders.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          У вас пока нет заказов
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Заказ #{order.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <CalendarToday sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 1 }} />
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={order.status}
                    color={getStatusColor(order.status)}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Товары:
                  </Typography>
                  {order.items.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.name} × {item.quantity}
                      </Typography>
                      <Typography variant="body2">
                        {item.price * item.quantity} ₽
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Итого: {order.totalAmount} ₽
                  </Typography>
                  
                  {order.status === 'processing' && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Отменить заказ
                    </Button>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default OrdersPage;