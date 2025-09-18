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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Visibility as ViewIcon
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await adminService.getOrders();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Ошибка при загрузке заказов');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      fetchOrders(); // Обновляем список после изменения
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Ошибка при обновлении статуса заказа');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'shipped': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Ожидание',
      'processing': 'В обработке',
      'shipped': 'Отправлен',
      'completed': 'Завершен',
      'cancelled': 'Отменен'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление заказами
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Заказов пока нет
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>№ Заказа</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>#{order.order_number || order.id}</TableCell>
                  <TableCell>
                    {order.customer_name || order.user_email || 'Гость'}
                    {order.user_email && (
                      <Typography variant="body2" color="text.secondary">
                        {order.user_email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{order.customer_phone || 'Не указан'}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {order.total_amount?.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.created_at).toLocaleTimeString('ru-RU')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexDirection="column">
                      <IconButton
                        size="small"
                        onClick={() => viewOrderDetails(order)}
                        title="Просмотреть детали"
                      >
                        <ViewIcon />
                      </IconButton>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={order.status === 'processing'}
                      >
                        В обработку
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        disabled={order.status === 'completed'}
                      >
                        Завершить
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={order.status === 'cancelled'}
                      >
                        Отменить
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалог с деталями заказа */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Детали заказа #{selectedOrder?.order_number || selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>Информация о клиенте</Typography>
              <Typography>Имя: {selectedOrder.customer_name}</Typography>
              <Typography>Email: {selectedOrder.customer_email}</Typography>
              <Typography>Телефон: {selectedOrder.customer_phone}</Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>Товары</Typography>
              {selectedOrder.order_items?.map((item, index) => (
                <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                  <Typography>
                    {item.name} × {item.quantity}
                  </Typography>
                  <Typography>
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                  </Typography>
                </Box>
              ))}
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                Итого: {selectedOrder.total_amount?.toLocaleString('ru-RU')} ₽
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrders;