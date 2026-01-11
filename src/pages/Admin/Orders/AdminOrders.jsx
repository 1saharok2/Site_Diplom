import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  useTheme,
  alpha // Добавлен для прозрачности цветов
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
    case 'completed': return <CompleteIcon fontSize="small" />;
    case 'processing': return <ProcessingIcon fontSize="small" />;
    case 'shipped': return <ShippedIcon fontSize="small" />;
    case 'pending': return <PendingIcon fontSize="small" />;
    case 'cancelled': return <CancelIcon fontSize="small" />;
    default: return <PendingIcon fontSize="small" />;
  }
};

// =================================================================
// 🚀 2. MOBILEORDERCARD (ВЫНЕСЕН ИЗ КОМПОНЕНТА)
// =================================================================

const MobileOrderCard = ({ order, handleMenuOpen, viewOrderDetails, updateOrderStatus, theme }) => {
  const statusColorKey = getStatusColor(order.status);
  
  // Безопасное получение цвета из темы
  const getBorderColor = () => {
    if (statusColorKey === 'default') {
      return theme.palette.grey[400];
    }
    
    const color = theme.palette[statusColorKey];
    return color ? color.main : theme.palette.grey[400];
  };

  return (
    <Card 
      key={order.id} 
      sx={{ 
        mb: 2, 
        p: 2, 
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: 2,
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
        }
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
            color={statusColorKey}
            variant="outlined"
            size="small"
            sx={{ mt: 0.5, mb: 1 }}
          />
        </Box>
        <Box textAlign="right">
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            {order.total_amount ? order.total_amount.toLocaleString('ru-RU') : 0} ₽
          </Typography>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleMenuOpen(e, order.id);
            }}
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>Клиент:</strong> {order.customer_name || order.user_email || 'Гость'}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <strong>Дата:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString('ru-RU') : 'Нет данных'}
      </Typography>
      
      <Box mt={1} display="flex" justifyContent="space-between">
        <Button 
          size="small" 
          variant="outlined" 
          startIcon={<ViewIcon />} 
          onClick={() => viewOrderDetails(order)}
        >
          Детали
        </Button>
        <Button 
          size="small" 
          variant="contained"
          onClick={(e) => {
            e.stopPropagation();
            updateOrderStatus(order.id, 'processing');
          }}
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
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // Для мобильного меню

  // Состояния для поиска и фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState('all');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Загрузка заказов
  useEffect(() => {
    fetchOrders();
  }, []);

  // Фильтрация заказов
  const filterOrders = useCallback(() => {
    if (!orders || !Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Поиск
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        return (
          (order.order_number?.toString().toLowerCase().includes(term)) ||
          (order.customer_name?.toLowerCase().includes(term)) ||
          (order.user_email?.toLowerCase().includes(term)) ||
          (order.customer_phone?.toString().includes(term))
        );
      });
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Фильтр по дате
    if (dateFilter !== 'all') {
      const now = new Date();
      
      filtered = filtered.filter(order => {
        if (!order.created_at) return false;
        
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
        const amount = order.total_amount || 0;
        switch (amountFilter) {
          case 'low':
            return amount < 1000;
          case 'medium':
            return amount >= 1000 && amount < 5000;
          case 'high':
            return amount >= 5000;
          default:
            return true;
        }
      });
    }
    
    // Сортировка по дате (самые новые сверху)
    filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      return dateB - dateA;
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, dateFilter, amountFilter]);

  // Применение фильтров при изменении зависимостей
  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getOrders();
      
      // ❗ Важно: проверяем, как именно пришли данные. 
      // Если PHP возвращает { success: true, data: [...] }, берем response.data
      const ordersArray = Array.isArray(response) 
        ? response 
        : (response && response.data ? response.data : []);
        
      setOrders(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Если это не ошибка 401 (которую обработает сам сервис), показываем текст
      if (!error.message.includes('401')) {
        setError('Не удалось загрузить список заказов');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      handleMenuClose();
      handleMobileMenuClose();
      await adminService.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSuccessMessage(`Статус заказа #${order.order_number || orderId} обновлен до "${getStatusText(newStatus)}"`);
      }
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
      setOrderToDelete(null);
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Ошибка при удалении заказа');
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
    setMenuAnchorEl(null);
  };

  const handleMenuOpen = (event, orderId) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId(null);
  };

  const handleMobileMenuOpen = (event, orderId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMobileMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedOrderId(null);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
    handleMenuClose();
    handleMobileMenuClose();
  };

  // Статистика с useMemo для оптимизации
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const processing = orders.filter(order => order.status === 'processing').length;
    const shipped = orders.filter(order => order.status === 'shipped').length;
    const completed = orders.filter(order => order.status === 'completed').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;

    return { total, pending, processing, shipped, completed, cancelled };
  }, [orders]);

  const statCards = [
    { title: 'Всего', count: stats.total, color: alpha(theme.palette.primary.main, 0.8), icon: '📊' },
    { title: 'Ожидание', count: stats.pending, color: alpha(theme.palette.warning.main, 0.8), icon: '⏳' },
    { title: 'В обр.', count: stats.processing, color: alpha(theme.palette.info.main, 0.8), icon: '⚙️' },
    { title: 'Отправлено', count: stats.shipped, color: alpha(theme.palette.secondary.main, 0.8), icon: '🚚' },
    { title: 'Завершены', count: stats.completed, color: alpha(theme.palette.success.main, 0.8), icon: '✅' },
    { title: 'Отменены', count: stats.cancelled, color: alpha(theme.palette.error.main, 0.8), icon: '❌' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={50} />
        <Typography sx={{ ml: 2, color: 'text.secondary' }}>
          Загрузка заказов...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 3 }}>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
          📦 Управление заказами
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

      {/* Уведомления об ошибках */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: 2 }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={6} sm={4} md={2} key={index}>
            <Card 
              sx={{ 
                background: stat.color, 
                color: 'white', 
                borderRadius: 2, 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="h4" sx={{ lineHeight: 1, mb: 0.5 }}>
                  {stat.count}
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1, opacity: 0.9 }}>
                  {stat.icon} {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Панель поиска и фильтров */}
      <Paper sx={{ p: isMobile ? 1.5 : 2, mb: 3, borderRadius: 2 }}>
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
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setSearchTerm('')}
                    >
                      ✕
                    </IconButton>
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

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Дата</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                input={<OutlinedInput label="Дата" />}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="today">Сегодня</MenuItem>
                <MenuItem value="week">Неделя</MenuItem>
                <MenuItem value="month">Месяц</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Сумма</InputLabel>
              <Select
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                input={<OutlinedInput label="Сумма" />}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="low">До 1 000 ₽</MenuItem>
                <MenuItem value="medium">1 000 - 5 000 ₽</MenuItem>
                <MenuItem value="high">От 5 000 ₽</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
                setAmountFilter('all');
              }}
              size={isMobile ? "small" : "medium"}
            >
              Сбросить
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Результаты поиска */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" color="text.primary" fontWeight="bold">
          Результаты: {filteredOrders.length} заказа(ов)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Всего заказов: {orders.length}
        </Typography>
      </Box>

      {/* Отображение заказов */}
      {filteredOrders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {orders.length === 0 ? 'Заказов пока нет' : 'Заказы по вашему запросу не найдены'}
          </Typography>
          {orders.length > 0 && (
            <Button 
              variant="text" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
                setAmountFilter('all');
              }}
            >
              Показать все заказы
            </Button>
          )}
        </Paper>
      ) : isMobile ? (
        // Мобильное представление
        <Box>
          {filteredOrders.map((order) => (
            <div key={order.id} onClick={() => viewOrderDetails(order)}>
              <MobileOrderCard 
                order={order} 
                handleMenuOpen={handleMobileMenuOpen} 
                viewOrderDetails={viewOrderDetails}
                updateOrderStatus={updateOrderStatus}
                theme={theme}
              />
            </div>
          ))}
        </Box>
      ) : (
        // Десктопное представление
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>№ Заказа</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Клиент</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 140 }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 'bold', minWidth: 200, textAlign: 'center' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order.id} 
                  hover
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
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
                      {order.total_amount ? order.total_amount.toLocaleString('ru-RU') : 0} ₽
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={getStatusText(order.status)}
                      color={getStatusColor(order.status)}
                      variant="outlined"
                      size="small"
                      sx={{ minWidth: 120 }}
                    />
                  </TableCell>
                  <TableCell>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('ru-RU') : '—'}
                    <Typography variant="body2" color="text.secondary">
                      {order.created_at ? new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
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
                        variant="contained"
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        disabled={order.status === 'processing'}
                        sx={{ minWidth: 'auto', px: 2 }}
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

      {/* Меню дополнительных действий для десктопа */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          if (selectedOrderId) updateOrderStatus(selectedOrderId, 'shipped');
        }}>
          <ListItemIcon><ShippedIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Отправить</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedOrderId) updateOrderStatus(selectedOrderId, 'completed');
        }}>
          <ListItemIcon><CompleteIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Завершить</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          if (selectedOrderId) updateOrderStatus(selectedOrderId, 'cancelled');
        }}>
          <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Отменить</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) handleDeleteClick(order);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Меню для мобильных */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMobileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          if (selectedOrderId) updateOrderStatus(selectedOrderId, 'shipped');
        }}>
          <ListItemIcon><ShippedIcon fontSize="small" color="info" /></ListItemIcon>
          <ListItemText>Отправить</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedOrderId) updateOrderStatus(selectedOrderId, 'completed');
        }}>
          <ListItemIcon><CompleteIcon fontSize="small" color="success" /></ListItemIcon>
          <ListItemText>Завершить</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          if (selectedOrderId) updateOrderStatus(selectedOrderId, 'cancelled');
        }}>
          <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Отменить</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (order) handleDeleteClick(order);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Удалить</ListItemText>
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
            Вы уверены, что хотите удалить заказ <strong>#{orderToDelete?.order_number || orderToDelete?.id}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Клиент: {orderToDelete?.customer_name || 'Гость'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Сумма: <strong>{orderToDelete?.total_amount ? orderToDelete.total_amount.toLocaleString('ru-RU') : 0} ₽</strong>
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
        scroll="paper"
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          Детали заказа #{selectedOrder?.order_number || selectedOrder?.id}
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              {/* Информация о клиенте */}
              <Typography variant="h6" gutterBottom color="primary.dark" sx={{ mb: 2 }}>
                Информация о клиенте
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Имя:</strong> {selectedOrder.customer_name || 'Не указано'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Email:</strong> {selectedOrder.user_email || 'Не указан'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Телефон:</strong> {selectedOrder.customer_phone || 'Не указан'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Статус:</strong> {getStatusText(selectedOrder.status)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Адрес доставки:</strong> {selectedOrder.shipping_address || 'Не указан'}</Typography>
                </Grid>
              </Grid>
              
              {/* Товары */}
              <Typography variant="h6" gutterBottom color="primary.dark" sx={{ mb: 2 }}>
                Товары ({selectedOrder.items?.length || 0})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Товар</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: 100 }}>Кол-во</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: 120, textAlign: 'right' }}>Цена</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', width: 120, textAlign: 'right' }}>Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {item.product_name || item.name || `Товар #${item.product_id || index + 1}`}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          {item.price ? item.price.toLocaleString('ru-RU') : 0} ₽
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontWeight: 'bold' }}>
                          {(item.price * item.quantity)?.toLocaleString('ru-RU')} ₽
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Итоговая сумма */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ textAlign: 'right', color: 'error.main' }}>
                  ИТОГО: {selectedOrder.total_amount ? selectedOrder.total_amount.toLocaleString('ru-RU') : 0} ₽
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
          <Button 
            onClick={() => setDetailDialogOpen(false)} 
            variant="outlined"
          >
            Закрыть
          </Button>
          <Button 
            onClick={() => {
              updateOrderStatus(selectedOrder.id, 'processing');
              setDetailDialogOpen(false);
            }}
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
        autoHideDuration={4000}
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