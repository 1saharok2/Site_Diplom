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
  Store
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useReviews } from '../../../context/ReviewContext';

const menuItems = [
  { text: 'Статистика', icon: <Dashboard />, path: '/admin/dashboard' },
  { text: 'Товары', icon: <Inventory />, path: '/admin/products' },
  { text: 'Заказы', icon: <ShoppingCart />, path: '/admin/orders' },
  { text: 'Пользователи', icon: <People />, path: '/admin/users' },
  { text: 'Категории', icon: <Category />, path: '/admin/categories' },
  { text: 'Модерация отзывов', icon: <RateReview />, path: '/admin/reviews' },
];

const AdminSidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { moderationReviews } = useReviews();

  const pendingReviewsCount = moderationReviews.filter(review => review.status === 'pending').length;

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

  return (
    <Box sx={{ 
      // ВАЖНО: height 100% чтобы заполнить родительский Drawer
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      // Градиент фона
      background: 'linear-gradient(180deg, #1a237e 0%, #283593 100%)',
      color: 'white',
      overflowY: 'auto', // Прокрутка если меню длинное
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
            <Chip label="Админ" size="small" sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', height: '20px', fontSize: '0.65rem' }} />
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
                  '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                   {item.text === 'Модерация отзывов' && pendingReviewsCount > 0 ? (
                      <Badge badgeContent={pendingReviewsCount} color="error">{item.icon}</Badge>
                   ) : item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Футер */}
      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton onClick={handleGoToHome} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}><Home /></ListItemIcon>
              <ListItemText primary="На сайт" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255,99,71,0.2)' } }}>
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}><ExitToApp /></ListItemIcon>
              <ListItemText primary="Выйти" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default AdminSidebar;