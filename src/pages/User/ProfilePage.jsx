// pages/User/ProfilePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Fade,
  Slide,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Save,
  History,
  Favorite,
  RateReview,
  Person,
  Email,
  Phone,
  Place,
  CalendarToday,
  ShoppingBag,
  Close,
  Lock,
  Security,
  Payment,
  AccountCircle,
  LocalShipping,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { favoritesService } from '../../services/favoritesService';
import { reviewService } from '../../services/reviewService';
import { supabase } from '../../services/supabaseClient';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    favoriteItems: 0,
    writtenReviews: 0
  });
  const [userProfile, setUserProfile] = useState(null);

  // Загрузка данных профиля из базы данных
// В useEffect:
useEffect(() => {
  const loadUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      setProfileLoading(true);
      
      // Загружаем полный профиль пользователя из базы
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();
        
      if (error) {
        console.error('Ошибка загрузки профиля:', error);
        setUserProfile(currentUser);
        
        setFormData({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || ''
        });
      } else {
        setUserProfile(profile);
        
        // ИСПРАВЛЕНО: используем name вместо комбинации first_name + last_name
        setFormData({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || ''
        });
      }
      
      await loadUserData();
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setUserProfile(currentUser);
    } finally {
      setProfileLoading(false);
    }
  };

  loadUserProfile();
}, [currentUser]);

  // Загрузка статистики и активности
  const loadUserData = useCallback (async () => {
    if (!currentUser) return;

    try {
      // Загрузка заказов
      let orders = [];
      try {
        orders = await orderService.getUserOrders(currentUser.id);
        if (!Array.isArray(orders)) orders = [];
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
        orders = [];
      }

      // Загрузка избранного
      let favorites = [];
      try {
        // Проверяем, существует ли сервис избранного
        if (favoritesService && typeof favoritesService.getUserFavorites === 'function') {
          favorites = await favoritesService.getUserFavorites(currentUser.id);
        }
        if (!Array.isArray(favorites)) favorites = [];
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        favorites = [];
      }

      // Загрузка отзывов
      let reviews = [];
      try {
        // Проверяем, существует ли сервис отзывов
        if (reviewService && typeof reviewService.getUserReviews === 'function') {
          reviews = await reviewService.getUserReviews(currentUser.id);
        }
        if (!Array.isArray(reviews)) reviews = [];
      } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        reviews = [];
      }

      // Обновление статистики
      setStats({
        totalOrders: orders.length,
        favoriteItems: favorites.length,
        writtenReviews: reviews.length
      });

      // Формирование активности
      const activities = [];

      // Добавляем последние заказы
      if (orders.length > 0) {
        const recentOrders = orders.slice(0, 3);
        recentOrders.forEach(order => {
          activities.push({
            type: 'order',
            title: `Заказ #${order.order_number || order.id} ${getOrderStatusText(order.status)}`,
            description: order.order_items?.[0]?.name || 'Товары',
            date: formatRelativeTime(order.created_at),
            amount: `${order.total_amount?.toLocaleString('ru-RU')} ₽`,
            icon: getOrderStatusIcon(order.status),
            color: getOrderStatusColor(order.status),
            onClick: () => navigate(`/orders/${order.id}`)
          });
        });
      }

      // Добавляем последние добавления в избранное
      if (favorites.length > 0) {
        const recentFavorites = favorites.slice(0, 2);
        recentFavorites.forEach(fav => {
          activities.push({
            type: 'favorite',
            title: 'Добавлен в избранное',
            description: fav.product?.name || 'Товар',
            date: formatRelativeTime(fav.created_at || fav.added_at),
            icon: <Favorite />,
            color: theme.palette.error.main,
            onClick: () => navigate(`/product/${fav.product_id || fav.id}`)
          });
        });
      }

      // Добавляем последние отзывы
      if (reviews.length > 0) {
        const recentReviews = reviews.slice(0, 2);
        recentReviews.forEach(review => {
          activities.push({
            type: 'review',
            title: 'Оставлен отзыв',
            description: review.product?.name || 'Товар',
            date: formatRelativeTime(review.created_at),
            rating: review.rating,
            icon: <RateReview />,
            color: theme.palette.warning.main,
            onClick: () => navigate(`/product/${review.product_id}`)
          });
        });
      }

      // Если активность пустая, добавляем приветственное сообщение
      if (activities.length === 0) {
        activities.push({
          type: 'welcome',
          title: 'Добро пожаловать!',
          description: 'Здесь будет отображаться ваша активность',
          date: 'Только что',
          icon: <AccountCircle />,
          color: theme.palette.primary.main
        });
      }

      // Сортируем по дате (новые сначала) и ограничиваем количеством
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      setFallbackData();
    }
  });

  const setFallbackData = () => {
    setStats({
      totalOrders: 0,
      favoriteItems: 0,
      writtenReviews: 0
    });

    setRecentActivities([
      {
        type: 'welcome',
        title: 'Добро пожаловать!',
        description: 'Здесь будет отображаться ваша активность',
        date: 'Только что',
        icon: <AccountCircle />,
        color: theme.palette.primary.main
      }
    ]);
  };

  const getOrderStatusText = (status) => {
    const statusMap = {
      'pending': 'создан',
      'processing': 'в обработке',
      'shipped': 'отправлен',
      'delivered': 'доставлен',
      'completed': 'завершен',
      'cancelled': 'отменен'
    };
    return statusMap[status] || status;
  };

  const getOrderStatusIcon = (status) => {
    const statusIcons = {
      'pending': <ShoppingBag />,
      'processing': <Payment />,
      'shipped': <LocalShipping />,
      'delivered': <CheckCircle />,
      'completed': <CheckCircle />,
      'cancelled': <Close />
    };
    return statusIcons[status] || <ShoppingBag />;
  };

  const getOrderStatusColor = (status) => {
    const statusColors = {
      'pending': theme.palette.info.main,
      'processing': theme.palette.warning.main,
      'shipped': theme.palette.primary.main,
      'delivered': theme.palette.success.main,
      'completed': theme.palette.success.main,
      'cancelled': theme.palette.error.main
    };
    return statusColors[status] || theme.palette.primary.main;
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Недавно';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
    setActiveTab(0);
  };

  const handleCancel = () => {
    setEditDialogOpen(false);
    // Восстанавливаем оригинальные данные
    if (userProfile) {
      const fullName = userProfile.first_name && userProfile.last_name 
        ? `${userProfile.first_name} ${userProfile.last_name}`
        : userProfile.name || userProfile.email;
      
      setFormData({
        name: fullName,
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || ''
      });
    }
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  try {
    // ИСПРАВЛЕНО: сохраняем только имя, не разделяем на first_name/last_name
    const { error } = await supabase
      .from('users')
      .update({
        name: formData.name, // ← Сохраняем полное имя в поле name
        phone: formData.phone,
        address: formData.address,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);

    if (error) {
      throw error;
    }
    
    // Обновляем контекст аутентификации
    const result = await updateProfile({
      name: formData.name, // ← Сохраняем полное имя
      phone: formData.phone,
      address: formData.address
    });
    
    if (result.success) {
      setMessage('Профиль успешно обновлен');
      setMessageType('success');
      setEditDialogOpen(false);
      
      await loadUserData();
      
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Новые пароли не совпадают');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Пароль должен содержать минимум 6 символов');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Обновление пароля в Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      
      setMessage('Пароль успешно изменен');
      setMessageType('success');
      
      setTimeout(() => {
        setMessage('');
        setEditDialogOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }, 3000);

    } catch (error) {
      setMessage('Ошибка при смене пароля: ' + error.message);
      setMessageType('error');
      console.error('Password change error:', error);
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
      count: stats.totalOrders
    },
    {
      icon: <Favorite sx={{ fontSize: 24 }} />,
      title: 'Избранное',
      description: 'Ваши сохраненные товары',
      onClick: () => navigate('/wishlist'),
      color: theme.palette.error.main,
      count: stats.favoriteItems
    },
    {
      icon: <RateReview sx={{ fontSize: 24 }} />,
      title: 'Мои отзывы',
      description: 'Просмотр и управление отзывами',
      onClick: () => navigate('/reviews'),
      color: theme.palette.warning.main,
      count: stats.writtenReviews
    },
  ];

  const statsData = [
    { label: 'Всего заказов', value: stats.totalOrders, color: 'primary', icon: <ShoppingBag /> },
    { label: 'Избранные товары', value: stats.favoriteItems, color: 'error', icon: <Favorite /> },
    { label: 'Написано отзывов', value: stats.writtenReviews, color: 'warning', icon: <RateReview /> },
  ];

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="h6">Пожалуйста, войдите в систему</Typography>
      </Container>
    );
  }

  if (profileLoading) {
    return (
      <Container maxWidth="xl" sx={{ 
        py: 12, 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress 
          size={70} 
          thickness={3} 
          sx={{ 
            color: 'primary.main', 
            mb: 3,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round'
            }
          }} 
        />
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Загрузка профиля...
        </Typography>
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
                    {userProfile?.name?.charAt(0).toUpperCase() || userProfile?.email?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>

                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {userProfile?.name || userProfile?.first_name || userProfile?.email}
                  </Typography>
                  <br></br>

                  <Box sx={{ textAlign: 'left', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>{userProfile?.email}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>{userProfile?.phone || 'Не указан'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Place sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>{userProfile?.address || 'Не указан'}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography>
                        {userProfile?.created_at 
                          ? new Date(userProfile.created_at).toLocaleDateString('ru-RU')
                          : 'Дата регистрации неизвестна'}
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
                    {statsData.map((stat, index) => (
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
                          <Typography variant="body2" component="div" color="text.secondary" sx={{ mb: 2 }}>
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
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => (
                          <React.Fragment key={index}>
                            <ListItem 
                              onClick={activity.onClick}
                              sx={{
                                borderRadius: 3,
                                mb: 2,
                                p: 2,
                                background: alpha(activity.color, 0.05),
                                border: `1px solid ${alpha(activity.color, 0.1)}`,
                                transition: 'all 0.3s ease',
                                cursor: activity.onClick ? 'pointer' : 'default',
                                '&:hover': activity.onClick ? {
                                  transform: 'translateX(4px)',
                                  background: alpha(activity.color, 0.1)
                                } : {}
                              }}
                            >
                              <ListItemIcon sx={{ color: activity.color, minWidth: 40 }}>
                                {activity.icon}
                              </ListItemIcon>
                              <ListItemText
                                primaryTypographyProps={{ component: "div" }}
                                secondaryTypographyProps={{ component: "div" }}
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
                                    {activity.rating && (
                                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        {[...Array(5)].map((_, i) => (
                                          <Box
                                            key={i}
                                            sx={{
                                              color: i < activity.rating ? '#ffc107' : '#e0e0e0',
                                              fontSize: '1rem'
                                            }}
                                          >
                                            ★
                                          </Box>
                                        ))}
                                      </Box>
                                    )}
                                  </Box>
                                }
                              />
                            </ListItem>
                            {index < recentActivities.length - 1 && (
                              <Divider sx={{ my: 1, opacity: 0.5 }} />
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText
                            primary="Активность отсутствует"
                            secondary="Здесь будет отображаться ваша активность после совершения действий"
                          />
                        </ListItem>
                      )}
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

            <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ px: 2 }}>
              <Tab icon={<Person />} label="Профиль" />
              <Tab icon={<Lock />} label="Безопасность" />
            </Tabs>

            <DialogContent sx={{ p: 4 }}>
              {activeTab === 0 ? (
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Полное имя"
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
                    disabled
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'primary.main' }} />
                    }}
                    helperText="Email нельзя изменить"
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
              ) : (
                <Box component="form" onSubmit={handlePasswordSubmit}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Текущий пароль"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Security sx={{ mr: 1, color: 'primary.main' }} />
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    type="password"
                    label="Новый пароль"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: 'primary.main' }} />
                    }}
                    helperText="Минимум 6 символов"
                  />
                  
                  <TextField
                    fullWidth
                    type="password"
                    label="Подтвердите пароль"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: <Lock sx={{ mr: 1, color: 'primary.main' }} />
                    }}
                  />
                </Box>
              )}
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
                onClick={activeTab === 0 ? handleSubmit : handlePasswordSubmit}
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