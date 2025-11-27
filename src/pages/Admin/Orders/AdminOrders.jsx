import React, { useState, useEffect, useCallback } from 'react';
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
  OutlinedInput,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippedIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  AccessTime as PendingIcon,
  Settings as ProcessingIcon
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

// =================================================================
// 🚀 1. ФУНКЦИИ СТАТУСА (ВЫНЕСЕНЫ ИЗ КОМПОНЕНТА)
// =================================================================

const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'shipped': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default'; // Это значение для чипа, а не для theme.palette
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
      case 'completed': return <CompleteIcon fontSize="small" />;
      case 'processing': return <ProcessingIcon fontSize="small" />;
      case 'shipped': return <ShippedIcon fontSize="small" />;
      case 'pending': return <PendingIcon fontSize="small" />;
      case 'cancelled': return <CancelIcon fontSize="small" />;
      default: return <PendingIcon fontSize="small" />; // Иконка по умолчанию
    }
};

// =================================================================
// 🚀 2. MOBILEORDERCARD (ВЫНЕСЕН ИЗ КОМПОНЕНТА)
// =================================================================

const MobileOrderCard = ({ order, handleMenuOpen, viewOrderDetails, updateOrderStatus, theme }) => {
    const statusColorKey = getStatusColor(order.status);
    
    // 🔥 ИСПРАВЛЕНИЕ: Вычисляем цвет бордера безопасно
    const borderColor = statusColorKey === 'default' 
        ? theme.palette.grey[400] // Используем нейтральный цвет из палитры 'grey'
        : theme.palette[statusColorKey]?.main || theme.palette.grey[400]; // Защита на случай, если цвет не найден
        
    return (
      <Card 
        key={order.id} 
        sx={{ 
          mb: 2, 
          p: 2, 
          borderLeft: `4px solid ${borderColor}`,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Заказ #{order.order_number || order.id}
            </Typography>
            <Chip
              icon={getStatusIcon(order.status)}
              label={getStatusText(order.status)}
              color={statusColorKey} // Используем 'default', 'primary' и т.д.
              variant="outlined"
              size="small"
              sx={{ mt: 0.5, mb: 1 }}
            />
          </Box>
          <Box textAlign="right">
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              {order.total_amount?.toLocaleString('ru-RU')} ₽
            </Typography>
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, order.id)}>
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body2">
          **Клиент:** {order.customer_name || order.user_email || 'Гость'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          **Дата:** {new Date(order.created_at).toLocaleDateString('ru-RU')}
        </Typography>
        
        <Box mt={1} display="flex" justifyContent="space-between">
          <Button 
            size="small" 
            variant="text" 
            startIcon={<ViewIcon />} 
            onClick={() => viewOrderDetails(order)}
          >
            Детали
          </Button>
          <Button 
            size="small" 
            variant="contained"
            onClick={() => updateOrderStatus(order.id, 'processing')}
            disabled={order.status === 'processing'}
            color="primary"
          >
            Обработать
          </Button>
        </Box>
      </Card>
    );
};


// =================================================================
// 3. КОМПОНЕНТ ADMINORDERS (ОЧИЩЕННЫЙ)
// =================================================================

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

  const theme = useTheme();
  // Медиа-запрос для определения мобильных устройств (ширина меньше md)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔥 УДАЛЕНЫ ФУНКЦИИ getStatusColor, getStatusText, getStatusIcon из компонента AdminOrders

  const filterOrders = useCallback(() => {
    // ... (оставшаяся логика filterOrders без изменений)
    let filtered = [...orders];

    // Поиск по номеру заказа, имени клиента, email, телефону
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        (order.order_number?.toString().includes(term)) ||
        (order.customer_name?.toLowerCase().includes(term)) ||
        (order.user_email?.toLowerCase().includes(term)) ||
        (order.customer_phone?.includes(term))
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
    
    // Сортировка по дате (самые новые сверху)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter, amountFilter]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);
  // ... (оставшийся код функций fetchOrders, updateOrderStatus, deleteOrder и т.д. без изменений)

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
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
      handleMenuClose();
      await adminService.updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Обновляем данные после изменения
      setSuccessMessage(`Статус заказа #${orders.find(o => o.id === orderId)?.order_number || orderId} обновлен до "${getStatusText(newStatus)}"`);
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
      await fetchOrders(); // Обновляем данные после удаления
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2, color: 'text.secondary' }}>Загрузка заказов...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Управление заказами 📦
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchOrders}
          size={isMobile ? "small" : "medium"}
        >
          Обновить
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { title: 'Всего', count: stats.total, color: '#667eea', icon: 'Total' },
          { title: 'Ожидание', count: stats.pending, color: '#f59e0b', icon: 'Pending' },
          { title: 'В обр.', count: stats.processing, color: '#3b82f6', icon: 'Processing' },
          { title: 'Завершены', count: stats.completed, color: '#10b981', icon: 'Completed' },
          { title: 'Отменены', count: stats.cancelled, color: '#ef4444', icon: 'Cancelled' },
        ].map((stat, index) => (
          // На мобильных по 3 в ряд, на десктопе по 5
          <Grid item xs={4} sm={2} md={2.4} key={index}> 
            <Card sx={{ background: stat.color, color: 'white', borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="h6" sx={{ lineHeight: 1 }}>{stat.count}</Typography>
                <Typography variant="caption" sx={{ lineHeight: 1, display: 'block' }}>{stat.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Панель поиска и фильтров */}
      <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
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
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                input={<OutlinedInput label="Статус" />}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="pending">Ожидание</MenuItem>
                <MenuItem value="processing">В обработке</MenuItem>
                <MenuItem value="shipped">Отправлен</MenuItem>
                <MenuItem value="completed">Завершен</MenuItem>
                <MenuItem value="cancelled">Отменен</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
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
            size="small"
            sx={{ fontWeight: 'bold' }}
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
            size="small"
          />
          <Chip
            label={`Ожидание (${stats.pending})`}
            onClick={() => setStatusFilter('pending')}
            color={statusFilter === 'pending' ? 'warning' : 'default'}
            clickable
            size="small"
          />
          <Chip
            label={`В обработке (${stats.processing})`}
            onClick={() => setStatusFilter('processing')}
            color={statusFilter === 'processing' ? 'primary' : 'default'}
            clickable
            size="small"
          />
        </Box>
      </Paper>

      {/* Результаты поиска */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body1" color="text.primary" fontWeight="bold">
          Найдено заказов: {filteredOrders.length}
        </Typography>
        {filteredOrders.length < orders.length && (
          <Button 
            size="small" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('all');
              setAmountFilter('all');
            }}
          >
            Сбросить
          </Button>
        )}
      </Box>

      {/* Отображение заказов (Адаптивное) */}
      {filteredOrders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {orders.length === 0 ? 'Заказов пока нет' : 'Заказы по вашему запросу не найдены'}
          </Typography>
        </Paper>
      ) : isMobile ? (
        // Мобильное представление
        <Box>
          {filteredOrders.map((order) => (
            <MobileOrderCard 
              key={order.id} 
              order={order} 
              handleMenuOpen={handleMenuOpen} 
              viewOrderDetails={viewOrderDetails}
              updateOrderStatus={updateOrderStatus}
              theme={theme}
              // 🔥 УДАЛЕНЫ НЕНУЖНЫЕ ПРОПСЫ, так как функции вынесены выше
            />
          ))}
        </Box>
      ) : (
        // Десктопное представление (Таблица)
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>№ Заказа</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Клиент</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Действия</TableCell>
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
                      {order.customer_name || 'Гость'}
                    </Typography>
                    {order.user_email && (
                      <Typography variant="body2" color="text.secondary">
                        {order.user_email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" color="primary.dark">
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
                      {new Date(order.created_at).toLocaleTimeString('ru-RU').substring(0, 5)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box display="flex" gap={1} justifyContent="center" alignItems="center">
                      <IconButton
                        size="small"
                        onClick={() => viewOrderDetails(order)}
                        title="Просмотреть детали"
                        sx={{ color: 'primary.main' }}
                      >
                        <ViewIcon />
                      </IconButton>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={order.status === 'processing'}
                        sx={{ minWidth: 'auto', p: '4px 8px' }}
                      >
                        Обработать
                      </Button>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, order.id)}
                        title="Дополнительные действия"
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Меню дополнительных действий (без изменений) */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) updateOrderStatus(order.id, 'shipped');
        }}>
          <ListItemIcon><ShippedIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Отправить</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) updateOrderStatus(order.id, 'completed');
        }}>
          <ListItemIcon><CompleteIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Завершить заказ</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) updateOrderStatus(order.id, 'cancelled');
        }}>
          <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Отменить заказ</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) handleDeleteClick(order);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
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
            Вы уверены, что хотите удалить заказ **#{orderToDelete?.order_number || orderToDelete?.id}**?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Клиент: {orderToDelete?.customer_name || 'Гость'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Сумма: **{orderToDelete?.total_amount?.toLocaleString('ru-RU')} ₽**
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
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Детали заказа **#{selectedOrder?.order_number || selectedOrder?.id}**
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom color="primary.dark">
                Информация о клиенте
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}><Typography>Имя: **{selectedOrder.customer_name || 'Не указано'}**</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography>Email: **{selectedOrder.user_email || 'Не указан'}**</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography>Телефон: **{selectedOrder.customer_phone || 'Не указан'}**</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography>Статус: **{getStatusText(selectedOrder.status)}**</Typography></Grid>
              </Grid>
              
              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom color="primary.dark">
                Товары
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Товар</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: 80 }}>Кол-во</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: 100, textAlign: 'right' }}>Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.order_items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          {(item.price * item.quantity)?.toLocaleString('ru-RU')} ₽
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography 
                variant="h5" 
                sx={{ mt: 3, textAlign: 'right', color: 'error.main' }}
              >
                ИТОГО: **{selectedOrder.total_amount?.toLocaleString('ru-RU')} ₽**
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)} variant="outlined">Закрыть</Button>
          <Button 
            onClick={() => { updateOrderStatus(selectedOrder.id, 'processing'); setDetailDialogOpen(false); }}
            variant="contained"
            disabled={selectedOrder?.status === 'processing'}
          >
            Перевести в обработку
          </Button>
        </DialogActions>
      </Dialog>

      {/* Уведомление об успехе */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccessMessage('')}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminOrders;