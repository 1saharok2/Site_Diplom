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
  Avatar,
  Badge
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  ShoppingCart,
  People,
  Category,
  ExitToApp,
  Home,
  Store,
  RateReview
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

  // Количество отзывов на модерации
  const pendingReviewsCount = moderationReviews.filter(review => review.status === 'pending').length;

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
      width: 280,
      minWidth: 280,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #1a237e 0%, #283593 100%)',
      color: 'white',
      overflow: 'hidden',
      zIndex: 1000,
      boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
    }}>
      {/* Заголовок с логотипом */}
      <Box sx={{ 
        p: 2, 
        textAlign: 'center', 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Store sx={{ fontSize: 28, mr: 1, color: 'white' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            АДМИН ПАНЕЛЬ
          </Typography>
        </Box>
        
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
      
      {/* Основное меню */}
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        py: 1,
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'rgba(255,255,255,0.1)' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.3)', borderRadius: '2px' },
      }}>
        <List>
          {menuItems.map((item) => {
            const isReviewsItem = item.text === 'Модерация отзывов';
            
            return (
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
                      '& .MuiListItemIcon-root': { color: 'white' }
                    },
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                    {isReviewsItem && pendingReviewsCount > 0 ? (
                      <Badge badgeContent={pendingReviewsCount} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.text}
                        {isReviewsItem && pendingReviewsCount > 0 && (
                          <Chip 
                            label={pendingReviewsCount} 
                            size="small" 
                            color="error"
                            sx={{ 
                              ml: 1, 
                              height: '20px', 
                              fontSize: '0.7rem',
                              minWidth: '20px'
                            }} 
                          />
                        )}
                      </Box>
                    }
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.9rem',
                        fontWeight: location.pathname === item.path ? '600' : '400'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Футер */}
      <Box sx={{ 
        flexShrink: 0,
        p: 1.5,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(180deg, transparent 0%, #1a237e 100%)'
      }}>
        <List sx={{ p: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              onClick={handleGoToHome}
              sx={{
                borderRadius: 1,
                py: 1.2,
                backgroundColor: 'rgba(255,255,255,0.05)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                <Home sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="На главную сайта" 
                sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout}
              sx={{
                borderRadius: 1,
                py: 1.2,
                backgroundColor: 'rgba(255,255,255,0.05)',
                '&:hover': { backgroundColor: 'rgba(255,99,71,0.2)' }
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                <ExitToApp sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Выйти из системы" 
                sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default AdminSidebar;