// pages/User/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  History,
  Favorite,
  RateReview,
  LocationOn,
  Payment,
  Security
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEdit = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || ''
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage('Профиль успешно обновлен');
      setIsEditing(false);
    } else {
      setMessage(result.error);
    }
    setLoading(false);
  };

  const quickActions = [
    {
      icon: <History />,
      title: 'История заказов',
      description: 'Просмотр ваших предыдущих заказов',
      onClick: () => navigate('/orders'),
      color: 'primary.main'
    },
    {
      icon: <Favorite />,
      title: 'Избранные товары',
      description: 'Ваши сохраненные товары',
      onClick: () => navigate('/wishlist'),
      color: 'error.main'
    },
    {
      icon: <RateReview />,
      title: 'Мои отзывы',
      description: 'Просмотр и управление отзывами',
      onClick: () => navigate('/reviews'),
      color: 'warning.main'
    },
    {
      icon: <LocationOn />,
      title: 'Адреса доставки',
      description: 'Управление адресами доставки',
      onClick: () => navigate('/addresses'),
      color: 'success.main'
    },
    {
      icon: <Payment />,
      title: 'Способы оплаты',
      description: 'Управление платежными методами',
      onClick: () => navigate('/payment-methods'),
      color: 'info.main'
    },
    {
      icon: <Security />,
      title: 'Безопасность',
      description: 'Смена пароля и настройки безопасности',
      onClick: () => navigate('/security'),
      color: 'secondary.main'
    }
  ];

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6">Пожалуйста, войдите в систему</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Личный кабинет
      </Typography>

      <Grid container spacing={3}>
        {/* Основная информация профиля */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">Профиль</Typography>
              {!isEditing ? (
                <Button
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  variant="outlined"
                >
                  Редактировать
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Отмена
                  </Button>
                  <Button
                    startIcon={<Save />}
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                  >
                    Сохранить
                  </Button>
                </Box>
              )}
            </Box>

            {message && (
              <Alert severity={message.includes('успешно') ? 'success' : 'error'} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="tel"
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Адрес"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Box>
            ) : (
              <Box>
                <Typography><strong>Имя:</strong> {currentUser.name}</Typography>
                <Typography><strong>Email:</strong> {currentUser.email}</Typography>
                <Typography><strong>Телефон:</strong> {currentUser.phone || 'Не указан'}</Typography>
                <Typography><strong>Адрес:</strong> {currentUser.address || 'Не указан'}</Typography>
                <Typography><strong>Роль:</strong> {currentUser.role}</Typography>
                <Typography>
                  <strong>Дата регистрации:</strong>{' '}
                  {new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Статистика */}
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Статистика
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main">
                    5
                  </Typography>
                  <Typography variant="body2">Заказов</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="secondary.main">
                    12
                  </Typography>
                  <Typography variant="body2">Избранное</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    3
                  </Typography>
                  <Typography variant="body2">Отзывов</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} md={3}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    2
                  </Typography>
                  <Typography variant="body2">Адреса</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Быстрые действия */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Быстрые действия
            </Typography>
            
            <List>
              {quickActions.map((action, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    button 
                    onClick={action.onClick}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: action.color }}>
                      {action.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={action.title}
                      secondary={action.description}
                    />
                  </ListItem>
                  {index < quickActions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>

          {/* Недавняя активность */}
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Недавняя активность
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Заказ #12345"
                  secondary="15 января 2024 - 12 500 ₽"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Добавлен в избранное"
                  secondary="14 января 2024 - Смартфон Samsung"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Оставлен отзыв"
                  secondary="13 января 2024 - Ноутбук ASUS"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;