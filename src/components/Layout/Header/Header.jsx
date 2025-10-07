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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StyledActionButton to="/wishlist" scrolled={scrolled}>
                <Badge badgeContent={wishlistCount} color="error">
                  <Favorite />
                </Badge>
              </StyledActionButton>

              <StyledActionButton to="/cart" scrolled={scrolled}>
                <Badge badgeContent={cartItemsCount} color="error">
                  <ShoppingCart />
                </Badge>
              </StyledActionButton>

              {currentUser ? (
                <>
                  <IconButton onClick={handleProfileMenuOpen}>
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button component={Link} to="/login" variant="outlined">
                    Войти
                  </Button>
                  <Button component={Link} to="/register" variant="contained" color="error">
                    Регистрация
                  </Button>
                </Box>
              )}

              {isMobile && (
                <IconButton onClick={handleDrawerToggle}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </StyledAppBar>

      <Toolbar sx={{ minHeight: { xs: '70px', md: '80px' } }} />

      {/* Drawer */}
      <Drawer open={mobileOpen} onClose={handleDrawerToggle}>
        <DrawerContainer>
          <DrawerHeader>🛍️ Электроник</DrawerHeader>
          <List>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={handleDrawerToggle}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </DrawerContainer>
      </Drawer>
    </>
  );
};

export default Header;
