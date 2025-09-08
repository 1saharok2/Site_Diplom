// src/components/Layout/Header/Header.jsx
import React, { useState } from 'react';
import './Header.css';
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
  MenuItem,
  ListItemButton,
  TextField,
  InputAdornment,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  Search,
  Clear
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useProducts } from '../../../context/ProductsContext';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();
  const { products, loading } = useProducts();
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleSearchItemClick = (product) => {
    navigate(`/product/${product.id}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const filteredProducts = searchQuery && products
    ? products.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const cartItemsCount = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  const navigationItems = [
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
            disablePadding
          >
            <ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        {currentUser ? (
          <>
            <ListItem
              component={Link}
              to="/profile"
              sx={{ textDecoration: 'none', color: 'inherit' }}
              disablePadding
            >
              <ListItemButton sx={{ textAlign: 'center' }}>
                <ListItemText primary="Профиль" />
              </ListItemButton>
            </ListItem>
            {currentUser.role === 'admin' && (
              <ListItem
                component={Link}
                to="/admin"
                sx={{ textDecoration: 'none', color: 'inherit' }}
                disablePadding
              >
                <ListItemButton sx={{ textAlign: 'center' }}>
                  <ListItemText primary="Админка" />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ textAlign: 'center' }}>
                <ListItemText primary="Выйти" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              component={Link}
              to="/login"
              sx={{ textDecoration: 'none', color: 'inherit' }}
              disablePadding
            >
              <ListItemButton sx={{ textAlign: 'center' }}>
                <ListItemText primary="Войти" />
              </ListItemButton>
            </ListItem>
            <ListItem
              component={Link}
              to="/register"
              sx={{ textDecoration: 'none', color: 'inherit' }}
              disablePadding
            >
              <ListItemButton sx={{ textAlign: 'center' }}>
                <ListItemText primary="Регистрация" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ 
        backgroundColor: 'white', 
        color: 'black', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Toolbar sx={{ 
          minHeight: '70px !important',
          padding: '0 24px !important'
        }}>
          {/* Логотип - левая часть */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            minWidth: '120px'
          }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              🛍️ Электроник
            </Typography>
          </Box>

          {/* Поисковая строка - центр (только на десктопе) */}
          {!isMobile && (
            <Box sx={{ 
              flexGrow: 1, 
              mx: 4, 
              position: 'relative', 
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
                <TextField
                  fullWidth
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          edge="end"
                          sx={{ padding: '4px' }}
                        >
                          <Clear sx={{ fontSize: '18px' }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    backgroundColor: 'grey.50',
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      '& fieldset': {
                        border: 'none'
                      },
                      '&:hover fieldset': {
                        border: 'none'
                      },
                      '&.Mui-focused fieldset': {
                        border: '2px solid',
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />
              </form>

              {/* Результаты поиска */}
              {showSearchResults && (
                <Paper
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    maxHeight: '300px',
                    overflow: 'auto',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {loading ? (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : filteredProducts.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {filteredProducts.map((product) => (
                        <ListItem
                          key={product.id}
                          button
                          onClick={() => handleSearchItemClick(product)}
                          sx={{
                            py: 1.5,
                            px: 2,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box
                              component="img"
                              src={product.image || '/images/placeholder.jpg'}
                              alt={product.name}
                              sx={{
                                width: 40,
                                height: 40,
                                objectFit: 'cover',
                                borderRadius: 1,
                                mr: 2,
                                flexShrink: 0
                              }}
                              onError={(e) => {
                                e.target.src = '/images/placeholder.jpg';
                              }}
                            />
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                {product.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {product.price?.toLocaleString()} ₽
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  ) : searchQuery && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Товары не найдены
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          )}

          {/* Правая часть - навигация и действия */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1, md: 2 },
            ml: 'auto'
          }}>
            {/* Навигация (только на десктопе) */}
            {!isMobile && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mr: 2
              }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    sx={{
                      color: 'text.primary',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      padding: '6px 12px',
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        borderRadius: '6px'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Поиск на мобильных */}
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => navigate('/search')}
                sx={{ 
                  color: 'text.primary',
                  padding: '8px'
                }}
              >
                <Search />
              </IconButton>
            )}

            {/* Корзина */}
            <IconButton
              component={Link}
              to="/cart"
              sx={{ 
                color: 'text.primary',
                padding: '8px',
                position: 'relative'
              }}
            >
              <Badge 
                badgeContent={cartItemsCount} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.7rem',
                    height: '18px',
                    minWidth: '18px'
                  }
                }}
              >
                <ShoppingCart />
              </Badge>
            </IconButton>

            {/* Профиль пользователя */}
            {currentUser ? (
              <>
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ 
                    color: 'text.primary',
                    padding: '8px'
                  }}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      borderRadius: '8px'
                    }
                  }}
                >
                  <MenuItem
                    component={Link}
                    to="/profile"
                    onClick={handleProfileMenuClose}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    Профиль
                  </MenuItem>
                  {currentUser.role === 'admin' && (
                    <MenuItem
                      component={Link}
                      to="/admin"
                      onClick={handleProfileMenuClose}
                      sx={{ py: 1.5, px: 2 }}
                    >
                      Админ панель
                    </MenuItem>
                  )}
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <ExitToApp sx={{ mr: 1.5, fontSize: '20px' }} />
                    Выйти
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                ml: { xs: 0, sm: 1 }
              }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    borderColor: 'grey.300',
                    color: 'text.primary',
                    padding: '6px 16px',
                    fontSize: '0.9rem',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.light',
                      color: 'primary.main'
                    }
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
                    backgroundColor: 'primary.main',
                    padding: '6px 16px',
                    fontSize: '0.9rem',
                    '&:hover': {
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  Регистрация
                </Button>
              </Box>
            )}

            {/* Мобильное меню */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ 
                  color: 'text.primary',
                  padding: '8px',
                  ml: 0.5
                }}
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
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280 
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;