// src/components/Layout/Header/Header.jsx
import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  alpha,
  Slide,
  Fade,
  Container
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  AccountCircle,
  ExitToApp,
  Search,
  Clear,
  Favorite,
  Dashboard,
  Store,
  Phone
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useProducts } from '../../../context/ProductsContext';
import { useWishlist } from '../../../context/WishlistContext';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();
  const { getWishlistCount } = useWishlist();
  const { products, loading } = useProducts();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const wishlistCount = getWishlistCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { label: 'Каталог', path: '/catalog', icon: <Store sx={{ fontSize: 18 }} /> },
    { label: 'О нас', path: '/about' },
    { label: 'Контакты', path: '/contacts', icon: <Phone sx={{ fontSize: 18 }} /> }
  ];

  const drawer = (
    <Box sx={{ 
      width: 320,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      height: '100%',
      color: 'white'
    }}>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          🛍️ Электроник
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Магазин электроники
        </Typography>
      </Box>
      
      <List sx={{ p: 2 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            onClick={handleDrawerToggle}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 2,
              mb: 0.5,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
            disablePadding
          >
            <ListItemButton sx={{ py: 2 }}>
              {item.icon && <Box sx={{ mr: 2, opacity: 0.8 }}>{item.icon}</Box>}
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {currentUser ? (
          <>
            <ListItem
              component={Link}
              to="/profile"
              onClick={handleDrawerToggle}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              disablePadding
            >
              <ListItemButton sx={{ py: 2 }}>
                <AccountCircle sx={{ mr: 2, opacity: 0.8 }} />
                <ListItemText 
                  primary="Профиль" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
            
            {currentUser.role === 'admin' && (
              <ListItem
                component={Link}
                to="/admin"
                onClick={handleDrawerToggle}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                disablePadding
              >
                <ListItemButton sx={{ py: 2 }}>
                  <Dashboard sx={{ mr: 2, opacity: 0.8 }} />
                  <ListItemText 
                    primary="Админка" 
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            )}
            
            <ListItem 
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              disablePadding
            >
              <ListItemButton sx={{ py: 2 }}>
                <ExitToApp sx={{ mr: 2, opacity: 0.8 }} />
                <ListItemText 
                  primary="Выйти" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              component={Link}
              to="/login"
              onClick={handleDrawerToggle}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              disablePadding
            >
              <ListItemButton sx={{ py: 2 }}>
                <AccountCircle sx={{ mr: 2, opacity: 0.8 }} />
                <ListItemText 
                  primary="Войти" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
            
            <ListItem
              component={Link}
              to="/register"
              onClick={handleDrawerToggle}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              disablePadding
            >
              <ListItemButton sx={{ py: 2 }}>
                <ExitToApp sx={{ mr: 2, opacity: 0.8 }} />
                <ListItemText 
                  primary="Регистрация" 
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: scrolled ? alpha(theme.palette.background.paper, 0.95) : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          backgroundImage: scrolled ? 'none' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: scrolled ? 'text.primary' : 'white',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.1)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Toolbar sx={{ 
            minHeight: { xs: '70px', md: '80px' },
            px: { xs: 2, md: 3 },
            transition: 'all 0.3s ease'
          }}>
            {/* Логотип */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              minWidth: { xs: '100px', md: '140px' }
            }}>
              <Typography
                variant="h4"
                component={Link}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  fontWeight: 'bold',
                  fontSize: { xs: '1.3rem', md: '1.8rem' },
                  background: scrolled ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'none',
                  backgroundClip: scrolled ? 'text' : 'none',
                  textFillColor: scrolled ? 'transparent' : 'inherit',
                  WebkitBackgroundClip: scrolled ? 'text' : 'none',
                  WebkitTextFillColor: scrolled ? 'transparent' : 'inherit',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease'
                  }
                }}
              >
                🛍️ Электроник
              </Typography>
            </Box>

            {/* Поисковая строка */}
            {!isMobile && (
              <Box sx={{ 
                flexGrow: 1, 
                mx: 4, 
                position: 'relative',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <Slide direction="down" in={true} timeout={500}>
                  <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ 
                              color: scrolled ? 'primary.main' : 'rgba(255,255,255,0.8)',
                              fontSize: '22px'
                            }} />
                          </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={handleClearSearch}
                              edge="end"
                              sx={{ 
                                padding: '6px',
                                color: scrolled ? 'text.secondary' : 'rgba(255,255,255,0.7)'
                              }}
                            >
                              <Clear sx={{ fontSize: '20px' }} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        backgroundColor: scrolled ? 'grey.50' : 'rgba(255,255,255,0.15)',
                        borderRadius: '12px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          color: scrolled ? 'text.primary' : 'white',
                          '& fieldset': {
                            border: 'none'
                          },
                          '&:hover fieldset': {
                            border: 'none'
                          },
                          '&.Mui-focused fieldset': {
                            border: '2px solid',
                            borderColor: scrolled ? 'primary.main' : 'rgba(255,255,255,0.5)'
                          }
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: scrolled ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                          opacity: 1
                        }
                      }}
                    />
                  </form>
                </Slide>

                {/* Результаты поиска */}
                {showSearchResults && (
                  <Fade in={showSearchResults}>
                    <Paper
                      sx={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        maxHeight: '400px',
                        overflow: 'auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      {loading ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : filteredProducts.length > 0 ? (
                        <List sx={{ py: 1 }}>
                          {filteredProducts.map((product) => (
                            <ListItem
                              key={product.id}
                              button
                              onClick={() => handleSearchItemClick(product)}
                              sx={{
                                py: 2,
                                px: 3,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                '&:last-child': {
                                  borderBottom: 'none'
                                },
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  '& .MuiTypography-root': {
                                    color: 'primary.contrastText'
                                  }
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Box
                                  component="img"
                                  src={product.image || '/images/placeholder.jpg'}
                                  alt={product.name}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                    mr: 3,
                                    flexShrink: 0,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                  }}
                                  onError={(e) => {
                                    e.target.src = '/images/placeholder.jpg';
                                  }}
                                />
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {product.name}
                                  </Typography>
                                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                                    {product.price?.toLocaleString()} ₽
                                  </Typography>
                                </Box>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      ) : searchQuery && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            Ничего не найдено
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Попробуйте изменить запрос
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Fade>
                )}
              </Box>
            )}

            {/* Правая часть */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1, md: 2 },
              ml: 'auto'
            }}>
              {/* Навигация на десктопе */}
              {!isMobile && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mr: 3
                }}>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.path}
                      component={Link}
                      to={item.path}
                      startIcon={item.icon}
                      sx={{
                        color: scrolled ? 'text.primary' : 'white',
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        padding: '8px 16px',
                        borderRadius: '8px',
                        minWidth: 'auto',
                        '&:hover': {
                          backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)',
                          transform: 'translateY(-1px)',
                          boxShadow: scrolled ? '0 4px 12px rgba(102, 126, 234, 0.2)' : '0 4px 12px rgba(0,0,0,0.1)'
                        },
                        transition: 'all 0.2s ease'
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
                    color: scrolled ? 'primary.main' : 'white',
                    padding: '10px',
                    '&:hover': {
                      backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <Search />
                </IconButton>
              )}

              {/* Избранное */}
              <IconButton
                component={Link}
                to="/wishlist"
                sx={{ 
                  color: scrolled ? 'primary.main' : 'white',
                  padding: '10px',
                  '&:hover': {
                    backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Badge 
                  badgeContent={wishlistCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: '20px',
                      minWidth: '20px',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  <Favorite sx={{ fontSize: '24px' }} />
                </Badge>
              </IconButton>

              {/* Корзина */}
              <IconButton
                component={Link}
                to="/cart"
                sx={{ 
                  color: scrolled ? 'primary.main' : 'white',
                  padding: '10px',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Badge 
                  badgeContent={cartItemsCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      height: '20px',
                      minWidth: '20px',
                      fontWeight: 'bold'
                    }
                  }}
                >
                  <ShoppingCart sx={{ fontSize: '24px' }} />
                </Badge>
              </IconButton>

              {/* Профиль пользователя */}
              {currentUser ? (
                <>
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{ 
                      color: scrolled ? 'primary.main' : 'white',
                      padding: '10px',
                      '&:hover': {
                        backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <AccountCircle sx={{ fontSize: '28px' }} />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        minWidth: '200px',
                        overflow: 'visible',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0
                        }
                      }
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem
                      component={Link}
                      to="/profile"
                      onClick={handleProfileMenuClose}
                      sx={{ py: 1.5, px: 2, gap: 2 }}
                    >
                      <AccountCircle sx={{ opacity: 0.7 }} />
                      Профиль
                    </MenuItem>
                    {currentUser.role === 'admin' && (
                      <MenuItem
                        component={Link}
                        to="/admin"
                        onClick={handleProfileMenuClose}
                        sx={{ py: 1.5, px: 2, gap: 2 }}
                      >
                        <Dashboard sx={{ opacity: 0.7 }} />
                        Админ панель
                      </MenuItem>
                    )}
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ py: 1.5, px: 2, gap: 2 }}
                    >
                      <ExitToApp sx={{ opacity: 0.7 }} />
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
                    variant={scrolled ? "outlined" : "contained"}
                    size="small"
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      background: scrolled ? 'transparent' : 'rgba(255,255,255,0.2)',
                      color: scrolled ? 'primary.main' : 'white',
                      borderColor: scrolled ? 'primary.main' : 'transparent',
                      '&:hover': {
                        background: scrolled ? 'primary.main' : 'rgba(255,255,255,0.3)',
                        color: scrolled ? 'white' : 'white',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      },
                      transition: 'all 0.2s ease'
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
                      borderRadius: '8px',
                      padding: '8px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                      boxShadow: '0 4px 15px rgba(255,107,107,0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff5252 0%, #e53935 100%)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(255,82,82,0.4)'
                      },
                      transition: 'all 0.2s ease'
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
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: scrolled ? 'primary.main' : 'white',
                    padding: '10px',
                    '&:hover': {
                      backgroundColor: scrolled ? 'primary.light' : 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Отступ для фиксированного хедера */}
      <Toolbar sx={{ minHeight: { xs: '70px', md: '80px' } }} />

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
            width: 320 
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;