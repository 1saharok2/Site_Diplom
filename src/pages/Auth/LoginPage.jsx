// pages/Auth/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (result.success) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
    } else {
      navigate(result.user.role === 'admin' ? '/admin' : '/profile');
    }
  } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
        marginTop: '-64px'
      }}
    >
      <Container 
        maxWidth="sm" 
        sx={{
          py: 0 
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: 'white',
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            marginTop: 4
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              color: '#333',
              fontWeight: 'bold',
              mb: 3
            }}
          >
            Вход в систему
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="Email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              type="password"
              label="Пароль"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)',
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                },
                '&:disabled': {
                  opacity: 0.7
                }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'ВОЙТИ'}
            </Button>

            <Box textAlign="center" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Нет аккаунта?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Зарегистрироваться
                </Link>
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 2,
                borderLeft: '4px solid #667eea'
              }}
            >
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, mb: 1 }}>
                Демо доступ:
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Email: admin@mail.com
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Пароль: admin123
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;