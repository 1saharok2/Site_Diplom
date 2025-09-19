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
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippedIcon
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
      fetchOrders();
      setSuccessMessage('Статус заказа обновлен');
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Ошибка при обновлении статуса заказа');
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await adminService.deleteOrder(orderId);
      setSuccessMessage('Заказ успешно удален');
      setDeleteDialogOpen(false);
      fetchOrders(); // Обновляем список
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Ошибка при удалении заказа');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
    setAnchorEl(null); // Закрываем меню
  };

  const handleMenuOpen = (event, orderId) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
    handleMenuClose();
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CompleteIcon />;
      case 'processing': return <EditIcon />;
      case 'shipped': return <ShippedIcon />;
      case 'cancelled': return <CancelIcon />;
      default: return <EditIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Управление заказами
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Заказов пока нет
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>№ Заказа</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Клиент</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Телефон</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography fontWeight="bold">
                      #{order.order_number || order.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {order.customer_name || order.user_email || 'Гость'}
                    </Typography>
                    {order.user_email && (
                      <Typography variant="body2" color="text.secondary">
                        {order.user_email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{order.customer_phone || 'Не указан'}</TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary.main">
                      {order.total_amount?.toLocaleString('ru-RU')} ₽
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={getStatusText(order.status)}
                      color={getStatusColor(order.status)}
                      variant="filled"
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
                    <Box display="flex" gap={1} alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() => viewOrderDetails(order)}
                        title="Просмотреть детали"
                        sx={{ 
                          color: 'primary.main',
                          '&:hover': { backgroundColor: 'primary.light' }
                        }}
                      >
                        <ViewIcon />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, order.id)}
                        title="Дополнительные действия"
                      >
                        <MoreIcon />
                      </IconButton>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={order.status === 'processing'}
                        sx={{ minWidth: 'auto' }}
                      >
                        Обработать
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Меню дополнительных действий */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) updateOrderStatus(order.id, 'completed');
          handleMenuClose();
        }}>
          <ListItemIcon>
            <CompleteIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Завершить заказ</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) updateOrderStatus(order.id, 'cancelled');
          handleMenuClose();
        }}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Отменить заказ</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) handleDeleteClick(order);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить заказ</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle color="error">
          ❗ Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите удалить заказ #{orderToDelete?.order_number || orderToDelete?.id}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Клиент: {orderToDelete?.customer_name || 'Гость'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Сумма: {orderToDelete?.total_amount?.toLocaleString('ru-RU')} ₽
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            ⚠️ Это действие нельзя отменить!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => deleteOrder(orderToDelete.id)}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Уведомление об успехе */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage('')}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminOrders;