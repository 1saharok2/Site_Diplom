import React, { useState, useEffect } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  People as UsersIcon,
  Category as ProductsIcon,
  TrendingUp as StatsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
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
            {loading ? '-' : value.toLocaleString()}
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
  const theme = useTheme();

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Всего заказов',
      value: stats.totalOrders,
      icon: <OrdersIcon />,
      color: theme.palette.primary.main
    },
    {
      title: 'Товары',
      value: stats.totalProducts,
      icon: <ProductsIcon />,
      color: theme.palette.success.main
    },
    {
      title: 'Пользователи',
      value: stats.totalUsers,
      icon: <UsersIcon />,
      color: theme.palette.info.main
    },
    {
      title: 'Общие продажи',
      value: stats.totalSales,
      icon: <StatsIcon />,
      color: theme.palette.warning.main,
      format: value => `${value.toLocaleString()} ₽`
    }
  ];

  return (
    <Box>
      {/* Заголовок */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Панель управления
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
              value={card.format ? card.format(card.value) : card.value}
              icon={card.icon}
              color={card.color}
              loading={loading && !refreshing}
            />
          </Grid>
        ))}
      </Grid>

      {/* Быстрые действия */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Последние заказы
            </Typography>
            {stats.recentOrders.length > 0 ? (
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
                          Заказ #{order.order_number}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {order.customer_name} • {order.customer_email}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'processing' ? 'primary' : 'default'
                          }
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {order.total_amount} ₽
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary" textAlign="center" py={4}>
                {loading ? 'Загрузка заказов...' : 'Заказов не найдено'}
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Быстрые действия
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {[
                { label: 'Добавить товар', icon: '➕', path: '/admin/products/new' },
                { label: 'Просмотреть заказы', icon: '📦', path: '/admin/orders' },
                { label: 'Управление пользователями', icon: '👥', path: '/admin/users' },
                { label: 'Категории товаров', icon: '📁', path: '/admin/categories' }
              ].map((action, index) => (
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
                  onClick={() => window.location.href = action.path}
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