// pages/Auth/RegisterPage.jsx
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

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Очищаем ошибку при изменении поля
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Имя обязательно');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email обязателен');
      return false;
    }

    if (!formData.password) {
      setError('Пароль обязателен');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Валидация формы
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // ✅ Исправляем: разбиваем имя и фамилию правильно
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Подготовка данных в формате, который ожидает API
      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '' // Отправляем пустую строку вместо undefined
      };

      console.log('📤 Отправляемые данные:', userData); // Для отладки

      // Шаг 2: Вызов функции регистрации из контекста
      const result = await register(userData);

      // Шаг 3: Обработка результата
      if (result.success) {
        // ✅ Успешная регистрация
        navigate('/profile', { 
          replace: true,
          state: { message: 'Регистрация прошла успешно!' }
        });
      } else {
        setError(result.error || 'Ошибка регистрации');
      }

    } catch (error) {
      console.error('Registration error:', error);
      
      // Более информативные сообщения об ошибках
      if (error.message.includes('Network')) {
        setError('Проблема с подключением к серверу');
      } else if (error.message.includes('409')) {
        setError('Пользователь с таким email уже существует');
      } else {
        setError(error.message || 'Произошла ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
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
            Регистрация
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Имя и фамилия"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="Иван Иванов"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              type="email"
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="example@mail.com"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              type="tel"
              label="Телефон (необязательно)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              placeholder="+7 (999) 999-99-99"
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
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Минимум 6 символов"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              type="password"
              label="Подтвердите пароль"
              name="confirmPassword"
              value={formData.confirmPassword}
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
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" sx={{ color: '#666' }}>
                Уже есть аккаунт?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  Войти
                </Link>
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 2,
                borderLeft: '4px solid #667eea',
                mt: 2
              }}
            >
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, mb: 1 }}>
                Демо данные для тестирования:
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                Email: test@example.com
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                Пароль: любой от 6 символов
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;