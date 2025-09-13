import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AdminSidebar/>
      
      {/* Сайдбар для десктопной версии */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          borderRight: '1px solid',
          borderColor: 'divider'
        }}
      >
        <AdminSidebar onItemClick={() => {}} />
      </Box>

      {/* Мобильный Drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        <AdminSidebar onItemClick={() => setSidebarOpen(false)} />
      </Drawer>

      {/* Основной контент */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Шапка для мобильных */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            display: { xs: 'block', md: 'none' },
            mb: 2
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Админ Панель
            </Typography>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit">
              <AccountIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

      {/* Основной контент */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 },
          ml: { xs: 0, md: '280px' },
          width: { xs: '100%', md: 'calc(100% - 280px)' }
        }}
      >
        {children}
      </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;