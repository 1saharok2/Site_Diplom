import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  useTheme,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  People as UsersIcon,
  Inventory as ProductsIcon,
  Refresh as RefreshIcon,
  PointOfSale
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {loading ? <CircularProgress size={24} /> : value}
          </Typography>
        </Box>
        <Box
          sx={{
            color: color,
            backgroundColor: `${color}20`,
            padding: '12px',
            borderRadius: '12px'
          }}
        >
          {icon}
        </Box>
      </Box>
      {loading && <LinearProgress sx={{ mt: 1 }} />}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalSales: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      setError(error.message || 'Ошибка при загрузке данных');    
      if (error.message.includes('авторизация') || error.message.includes('401')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    {
      title: 'Всего заказов',
      value: stats.totalOrders.toLocaleString('ru-RU'),
      icon: <OrdersIcon />,
      color: theme.palette.primary.main
    },
    {
      title: 'Товары',
      value: stats.totalProducts.toLocaleString('ru-RU'),
      icon: <ProductsIcon />,
      color: theme.palette.success.main
    },
    {
      title: 'Пользователи',
      value: stats.totalUsers.toLocaleString('ru-RU'),
      icon: <UsersIcon />,
      color: theme.palette.info.main
    },
    {
      title: 'Общие продажи',
      value: `${stats.totalSales.toLocaleString('ru-RU')} ₽`,
      icon: <PointOfSale />,
      color: theme.palette.warning.main
    }
  ];

  const quickActions = [
    { 
      label: 'Добавить товар', 
      icon: '➕', 
      onClick: () => navigate('/admin/products/new') 
    },
    { 
      label: 'Просмотреть заказы', 
      icon: '📦', 
      onClick: () => navigate('/admin/orders') 
    },
    { 
      label: 'Управление пользователями', 
      icon: '👥', 
      onClick: () => navigate('/admin/users') 
    },
    { 
      label: 'Категории товаров', 
      icon: '📁', 
      onClick: () => navigate('/admin/categories') 
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Загрузка статистики...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchStats}
              disabled={refreshing}
            >
              Повторить
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Заголовок дашборда */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Статистика магазина
          </Typography>
        </Box>
        <IconButton 
          onClick={fetchStats} 
          disabled={refreshing}
          sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              loading={refreshing}
            />
          </Grid>
        ))}
      </Grid>

      {/* Основной контент */}
      <Grid container spacing={3}>
        {/* Последние заказы */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Последние заказы
            </Typography>
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <Box>
                {stats.recentOrders.map((order) => (
                  <Box
                    key={order.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2">
                          Заказ #{order.order_number || order.id}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {order.customer_name || 'Клиент'} • {order.customer_email || 'Email не указан'}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Chip
                          label={order.status === 'delivered' ? 'Доставлен' : 'В обработке'}
                          size="small"
                          color={
                            order.status === 'delivered' ? 'success' : 'primary'
                          }
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {order.total_amount ? `${order.total_amount.toLocaleString('ru-RU')} ₽` : '0 ₽'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <OrdersIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Заказов не найдено
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/admin/orders')}
                >
                  Перейти к заказам
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Быстрые действия */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Быстрые действия
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {quickActions.map((action, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      transform: 'translateX(4px)'
                    }
                  }}
                  onClick={action.onClick}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">{action.icon}</Typography>
                    <Typography variant="body1">{action.label}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;