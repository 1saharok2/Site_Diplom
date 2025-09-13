import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Box,
  Chip,
  Avatar
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  ShoppingCart,
  People,
  Category,
  ExitToApp,
  Home,
  Store
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const menuItems = [
  { text: 'Статистика', icon: <Dashboard />, path: '/admin/dashboard' },
  { text: 'Товары', icon: <Inventory />, path: '/admin/products' },
  { text: 'Заказы', icon: <ShoppingCart />, path: '/admin/orders' },
  { text: 'Пользователи', icon: <People />, path: '/admin/users' },
  { text: 'Категории', icon: <Category />, path: '/admin/categories' },
];

const AdminSidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToHome = () => {
    navigate('/');
    onItemClick && onItemClick();
  };

  const handleNavigate = (path) => {
    navigate(path);
    onItemClick && onItemClick();
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #1a237e 0%, #283593 100%)', // Более темный градиент
      color: 'white',
      overflow: 'hidden' // Убираем скролл внутри сайдбара
    }}>
      {/* Заголовок с логотипом - УБИРАЕМ БЕЛУЮ ПОЛОСУ */}
      <Box sx={{ 
        p: 2, 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'transparent' // Убираем любой фон
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Store sx={{ fontSize: 28, mr: 1, color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            АДМИН ПАНЕЛЬ
          </Typography>
        </Box>
        
        {/* Информация о пользователе */}
        {user && (
          <Box sx={{ mt: 1 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40, 
                margin: '0 auto',
                bgcolor: '#3949ab',
                fontSize: '1rem'
              }}
            >
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
                fontSize: '0.65rem',
                height: '20px'
              }} 
            />
          </Box>
        )}
      </Box>
      
      {/* Основное меню с прокруткой */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        py: 1,
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'rgba(255,255,255,0.1)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px',
        },
      }}>
        <List sx={{ pb: 8 }}> {/* Добавляем отступ снизу для кнопок */}
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  py: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    }
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: '0.9rem',
                      fontWeight: location.pathname === item.path ? '600' : '400'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* ФИКСИРОВАННЫЕ кнопки внизу */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, transparent 0%, #1a237e 100%)',
        p: 1.5,
        zIndex: 10
      }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 1 }} />
        
        <List sx={{ p: 0 }}>
          {/* Кнопка для перехода на главную страницу */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={handleGoToHome}
              sx={{
                borderRadius: 1,
                py: 1.2,
                backgroundColor: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                <Home sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="На главную сайта" 
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '0.85rem'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
          
          {/* Кнопка выхода */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                py: 1.2,
                backgroundColor: 'rgba(255,255,255,0.05)',
                '&:hover': {
                  backgroundColor: 'rgba(255,99,71,0.2)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                <ExitToApp sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Выйти из системы" 
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '0.85rem'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default AdminSidebar;