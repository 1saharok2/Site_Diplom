import { styled, alpha } from '@mui/material/styles';
import { AppBar, Button, TextField, Box } from '@mui/material';
import { Link } from 'react-router-dom';

/* === Основной AppBar === */
export const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'scrolled',
})(({ theme, scrolled }) => ({
  background: scrolled
    ? alpha(theme.palette.background.paper, 0.95)
    : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
  color: scrolled ? theme.palette.text.primary : '#fff',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.4s ease',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1100,
}));

/* === Логотип === */
export const StyledLogo = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'scrolled',
})(({ theme, scrolled }) => ({
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: '1.6rem',
  color: scrolled ? theme.palette.primary.main : '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

/* === Кнопки навигации === */
export const StyledNavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'scrolled',
})(({ theme, scrolled }) => ({
  color: scrolled ? theme.palette.text.primary : '#fff',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1rem',
  padding: '6px 16px',
  borderRadius: 10,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: scrolled
      ? alpha(theme.palette.primary.main, 0.08)
      : alpha('#fff', 0.15),
    transform: 'translateY(-1px)',
  },
}));

/* === Поле поиска === */
export const StyledSearchField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'scrolled',
})(({ theme, scrolled }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: scrolled ? '#f8f9fc' : alpha('#fff', 0.15),
    color: scrolled ? theme.palette.text.primary : '#fff',
    borderRadius: '50px',
    paddingRight: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: scrolled
        ? alpha(theme.palette.primary.main, 0.08)
        : alpha('#fff', 0.25),
    },
    '& fieldset': {
      border: 'none',
    },
    '& input::placeholder': {
      color: scrolled ? '#888' : alpha('#fff', 0.8),
      opacity: 1,
    },
    '& svg': {
      color: scrolled ? theme.palette.primary.main : '#fff',
    },
  },
}));

/* === Иконки действий (корзина, избранное и т.п.) === */
export const StyledActionButton = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'scrolled',
})(({ theme, scrolled }) => ({
  color: scrolled ? theme.palette.text.primary : '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  width: 42,
  height: 42,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: scrolled
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha('#fff', 0.2),
    transform: 'scale(1.05)',
  },
}));

/* === Drawer для мобильного меню === */
export const DrawerContainer = styled(Box)(({ theme }) => ({
  width: 250,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
}));

export const DrawerHeader = styled(Box)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));
