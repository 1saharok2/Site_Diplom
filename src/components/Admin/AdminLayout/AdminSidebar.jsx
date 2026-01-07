import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Avatar,
  Badge
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  ShoppingCart,
  People,
  Category,
  RateReview,
  Home,
  ExitToApp,
  Store,
  SupportAgent // Новый иконка для обращений
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useReviews } from '../../../context/ReviewContext';
import { adminService } from '../../../services/adminService';

// Создайте хук для получения статистики обращений
const useSupportStats = () => {
  const [stats, setStats] = React.useState({ new: 0, urgent: 0, total: 0 });

  React.useEffect(() => {
    const fetchSupportStats = async () => {
      try {
        const response = await adminService.getSupportStats();
        setStats(response);
      } catch (error) {
        console.error('Error fetching support stats:', error);
      }
    };

    fetchSupportStats();
    
    // Обновление статистики каждые 30 секунд
    const interval = setInterval(fetchSupportStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return stats;
};

const AdminSidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { moderationReviews } = useReviews();
  const supportStats = useSupportStats();

  const pendingReviewsCount = moderationReviews.filter(review => review.status === 'pending').length;
  
  // Общее количество новых/срочных обращений
  const totalSupportNotifications = supportStats.new + supportStats.urgent;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/');
    if (onItemClick) onItemClick();
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  // Обновленный список пунктов меню
  const menuItems = [
    { text: 'Статистика', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Товары', icon: <Inventory />, path: '/admin/products' },
    { text: 'Заказы', icon: <ShoppingCart />, path: '/admin/orders' },
    { text: 'Пользователи', icon: <People />, path: '/admin/users' },
    { text: 'Категории', icon: <Category />, path: '/admin/categories' },
    { 
      text: 'Обращения в поддержку', 
      icon: <SupportAgent />, 
      path: '/admin/support',
      badgeCount: totalSupportNotifications,
      badgeColor: supportStats.urgent > 0 ? 'error' : 'info'
    },
    { 
      text: 'Модерация отзывов', 
      icon: <RateReview />, 
      path: '/admin/reviews',
      badgeCount: pendingReviewsCount,
      badgeColor: 'warning'
    },
  ];

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #1a237e 0%, #283593 100%)',
      color: 'white',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {/* Заголовок */}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Store sx={{ fontSize: 28, mr: 1, color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            АДМИН ПАНЕЛЬ
          </Typography>
        </Box>
        
        {user && (
          <Box sx={{ mt: 1 }}>
            <Avatar sx={{ width: 40, height: 40, margin: '0 auto', bgcolor: '#3949ab' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </Avatar>
            <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'medium', fontSize: '0.8rem' }}>
              {user.name || 'Администратор'}
            </Typography>
            <Chip 
              label="Админ" 
              size="small" 
              sx={{ 
                mt: 0.5, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white', 
                height: '20px', 
                fontSize: '0.65rem' 
              }} 
            />
          </Box>
        )}
      </Box>
      
      {/* Меню */}
      <Box sx={{ flex: 1, py: 1 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': { 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } 
                  },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40, position: 'relative' }}>
                  {item.badgeCount > 0 ? (
                    <Badge 
                      badgeContent={item.badgeCount} 
                      color={item.badgeColor}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: '18px',
                          minWidth: '18px',
                        }
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.9rem',
                      fontWeight: item.badgeCount > 0 ? 600 : 400,
                    }
                  }}
                />
                {item.badgeCount > 0 && item.text === 'Обращения в поддержку' && supportStats.urgent > 0 && (
                  <Chip 
                    label={`${supportStats.urgent} срочных`}
                    size="small"
                    color="error"
                    sx={{
                      ml: 1,
                      height: '20px',
                      fontSize: '0.6rem',
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Статистика в реальном времени (опционально) */}
      <Box sx={{ 
        p: 1.5, 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0 
      }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 1 }}>
          Статус системы:
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Chip 
              label={pendingReviewsCount} 
              size="small" 
              color={pendingReviewsCount > 0 ? "warning" : "default"}
              sx={{ 
                height: '20px', 
                fontSize: '0.7rem',
                bgcolor: pendingReviewsCount > 0 ? 'rgba(255,193,7,0.2)' : 'rgba(255,255,255,0.1)',
                color: 'white'
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mt: 0.5 }}>
              Отзывы
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Chip 
              label={supportStats.new} 
              size="small" 
              color={supportStats.new > 0 ? "info" : "default"}
              sx={{ 
                height: '20px', 
                fontSize: '0.7rem',
                bgcolor: supportStats.new > 0 ? 'rgba(33,150,243,0.2)' : 'rgba(255,255,255,0.1)',
                color: 'white'
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mt: 0.5 }}>
              Новые
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Chip 
              label={supportStats.urgent} 
              size="small" 
              color={supportStats.urgent > 0 ? "error" : "default"}
              sx={{ 
                height: '20px', 
                fontSize: '0.7rem',
                bgcolor: supportStats.urgent > 0 ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.1)',
                color: 'white'
              }}
            />
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mt: 0.5 }}>
              Срочные
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Футер */}
      <Box sx={{ p: 1.5, flexShrink: 0 }}>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={handleGoToHome} 
              sx={{ 
                borderRadius: 1, 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                <Home />
              </ListItemIcon>
              <ListItemText primary="На сайт" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout} 
              sx={{ 
                borderRadius: 1, 
                '&:hover': { bgcolor: 'rgba(255,99,71,0.2)' } 
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText primary="Выйти" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default AdminSidebar;