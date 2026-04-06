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
  CircularProgress,
  useMediaQuery // Добавляем useMediaQuery для адаптивности
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

// Компонент карточки статистики (без изменений логики, только стили)
const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box>
          <Typography color="textSecondary" variant="overline" sx={{ lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600, mt: 0.5 }}>
            {loading ? <CircularProgress size={20} /> : value}
          </Typography>
        </Box>
        <Box
          sx={{
            color: color,
            backgroundColor: `${color}15`, // Более прозрачный фон
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {React.cloneElement(icon, { fontSize: "small" })} {/* Уменьшаем иконку */}
        </Box>
      </Box>
      {loading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
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
  // Хук для определения мобильного устройства (меньше sm breakpoint - 600px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchStats = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const token =
        localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
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
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2, color: 'text.secondary' }}>Загрузка статистики...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: isMobile ? 8 : 0 }}> {/* Отступ снизу на мобильных, если есть нижняя навигация */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }} 
          action={
            <Button color="inherit" size="small" onClick={fetchStats} disabled={refreshing}>
              Повторить
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {/* Заголовок дашборда */}
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={{ xs: 2, md: 3 }} // Меньше отступ на мобильных
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Скрываем большую иконку на очень маленьких экранах */}
          <DashboardIcon sx={{ fontSize: { xs: 24, md: 32 }, color: 'primary.main', display: { xs: 'none', sm: 'block' } }} />
          <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: 700 }}>
            {isMobile ? 'Дашборд' : 'Статистика магазина'}
          </Typography>
        </Box>
        
        <IconButton 
          onClick={fetchStats} 
          disabled={refreshing}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' },
            boxShadow: 2
          }}
        >
          <RefreshIcon fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Box>

      {/* Сетка статистики */}
      {/* Используем spacing={2} на мобильных для компактности */}
      <Grid container spacing={{ xs: 2, md: 3 }} mb={{ xs: 3, md: 4 }}>
        {statCards.map((card, index) => (
          <Grid key={index} size={{ xs: 6, sm: 6, md: 3 }}> {/* xs={6} - по 2 карточки в ряд на мобильном */}
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
      <Grid container spacing={{ xs: 2, md: 3 }}>
        
        {/* Последние заказы */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, height: '100%', borderRadius: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Последние заказы
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/admin/orders')}
                sx={{ display: { xs: 'flex', sm: 'none' } }} // Кнопка "Все" на мобильном
              >
                Все
              </Button>
            </Box>
            
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <Box>
                {stats.recentOrders.map((order) => (
                  <Box
                    key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)} // Делаем кликабельным весь блок
                    sx={{
                      p: 2,
                      mb: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderColor: 'primary.light',
                        transform: 'translateY(-2px)',
                        boxShadow: 1
                      }
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            #{order.order_number || order.id}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(order.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.primary" noWrap sx={{ maxWidth: '200px' }}>
                          {order.customer_name || 'Клиент'}
                        </Typography>
                        {!isMobile && (
                           <Typography variant="caption" color="text.secondary">
                             {order.customer_email}
                           </Typography>
                        )}
                      </Box>
                      
                      <Box textAlign="right" display="flex" flexDirection="column" alignItems="flex-end">
                        <Chip
                          label={order.status === 'delivered' ? 'Доставлен' : 'В обработке'}
                          size="small"
                          color={order.status === 'delivered' ? 'success' : 'primary'}
                          sx={{ height: 24, fontSize: '0.75rem', mb: 0.5 }}
                        />
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {order.total_amount ? `${order.total_amount.toLocaleString('ru-RU')} ₽` : '0 ₽'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
                
                {/* Кнопка "Смотреть все" для десктопа */}
                <Box mt={2} display={{ xs: 'none', sm: 'flex' }} justifyContent="center">
                   <Button variant="text" onClick={() => navigate('/admin/orders')}>
                     Смотреть все заказы
                   </Button>
                </Box>
              </Box>
            ) : (
              <Box textAlign="center" py={4} sx={{ opacity: 0.7 }}>
                <OrdersIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Заказов пока нет
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Быстрые действия */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Быстрые действия
            </Typography>
            <Grid container spacing={2}> {/* Используем Grid внутри для действий */}
              {quickActions.map((action, index) => (
                <Grid key={index} size={{ xs: 6, sm: 6, lg: 12 }}> {/* На мобильных по 2 в ряд, на десктопе в колонку */}
                  <Box
                    onClick={action.onClick}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      height: '100%', // Одинаковая высота
                      '&:hover': {
                        backgroundColor: 'primary.50', // Светлый фон при наведении
                        borderColor: 'primary.main',
                        transform: { xs: 'none', md: 'translateX(4px)' }
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        fontSize: '1.5rem', 
                        lineHeight: 1,
                        bgcolor: 'background.paper',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 1
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="body2" fontWeight="500">
                      {action.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;