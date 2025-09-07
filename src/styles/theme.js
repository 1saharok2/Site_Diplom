// styles/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8498f0',
      dark: '#4858a3'
    },
    secondary: {
      main: '#764ba2',
      light: '#916fb5',
      dark: '#523471'
    },
    background: {
      default: '#f8f9fa'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700
    }
  },
  shape: {
    borderRadius: 8
  }
});

export default theme;