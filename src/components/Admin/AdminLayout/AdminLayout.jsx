import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  useTheme,
  useMediaQuery,
  CssBaseline // <--- ВАЖНО: Убирает отступы браузера по умолчанию
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar'; 

const drawerWidth = 280;

const AdminLayout = ({ children }) => {
  const theme = useTheme();
  // Мобильная версия включается на экранах меньше 'md' (900px)
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
  const [mobileOpen, setMobileOpen] = useState(false); 

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleSidebarClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  const sidebarContent = (
    <AdminSidebar onItemClick={handleSidebarClick} /> 
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline /> {/* <--- Это исправит белые полосы по краям */}

      {/* 1. ШАПКА */}
      <AppBar 
        position="fixed" 
        sx={{ 
          // На десктопе ширина уменьшается на ширину сайдбара
          width: { md: `calc(100% - ${drawerWidth}px)` }, 
          // На десктопе сдвигается вправо
          ml: { md: `${drawerWidth}px` }, 
          backgroundColor: '#5c6bc0', // Цвет шапки (подстройте под ваш дизайн)
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }} // Кнопка меню только на мобильных
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Админ Панель
          </Typography>
          <IconButton color="inherit"><NotificationsIcon /></IconButton>
          <IconButton color="inherit"><AccountIcon /></IconButton>
        </Toolbar>
      </AppBar>

      {/* 2. НАВИГАЦИЯ (Drawer) */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Мобильный Drawer (Временный) */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                border: 'none' // Убираем бордер
            },
          }}
        >
          {sidebarContent}
        </Drawer>

        {/* Десктопный Drawer (Постоянный) */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                border: 'none', // Убираем бордер, у нас свой дизайн
            },
          }}
          open
        >
          {sidebarContent}
        </Drawer>
      </Box>

      {/* 3. ОСНОВНОЙ КОНТЕНТ */}
      <Box
        component="main"
        sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
        }}
      >
        {/* Пустой Toolbar создает отступ сверху, равный высоте AppBar */}
        <Toolbar /> 
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;