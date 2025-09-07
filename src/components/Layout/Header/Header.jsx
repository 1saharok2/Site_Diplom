// src/components/Layout/Header/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext/CartContext';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const cartItemsCount = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  const navigationItems = [
    { label: 'Главная', path: '/' },
    { label: 'Каталог', path: '/catalog' },
    { label: 'О нас', path: '/about' },
    { label: 'Контакты', path: '/contacts' }
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Магазин
      </Typography>
      <List>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            sx={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {currentUser ? (
          <>
            <ListItem
              component={Link}
              to="/profile"
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemText primary="Профиль" />
            </ListItem>
            {currentUser.role === 'admin' && (
              <ListItem
                component={Link}
                to="/admin"
                sx={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ListItemText primary="Админка" />
              </ListItem>
            )}
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Выйти" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              component={Link}
              to="/login"
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemText primary="Войти" />
            </ListItem>
            <ListItem
              component={Link}
              to="/register"
              sx={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemText primary="Регистрация" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}
          >
            🛍️ Магазин
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  sx={{
                    color: 'inherit',
                    textTransform: 'none',
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <IconButton
              component={Link}
              to="/cart"
              sx={{ color: 'inherit' }}
            >
              <Badge badgeContent={cartItemsCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>

            {currentUser ? (
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ color: 'inherit' }}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                >
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleProfileMenuClose}
                  >
                    Профиль
                  </MenuItem>
                  {currentUser.role === 'admin' && (
                    <MenuItem
                      component={Link}
                      to="/admin"
                      onClick={handleProfileMenuClose}
                    >
                      Админ панель
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <ExitToApp sx={{ mr: 1 }} />
                    Выйти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderColor: 'grey.300',
                    color: 'inherit'
                  }}
                >
                  Войти
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    backgroundColor: 'primary.main'
                  }}
                >
                  Регистрация
                </Button>
              </Box>
            )}

            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header; 