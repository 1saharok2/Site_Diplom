// pages/User/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
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
  ListItemText,
  Avatar,
  Chip,
  Card,
  CardContent,
  Fade,
  Slide,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  History,
  Favorite,
  RateReview,
  LocationOn,
  Person,
  Email,
  Phone,
  Place,
  CalendarToday,
  ShoppingBag,
  Loyalty,
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Инициализация формы данными пользователя
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser]);

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleCancel = () => {
    setEditDialogOpen(false);
    // Восстанавливаем оригинальные данные
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      address: currentUser.address || ''
    });
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

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setMessage('Профиль успешно обновлен');
        setMessageType('success');
        setEditDialogOpen(false);
        
        // Автоматически скрываем сообщение через 3 секунды
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage(result.error || 'Ошибка при обновлении профиля');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Произошла ошибка при обновлении профиля');
      setMessageType('error');
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: <History sx={{ fontSize: 24 }} />,
      title: 'История заказов',
      description: 'Просмотр ваших предыдущих заказов',
      onClick: () => navigate('/orders'),
      color: theme.palette.primary.main,
      count: 5
    },
    {
      icon: <Favorite sx={{ fontSize: 24 }} />,
      title: 'Избранное',
      description: 'Ваши сохраненные товары',
      onClick: () => navigate('/wishlist'),
      color: theme.palette.error.main,
      count: 12
    },
    {
      icon: <RateReview sx={{ fontSize: 24 }} />,
      title: 'Мои отзывы',
      description: 'Просмотр и управление отзывами',
      onClick: () => navigate('/reviews'),
      color: theme.palette.warning.main,
      count: 3
    },
    {
      icon: <LocationOn sx={{ fontSize: 24 }} />,
      title: 'Адреса доставки',
      description: 'Управление адресами доставки',
      onClick: () => navigate('/addresses'),
      color: theme.palette.success.main,
      count: 2
    }
  ];

  const stats = [
    { label: 'Всего заказов', value: '5', color: 'primary', icon: <ShoppingBag /> },
    { label: 'Избранные товары', value: '12', color: 'error', icon: <Favorite /> },
    { label: 'Написано отзывов', value: '3', color: 'warning', icon: <RateReview /> },
    { label: 'Бонусные баллы', value: '1250', color: 'success', icon: <Loyalty /> }
  ];

  const recentActivities = [
    {
      type: 'order',
      title: 'Заказ #12345 выполнен',
      description: 'Смартфон Samsung Galaxy S23',
      date: '2 часа назад',
      amount: '84 990 ₽',
      icon: <ShoppingBag />,
      color: theme.palette.success.main
    },
    {
      type: 'favorite',
      title: 'Добавлен в избранное',
      description: 'Ноутбук ASUS ROG Strix',
      date: 'Вчера',
      icon: <Favorite />,
      color: theme.palette.error.main
    },
    {
      type: 'review',
      title: 'Оставлен отзыв',
      description: 'Наушники Sony WH-1000XM5',
      date: '3 дня назад',
      icon: <RateReview />,
      color: theme.palette.warning.main
    }
  ];

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="h6">Пожалуйста, войдите в систему</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      py: 4
    }}>
      <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
          {/* Заголовок */}
          <Slide direction="down" in={true} timeout={500}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" component="h1" sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}>
                Личный кабинет
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Управляйте вашими данными и покупками
              </Typography>
            </Box>
          </Slide>

          {/* Сообщение об успехе/ошибке */}
          {message && (
            <Fade in={!!message}>
              <Alert 
                severity={messageType} 
                sx={{ 
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
                onClose={() => setMessage('')}
              >
                {message}
              </Alert>
            </Fade>
          )}

          <Grid container spacing={3} justifyContent="center">
            {/* Боковая панель с профилем */}
            <Grid item xs={12} md={4}>
              <Slide direction="left" in={true} timeout={700}>
                <Paper elevation={0} sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  textAlign: 'center',
                  height: '100%'
                }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 3,
                      border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '3rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </Avatar>

                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {currentUser.name}
                  </Typography>
                  
                  <Chip
                    label={currentUser.role}
                    color="primary"
                    variant="filled"
                    sx={{ mb: 3, fontWeight: 'bold' }}
                  />

                  <Box sx={{ textAlign: 'left', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>{currentUser.email}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>{currentUser.phone || 'Не указан'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Place sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>{currentUser.address || 'Не указан'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>
                        {new Date(currentUser.createdAt).toLocaleDateString('ru-RU')}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    startIcon={<Edit />}
                    onClick={handleEdit}
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Редактировать профиль
                  </Button>
                </Paper>
              </Slide>

              {/* Статистика */}
              <Fade in={true} timeout={900}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  mt: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    📊 Статистика
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {stats.map((stat, index) => (
                      <Grid item xs={6} key={index}>
                        <Card sx={{ 
                          textAlign: 'center', 
                          p: 2,
                          background: 'transparent',
                          boxShadow: 'none',
                          border: `1px solid ${alpha(theme.palette[stat.color].main, 0.1)}`,
                          borderRadius: 3
                        }}>
                          <Box sx={{ 
                            color: `${stat.color}.main`,
                            mb: 1
                          }}>
                            {stat.icon}
                          </Box>
                          <Typography variant="h4" sx={{ 
                            fontWeight: 'bold',
                            color: `${stat.color}.main`,
                            mb: 0.5
                          }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Fade>
            </Grid>

            {/* Основное содержание */}
            <Grid item xs={12} md={8}>
              {/* Быстрые действия */}
              <Slide direction="right" in={true} timeout={700}>
                <Paper elevation={0} sx={{ 
                  p: 4, 
                  mb: 3,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
                    ⚡ Быстрые действия
                  </Typography>
                  
                  <Grid container spacing={2} justifyContent="center">
                    {quickActions.map((action, index) => (
                      <Grid item xs={12} sm={6} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Card
                          onClick={action.onClick}
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: `2px solid ${alpha(action.color, 0.1)}`,
                            background: 'transparent',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            maxWidth: '300px',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              borderColor: action.color,
                              boxShadow: `0 8px 25px ${alpha(action.color, 0.2)}`
                            }
                          }}
                        >
                          <Box sx={{ 
                            color: action.color,
                            mb: 2,
                            fontSize: '2.5rem'
                          }}>
                            {action.icon}
                          </Box>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {action.description}
                          </Typography>
                          <Chip
                            label={action.count}
                            size="small"
                            sx={{
                              backgroundColor: alpha(action.color, 0.1),
                              color: action.color,
                              fontWeight: 'bold'
                            }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Slide>

              {/* Недавняя активность */}
              <Slide direction="right" in={true} timeout={900}>
                <Paper elevation={0} sx={{ 
                  p: 4, 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
                    📈 Недавняя активность
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <List sx={{ width: '100%', maxWidth: '800px' }}>
                      {recentActivities.map((activity, index) => (
                        <React.Fragment key={index}>
                          <ListItem 
                            sx={{
                              borderRadius: 3,
                              mb: 2,
                              p: 2,
                              background: alpha(activity.color, 0.05),
                              border: `1px solid ${alpha(activity.color, 0.1)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(4px)',
                                background: alpha(activity.color, 0.1)
                              }
                            }}
                          >
                            <ListItemIcon sx={{ color: activity.color, minWidth: 40 }}>
                              {activity.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {activity.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {activity.date}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <Typography variant="body2">
                                    {activity.description}
                                  </Typography>
                                  {activity.amount && (
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', mt: 0.5 }}>
                                      {activity.amount}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < recentActivities.length - 1 && (
                            <Divider sx={{ my: 1, opacity: 0.5 }} />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </Paper>
              </Slide>
            </Grid>
          </Grid>

          {/* Диалог редактирования профиля */}
          <Dialog 
            open={editDialogOpen} 
            onClose={handleCancel}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              ✏️ Редактирование профиля
              <IconButton 
                onClick={handleCancel} 
                sx={{ color: 'white' }}
                size="small"
              >
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'primary.main' }} />
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
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'primary.main' }} />
                  }}
                />
                
                <TextField
                  fullWidth
                  type="tel"
                  label="Телефон"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'primary.main' }} />
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Адрес"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: <Place sx={{ mr: 1, color: 'primary.main' }} />
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={handleCancel}
                variant="outlined"
                sx={{ borderRadius: 3 }}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={loading}
                sx={{ borderRadius: 3 }}
                startIcon={<Save />}
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfilePage;