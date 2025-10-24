import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
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
  InputAdornment,
  Paper,
  CircularProgress,
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
import {
  StyledAppBar,
  StyledLogo,
  StyledSearchField,
  StyledNavButton,
  StyledActionButton,
  DrawerContainer,
  DrawerHeader
} from './HeaderStyles';

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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const filteredProducts = searchQuery && products
    ? products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const cartItemsCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const navItems = [
    { label: 'Каталог', path: '/catalog', icon: <Store fontSize="small" /> },
    { label: 'О нас', path: '/about' },
    { label: 'Контакты', path: '/contacts', icon: <Phone fontSize="small" /> }
  ];

  return (
    <>
      <StyledAppBar scrolled={scrolled}>
        <Container maxWidth="xl" disableGutters>
          <Toolbar sx={{ minHeight: { xs: '70px', md: '80px' } }}>
            
            {/* ЛОГОТИП */}
            <StyledLogo component={Link} to="/" scrolled={scrolled}>
              🛍️ Электроник
            </StyledLogo>

            {/* ПОИСК */}
            {!isMobile && (
              <Box sx={{ flexGrow: 1, mx: 4, maxWidth: '600px', position: 'relative' }}>
                <Slide direction="down" in timeout={500}>
                  <form onSubmit={handleSearchSubmit}>
                    <StyledSearchField
                      fullWidth
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      scrolled={scrolled}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setSearchQuery('')}>
                              <Clear />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                  </form>
                </Slide>

                {showSearchResults && (
                  <Fade in>
                    <Paper sx={{ position: 'absolute', top: 'calc(100% + 8px)', width: '100%', zIndex: 9999 }}>
                      {loading ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : filteredProducts.length > 0 ? (
                        <List>
                          {filteredProducts.map((product) => (
                            <ListItem
                              key={product.id}
                              button
                              onClick={() => {
                                navigate(`/product/${product.id}`);
                                setSearchQuery('');
                                setShowSearchResults(false);
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
                                    mr: 3
                                  }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="subtitle2" noWrap>
                                    {product.name}
                                  </Typography>
                                  <Typography variant="body2" color="primary">
                                    {product.price?.toLocaleString()} ₽
                                  </Typography>
                                </Box>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        {searchQuery && filteredProducts.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Ничего не найдено
                          </Typography>
                        )}
                      </Box>
                      )}
                    </Paper>
                  </Fade>
                )}
              </Box>
            )}

            {/* НАВИГАЦИЯ */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                {navItems.map((item) => (
                  <StyledNavButton
                    key={item.path}
                    component={Link}
                    to={item.path}
                    scrolled={scrolled}
                    startIcon={item.icon}
                  >
                    {item.label}
                  </StyledNavButton>
                ))}
              </Box>
            )}

            {/* ЭКШН-КНОПКИ */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
              <StyledActionButton to="/wishlist" scrolled={scrolled}>
                <Badge badgeContent={wishlistCount} color="error">
                  <Favorite sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                </Badge>
              </StyledActionButton>

              <StyledActionButton to="/cart" scrolled={scrolled}>
                <Badge badgeContent={cartItemsCount} color="error">
                  <ShoppingCart sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                </Badge>
              </StyledActionButton>

              {currentUser ? (
                <>
                  <IconButton 
                    onClick={handleProfileMenuOpen}
                    sx={{ 
                      padding: { xs: '6px', sm: '8px' },
                      '& .MuiSvgIcon-root': {
                        fontSize: { xs: '1.2rem', sm: '1.5rem' }
                      }
                    }}
                  >
                    <AccountCircle />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    PaperProps={{
                      elevation: 4,
                      sx: {
                        mt: 1.5,
                        borderRadius: 3,
                        minWidth: 180,
                        overflow: 'hidden',
                        backgroundColor: 'background.paper',
                        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                        '& .MuiMenuItem-root': {
                          gap: 1.5,
                          px: 2,
                          py: 1.2,
                          transition: 'all 0.2s ease',
                          '& svg': {
                            fontSize: 22,
                            color: 'primary.main',
                          },
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '& svg': {
                              color: 'white',
                            },
                          },
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem component={Link} to="/profile" onClick={handleProfileMenuClose}>
                      <AccountCircle /> Профиль
                    </MenuItem>

                    {currentUser.role === 'admin' && (
                      <MenuItem component={Link} to="/admin" onClick={handleProfileMenuClose}>
                        <Dashboard /> Админка
                      </MenuItem>
                    )}

                    <MenuItem onClick={handleLogout}>
                      <ExitToApp /> Выйти
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                  <Button 
                    component={Link} 
                    to="/login" 
                    variant="outlined"
                    size="small"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '4px 8px', sm: '6px 16px' },
                      minWidth: { xs: '60px', sm: 'auto' }
                    }}
                  >
                    Войти
                  </Button>
                  <Button 
                    component={Link} 
                    to="/register" 
                    variant="contained" 
                    color="error"
                    size="small"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      padding: { xs: '4px 8px', sm: '6px 16px' },
                      minWidth: { xs: '80px', sm: 'auto' }
                    }}
                  >
                    Регистрация
                  </Button>
                </Box>
              )}

              {isMobile && (
                <IconButton 
                  onClick={handleDrawerToggle}
                  sx={{ 
                    padding: { xs: '6px', sm: '8px' },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Toolbar sx={{ minHeight: { xs: '70px', md: '80px' } }} />

      {/* Drawer */}
      <Drawer 
        open={mobileOpen} 
        onClose={handleDrawerToggle}
        anchor="right"
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 320 },
            backgroundColor: 'background.paper',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }
        }}
      >
        <DrawerContainer>
          <DrawerHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                🛍️ Электроник
              </Typography>
              <IconButton onClick={handleDrawerToggle} size="small">
                <Clear />
              </IconButton>
            </Box>
          </DrawerHeader>

          {/* Мобильный поиск */}
          <Box sx={{ mb: 3 }}>
            <form onSubmit={handleSearchSubmit}>
              <StyledSearchField
                fullWidth
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={handleSearchChange}
                scrolled={true}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchQuery('')} size="small">
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </form>
            
            {showSearchResults && (
              <Box sx={{ mt: 2 }}>
                {loading ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : filteredProducts.length > 0 ? (
                  <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {filteredProducts.map((product) => (
                      <ListItem
                        key={product.id}
                        button
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setSearchQuery('');
                          setShowSearchResults(false);
                          handleDrawerToggle();
                        }}
                        sx={{ py: 1 }}
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
                              mr: 2
                            }}
                          />
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="body2" noWrap>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="primary">
                              {product.price?.toLocaleString()} ₽
                            </Typography>
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  searchQuery && (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Ничего не найдено
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            )}
          </Box>

          {/* Навигация */}
          <List sx={{ mb: 2 }}>
            {navItems.map((item) => (
              <ListItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {item.icon && (
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                )}
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 500,
                  }}
                />
              </ListItem>
            ))}
          </List>

          {/* Действия пользователя */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            {currentUser ? (
              <List>
                <ListItem
                  component={Link}
                  to="/profile"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    <AccountCircle />
                  </Box>
                  <ListItemText primary="Профиль" />
                </ListItem>

                <ListItem
                  component={Link}
                  to="/wishlist"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    <Badge badgeContent={wishlistCount} color="error">
                      <Favorite />
                    </Badge>
                  </Box>
                  <ListItemText primary="Избранное" />
                </ListItem>

                <ListItem
                  component={Link}
                  to="/cart"
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    <Badge badgeContent={cartItemsCount} color="error">
                      <ShoppingCart />
                    </Badge>
                  </Box>
                  <ListItemText primary="Корзина" />
                </ListItem>

                {currentUser.role === 'admin' && (
                  <ListItem
                    component={Link}
                    to="/admin"
                    onClick={handleDrawerToggle}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      <Dashboard />
                    </Box>
                    <ListItemText primary="Админка" />
                  </ListItem>
                )}

                <ListItem
                  onClick={() => {
                    handleLogout();
                    handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'error.main',
                      color: 'white',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    <ExitToApp />
                  </Box>
                  <ListItemText primary="Выйти" />
                </ListItem>
              </List>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  component={Link} 
                  to="/login" 
                  variant="outlined" 
                  fullWidth
                  onClick={handleDrawerToggle}
                  sx={{ borderRadius: 2 }}
                >
                  Войти
                </Button>
                <Button 
                  component={Link} 
                  to="/register" 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  onClick={handleDrawerToggle}
                  sx={{ borderRadius: 2 }}
                >
                  Регистрация
                </Button>
              </Box>
            )}
          </Box>
        </DrawerContainer>
      </Drawer>
    </>
  );
};

export default Header;
