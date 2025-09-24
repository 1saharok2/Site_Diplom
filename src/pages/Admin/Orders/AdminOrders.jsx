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
  Snackbar,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippedIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Состояния для поиска и фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, dateFilter, amountFilter]);

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

  const filterOrders = () => {
    let filtered = [...orders];

    // Поиск по номеру заказа, имени клиента, email, телефону
    if (searchTerm) {
      filtered = filtered.filter(order =>
        (order.order_number?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.user_email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Фильтр по дате
    if (dateFilter !== 'all') {
      const now = new Date();
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        
        switch (dateFilter) {
          case 'today':
            return orderDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Фильтр по сумме
    if (amountFilter !== 'all') {
      filtered = filtered.filter(order => {
        switch (amountFilter) {
          case 'low':
            return order.total_amount < 1000;
          case 'medium':
            return order.total_amount >= 1000 && order.total_amount < 5000;
          case 'high':
            return order.total_amount >= 5000;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
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
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Ошибка при удалении заказа');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
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

  const getStats = () => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const processing = orders.filter(order => order.status === 'processing').length;
    const shipped = orders.filter(order => order.status === 'shipped').length;
    const completed = orders.filter(order => order.status === 'completed').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;

    return { total, pending, processing, shipped, completed, cancelled };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Управление заказами
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchOrders}
        >
          Обновить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.total}</Typography>
              <Typography variant="body2">Всего</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.pending}</Typography>
              <Typography variant="body2">Ожидание</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.processing}</Typography>
              <Typography variant="body2">В обработке</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.completed}</Typography>
              <Typography variant="body2">Завершены</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={2}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5">{stats.cancelled}</Typography>
              <Typography variant="body2">Отменены</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Панель поиска и фильтров */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Поиск по номеру, имени, email или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                input={<OutlinedInput label="Статус" />}
              >
                <MenuItem value="all">Все статусы</MenuItem>
                <MenuItem value="pending">Ожидание</MenuItem>
                <MenuItem value="processing">В обработке</MenuItem>
                <MenuItem value="shipped">Отправлен</MenuItem>
                <MenuItem value="completed">Завершен</MenuItem>
                <MenuItem value="cancelled">Отменен</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Дата</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                input={<OutlinedInput label="Дата" />}
              >
                <MenuItem value="all">За все время</MenuItem>
                <MenuItem value="today">Сегодня</MenuItem>
                <MenuItem value="week">За неделю</MenuItem>
                <MenuItem value="month">За месяц</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Сумма</InputLabel>
              <Select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                input={<OutlinedInput label="Сумма" />}
              >
                <MenuItem value="all">Любая сумма</MenuItem>
                <MenuItem value="low">До 1 000 ₽</MenuItem>
                <MenuItem value="medium">1 000 - 5 000 ₽</MenuItem>
                <MenuItem value="high">От 5 000 ₽</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Быстрые фильтры */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<FilterIcon />}
            label="Быстрый фильтр:"
            variant="outlined"
          />
          <Chip
            label={`Все (${orders.length})`}
            onClick={() => {
              setStatusFilter('all');
              setDateFilter('all');
              setAmountFilter('all');
              setSearchTerm('');
            }}
            color={statusFilter === 'all' && dateFilter === 'all' && amountFilter === 'all' && !searchTerm ? 'primary' : 'default'}
            clickable
          />
          <Chip
            label={`Ожидание (${stats.pending})`}
            onClick={() => setStatusFilter('pending')}
            color={statusFilter === 'pending' ? 'warning' : 'default'}
            clickable
          />
          <Chip
            label={`В обработке (${stats.processing})`}
            onClick={() => setStatusFilter('processing')}
            color={statusFilter === 'processing' ? 'primary' : 'default'}
            clickable
          />
        </Box>
      </Paper>

      {/* Результаты поиска */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Найдено заказов: {filteredOrders.length} из {orders.length}
        </Typography>
      </Box>

      {filteredOrders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {orders.length === 0 ? 'Заказов пока нет' : 'Заказы по вашему запросу не найдены'}
          </Typography>
          {orders.length > 0 && (
            <Button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
                setAmountFilter('all');
              }}
              sx={{ mt: 1 }}
            >
              Сбросить фильтры
            </Button>
          )}
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
              {filteredOrders.map((order) => (
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