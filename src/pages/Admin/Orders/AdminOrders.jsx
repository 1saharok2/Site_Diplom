import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import { adminService } from '../../../services/adminService';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
  try {
    const ordersData = await adminService.getOrders();
    setOrders(Array.isArray(ordersData) ? ordersData : []);
  } catch (error) {
    setError('Ошибка при загрузке заказов');
    setOrders([]);
  } finally {
    setLoading(false);
  }
};

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      setError('Ошибка при обновлении статуса заказа');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Заказы
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* ДОБАВЬТЕ ПРОВЕРКУ orders?.map */}
            {orders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.user_email || 'Гость'}</TableCell>
                <TableCell>{order.total_amount} руб.</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={
                      order.status === 'completed' ? 'success' :
                      order.status === 'processing' ? 'primary' :
                      order.status === 'cancelled' ? 'error' : 'default'
                    }
                  />
                </TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => updateOrderStatus(order.id, 'processing')}
                    disabled={order.status === 'processing'}
                  >
                    В обработку
                  </Button>
                  <Button
                    size="small"
                    color="success"
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    disabled={order.status === 'completed'}
                  >
                    Завершить
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    disabled={order.status === 'cancelled'}
                  >
                    Отменить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Сообщение если заказов нет */}
      {!loading && orders?.length === 0 && (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Заказов пока нет
        </Typography>
      )}
    </Box>
  );
};

export default AdminOrders;