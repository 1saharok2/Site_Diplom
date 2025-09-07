// pages/Admin/Orders/AdminOrders.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  MenuItem,
  FormControl,
  Select,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const ORDER_STATUSES = {
  pending: { label: "Ожидание", color: "warning" },
  processing: { label: "В обработке", color: "info" },
  shipped: { label: "Отправлен", color: "secondary" },
  delivered: { label: "Доставлен", color: "success" },
  cancelled: { label: "Отменен", color: "error" }
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminService.getOrders();
      setOrders(response.data);
    } catch (error) {
      setError('Ошибка при загрузке заказов');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      setError('Ошибка при обновлении статуса');
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Заказы
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    {order.customerName}<br />
                    <small>{order.customerEmail}</small>
                  </TableCell>
                  <TableCell>{order.total.toLocaleString()} ₽</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        displayEmpty
                      >
                        {Object.entries(ORDER_STATUSES).map(([value, config]) => (
                          <MenuItem key={value} value={value}>
                            {config.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(order)}
                    >
                      Детали
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог с деталями заказа */}
      <OrderDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        order={selectedOrder}
      />
    </Box>
  );
};

// Компонент диалога с деталями заказа
const OrderDetailsDialog = ({ open, onClose, order }) => {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Детали заказа #{order.id}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Информация о клиенте</Typography>
          <Typography><strong>Имя:</strong> {order.customerName}</Typography>
          <Typography><strong>Email:</strong> {order.customerEmail}</Typography>
          <Typography><strong>Телефон:</strong> {order.customerPhone}</Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Адрес доставки</Typography>
          <Typography><strong>Город:</strong> {order.shippingAddress?.city}</Typography>
          <Typography><strong>Адрес:</strong> {order.shippingAddress?.address}</Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Информация о заказе</Typography>
          <Typography><strong>Статус:</strong> {ORDER_STATUSES[order.status]?.label}</Typography>
          <Typography><strong>Способ оплаты:</strong> {order.paymentMethod}</Typography>
          <Typography><strong>Общая сумма:</strong> {order.total.toLocaleString()} ₽</Typography>
          <Typography><strong>Дата создания:</strong> {new Date(order.createdAt).toLocaleString('ru-RU')}</Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Товары</Typography>
          {order.items?.map((item, index) => (
            <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
              <Typography><strong>Товар:</strong> {item.name}</Typography>
              <Typography><strong>Цена:</strong> {item.price.toLocaleString()} ₽</Typography>
              <Typography><strong>Количество:</strong> {item.quantity}</Typography>
              <Typography><strong>Сумма:</strong> {(item.price * item.quantity).toLocaleString()} ₽</Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminOrders;