import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
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
import Sidebar from '../Sidebar/Sidebar';

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
      width: 280, // Фиксированная ширина
      minWidth: 280,
      height: '100vh',
      position: 'fixed', // Фиксированное позиционирование
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #1a237e 0%, #283593 100%)',
      color: 'white',
      overflow: 'hidden',
      zIndex: 1000, // Высокий z-index чтобы был поверх контента
      boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
    }}>
      {/* Заголовок с логотипом */}
      <Box sx={{ 
        p: 2, 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0 // Запрещаем сжатие
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
        flex: 1, // Занимает все доступное пространство
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
        <List>
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

      {/* ФИКСИРОВАННЫЙ футер внизу */}
      <Box sx={{ 
        flexShrink: 0, // Запрещаем сжатие
        p: 1.5,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(180deg, transparent 0%, #1a237e 100%)'
      }}>
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