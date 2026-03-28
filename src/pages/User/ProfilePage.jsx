import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CircularProgress,
  Stack,
  CardContent
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
  CheckCircle,
  Image as ImageIcon,
  PhotoCamera,
  SupportAgent,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { favoritesService } from '../../services/favoritesService';
import { reviewService } from '../../services/reviewService';
import { adminService } from '../../services/adminService';
import { apiService } from '../../services/api';

/** Ссылка на фото: http(s) или путь с сайта, до 500 символов (как в БД). */
const isAvatarUrlAllowed = (s) => {
  if (!s || typeof s !== 'string') return false;
  const t = s.trim();
  if (!t || t.length > 500) return false;
  return /^https?:\/\//i.test(t) || t.startsWith('/');
};

const ProfilePage = () => {
  const { currentUser, updateProfile, loadUserData: fetchProfileFromApi } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: ''
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarFileInputRef = useRef(null);
  const [mainContentTab, setMainContentTab] = useState(0);
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportError, setSupportError] = useState('');

  const formFromUser = useCallback((user) => {
    if (!user) {
      return { name: '', email: '', phone: '', address: '', avatarUrl: '' };
    }
    const name =
      user.name ||
      (user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '') ||
      (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '') ||
      '';
    return {
      name,
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      avatarUrl: user.avatar_url || ''
    };
  }, []);

  // Вспомогательные функции с useCallback
  const getOrderStatusText = useCallback((status) => {
    const statusMap = {
      'pending': 'создан',
      'processing': 'в обработке',
      'shipped': 'отправлен',
      'delivered': 'доставлен',
      'completed': 'завершен',
      'cancelled': 'отменен'
    };
    return statusMap[status] || status;
  }, []);

  const getOrderStatusIcon = useCallback((status) => {
    const statusIcons = {
      'pending': <ShoppingBag />,
      'processing': <Payment />,
      'shipped': <LocalShipping />,
      'delivered': <CheckCircle />,
      'completed': <CheckCircle />,
      'cancelled': <Close />
    };
    return statusIcons[status] || <ShoppingBag />;
  }, []);

  const getOrderStatusColor = useCallback((status) => {
    const statusColors = {
      'pending': theme.palette.info.main,
      'processing': theme.palette.warning.main,
      'shipped': theme.palette.primary.main,
      'delivered': theme.palette.success.main,
      'completed': theme.palette.success.main,
      'cancelled': theme.palette.error.main
    };
    return statusColors[status] || theme.palette.primary.main;
  }, [theme]);

  const formatRelativeTime = useCallback((dateString) => {
    if (!dateString) return 'Недавно';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} дн назад`;
    
    return date.toLocaleDateString('ru-RU');
  }, []);

  const setFallbackData = useCallback(() => {
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
  }, [theme]);

  // Загрузка данных профиля
  const fetchUserStatsAndActivity = useCallback(async () => {
    if (!currentUser) {
      console.log('❌ Нет currentUser');
      setFallbackData();
      return;
    }

    console.log('🟢 Начинаем загрузку данных для пользователя ID:', currentUser.id);

    try {
      // Загрузка заказов
      let orders = [];
      try {
        console.log('📥 Загружаем заказы...');
        const response = await orderService.getUserOrders(currentUser.id);
        console.log('✅ Ответ заказов:', response);
        
        // Получаем массив из data
        if (response && response.success && Array.isArray(response.data)) {
          orders = response.data;
          console.log(`✅ Получено заказов: ${orders.length}`);
        } else if (Array.isArray(response)) {
          orders = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          orders = response.data;
        }
        
        console.log('📊 Финальные заказы:', orders);
      } catch (error) {
        console.error('❌ Ошибка загрузки заказов:', error);
        orders = [];
      }

      // Загрузка избранного
      let favorites = [];
      let favoritesCount = 0;
      try {
        console.log('📥 Загружаем избранное...');
        const response = await favoritesService.getUserFavorites(currentUser.id);
        console.log('✅ Ответ избранного:', response);
        
        // ПРАВИЛЬНАЯ обработка структуры {success: true, items: Array(3), count: 3}
        if (response && response.success) {
          // Берем items из корня ответа
          if (response.items && Array.isArray(response.items)) {
            favorites = response.items;
            favoritesCount = response.items.length;
            console.log(`✅ Избранное из response.items: ${favoritesCount} товаров`);
          }
          // Если items нет, пробуем count
          else if (response.count !== undefined) {
            favoritesCount = response.count;
            console.log(`✅ Избранное из response.count: ${favoritesCount} товаров`);
          }
        }
        
      } catch (error) {
        console.error('❌ Ошибка загрузки избранного:', error);
        favorites = [];
        favoritesCount = 0;
      }

      // Загрузка отзывов
      let reviews = [];
      try {
        console.log('📥 Загружаем отзывы...');
        const response = await reviewService.getUserReviews(currentUser.id);
        console.log('✅ Ответ отзывов:', response);
        
        // Получаем массив из reviews
        if (response && response.success && Array.isArray(response.reviews)) {
          reviews = response.reviews;
          console.log(`✅ Получено отзывов: ${reviews.length}`);
        } else if (Array.isArray(response)) {
          reviews = response;
        } else if (response && response.reviews && Array.isArray(response.reviews)) {
          reviews = response.reviews;
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки отзывов:', error);
        reviews = [];
      }

      // Обновление статистики
      const newStats = {
        totalOrders: orders.length,
        favoriteItems: favorites.length,
        writtenReviews: reviews.length
      };
      
      console.log('📊 Обновляем статистику:', newStats);
      setStats(newStats);

      // Формирование активности
      const activities = [];

      // Добавляем последние заказы - ИСПРАВЛЕНО
      if (orders.length > 0) {
        console.log('📦 Добавляем заказы в активность, всего:', orders.length);
        const recentOrders = orders.slice(0, 3);
        recentOrders.forEach((order, index) => {
          console.log(`  Заказ ${index + 1}:`, order);
          // Проверяем что order - это объект заказа, а не ответ API
          if (order && typeof order === 'object' && order.id) {
            activities.push({
              type: 'order',
              title: `Заказ #${order.order_number || order.id} ${getOrderStatusText(order.status)}`,
              date: formatRelativeTime(order.created_at),
              amount: `${order.total_amount ? order.total_amount.toLocaleString('ru-RU') : 0} ₽`,
              icon: getOrderStatusIcon(order.status),
              color: getOrderStatusColor(order.status),
              onClick: () => navigate(`/orders/${order.id}`)
            });
          }
        });
      }

      // Добавляем последние добавления в избранное
      if (favorites.length > 0) {
        console.log('❤️ Добавляем избранное в активность, всего:', favorites.length);
        const recentFavorites = favorites.slice(0, 2);
        recentFavorites.forEach((fav, index) => {
          console.log(`  Избранное ${index + 1}:`, fav);
          if (fav && typeof fav === 'object') {
            activities.push({
              type: 'favorite',
              title: 'Добавлен в избранное',
              date: formatRelativeTime(fav.created_at || fav.added_at),
              icon: <Favorite />,
              color: theme.palette.error.main,
              onClick: () => navigate(`/product/${fav.product_id || fav.id}`)
            });
          }
        });
      }

      // Добавляем последние отзывы
      if (reviews.length > 0) {
        console.log('⭐ Добавляем отзывы в активность, всего:', reviews.length);
        const recentReviews = reviews.slice(0, 2);
        recentReviews.forEach((review, index) => {
          console.log(`  Отзыв ${index + 1}:`, review);
          if (review && typeof review === 'object' && review.id) {
            activities.push({
              type: 'review',
              title: 'Оставлен отзыв',
              date: formatRelativeTime(review.created_at),
              rating: review.rating,
              icon: <RateReview />,
              color: theme.palette.warning.main,
              onClick: () => navigate(`/product/${review.product_id}`)
            });
          }
        });
      }

      // Если активность пустая, добавляем приветственное сообщение
      if (activities.length === 0) {
        console.log('📭 Активность пуста, добавляем приветственное сообщение');
        activities.push({
          type: 'welcome',
          title: 'Добро пожаловать!',
          description: 'Здесь будет отображаться ваша активность',
          date: 'Только что',
          icon: <AccountCircle />,
          color: theme.palette.primary.main
        });
      }

      console.log('📈 Всего активностей:', activities.length);
      console.log('📅 Активности:', activities);

      // Сортируем по дате (новые сначала) и ограничиваем количеством
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('❌ Ошибка загрузки данных пользователя:', error);
      setFallbackData();
    }
  }, [
    currentUser, 
    navigate, 
    theme, 
    getOrderStatusText, 
    getOrderStatusIcon, 
    getOrderStatusColor, 
    formatRelativeTime, 
    setFallbackData
  ]);

  // Загрузка профиля пользователя
  const loadUserProfile = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setProfileLoading(true);
      const freshData = await fetchProfileFromApi(); 
      const user = freshData || currentUser;
      setUserProfile(user);
      setFormData(formFromUser(user));
      await fetchUserStatsAndActivity();
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setUserProfile(currentUser);
    } finally {
      setProfileLoading(false);
    }
  }, [currentUser, fetchProfileFromApi, fetchUserStatsAndActivity, formFromUser]); 

  useEffect(() => {
    if (currentUser && !userProfile) { loadUserProfile(); }
  }, [currentUser?.id]);

  const handleEdit = () => {
    if (userProfile) {
      setFormData(formFromUser(userProfile));
    }
    setEditDialogOpen(true);
    setActiveTab(0);
  };

  const handleCancel = () => {
    setEditDialogOpen(false);
    if (userProfile) {
      setFormData(formFromUser(userProfile));
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

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessage('Размер файла не больше 2 МБ');
      setMessageType('error');
      e.target.value = '';
      return;
    }
    setAvatarUploading(true);
    setMessage('');
    try {
      const data = await apiService.uploadAvatar(file);
      if (data?.success && data.url) {
        setFormData((prev) => ({ ...prev, avatarUrl: data.url }));
      } else {
        setMessage(data?.message || 'Не удалось загрузить фото');
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err.message || 'Ошибка загрузки фото');
      setMessageType('error');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Обновляем профиль через adminService
      const trimmedAvatar = formData.avatarUrl.trim();
      if (trimmedAvatar && !isAvatarUrlAllowed(trimmedAvatar)) {
        setMessage('Укажите корректную ссылку на фото (https://… или путь, начинающийся с /), не длиннее 500 символов');
        setMessageType('error');
        setLoading(false);
        return;
      }

      const result = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        avatar_url: trimmedAvatar
      });
      
      if (result.success) {
        setMessage('Профиль успешно обновлен');
        setMessageType('success');
        setEditDialogOpen(false);
        
        const fresh = await fetchProfileFromApi();
        if (fresh) {
          setUserProfile(fresh);
          setFormData(formFromUser(fresh));
        }
        
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
      // TODO: Реализовать смену пароля через API
      setMessage('Смена пароля временно недоступна');
      setMessageType('warning');
      
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

  const ticketStatusLabel = useCallback((s) => {
    const map = {
      new: 'Новый',
      in_progress: 'В работе',
      resolved: 'Отвечено',
      closed: 'Закрыт',
    };
    return map[s] || s || '—';
  }, []);

  const fetchSupportTickets = useCallback(async () => {
    setSupportLoading(true);
    setSupportError('');
    try {
      const data = await apiService.getMySupportTickets();
      setSupportTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (e) {
      setSupportError(e.message || 'Не удалось загрузить обращения');
      setSupportTickets([]);
    } finally {
      setSupportLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainContentTab === 1 && currentUser) {
      fetchSupportTickets();
    }
  }, [mainContentTab, currentUser?.id, fetchSupportTickets]);

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
                    src={
                      isAvatarUrlAllowed(userProfile?.avatar_url)
                        ? userProfile.avatar_url.trim()
                        : undefined
                    }
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
                    {(userProfile?.name || userProfile?.firstName || userProfile?.email || 'U').charAt(0).toUpperCase()}
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
                          ? `На сайте с: ${new Date(userProfile.created_at).toLocaleDateString()}`
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
            </Grid>

            {/* Основное содержание */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  mb: 2,
                  borderRadius: 4,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                <Tabs
                  value={mainContentTab}
                  onChange={(_, v) => setMainContentTab(v)}
                  variant="fullWidth"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    '& .MuiTab-root': { py: 2, fontWeight: 600 },
                  }}
                >
                  <Tab
                    icon={<DashboardIcon fontSize="small" />}
                    iconPosition="start"
                    label="Обзор"
                  />
                  <Tab
                    icon={<SupportAgent fontSize="small" />}
                    iconPosition="start"
                    label="Поддержка"
                  />
                </Tabs>
              </Paper>

              {mainContentTab === 0 && (
                <>
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
                </>
              )}

              {mainContentTab === 1 && (
                <Slide direction="right" in={true} timeout={500}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background:
                        'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2,
                        mb: 3,
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Обращения в поддержку
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={fetchSupportTickets}
                        disabled={supportLoading}
                      >
                        Обновить
                      </Button>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Здесь отображаются ваши вопросы и ответы администратора. Новое обращение можно отправить на{' '}
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => navigate('/contacts')}
                        sx={{ verticalAlign: 'baseline', p: 0, minWidth: 0 }}
                      >
                        странице контактов
                      </Button>
                      .
                    </Typography>

                    {supportError && (
                      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSupportError('')}>
                        {supportError}
                      </Alert>
                    )}

                    {supportLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                      </Box>
                    ) : supportTickets.length === 0 ? (
                      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                        Пока нет обращений, привязанных к вашему аккаунту.
                      </Typography>
                    ) : (
                      <Stack spacing={2}>
                        {supportTickets.map((t) => (
                          <Card
                            key={t.id}
                            variant="outlined"
                            sx={{
                              borderRadius: 3,
                              borderColor: alpha(theme.palette.primary.main, 0.15),
                            }}
                          >
                            <CardContent>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                  gap: 1,
                                  mb: 1.5,
                                }}
                              >
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {t.subject || 'Без темы'}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={t.ticket_number || `#${t.id}`}
                                  variant="outlined"
                                />
                                <Chip
                                  size="small"
                                  label={ticketStatusLabel(t.status)}
                                  color={
                                    t.status === 'resolved' || t.status === 'closed'
                                      ? 'success'
                                      : t.status === 'in_progress'
                                        ? 'warning'
                                        : 'default'
                                  }
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                {t.created_at
                                  ? `Создано: ${new Date(t.created_at).toLocaleString('ru-RU')}`
                                  : ''}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                <strong>Ваш вопрос:</strong> {t.message}
                              </Typography>
                              <Divider sx={{ my: 2 }} />
                              {t.response && String(t.response).trim() !== '' ? (
                                <Alert severity="info" icon={false} sx={{ borderRadius: 2 }}>
                                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                    Ответ поддержки
                                  </Typography>
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {t.response}
                                  </Typography>
                                  {t.responded_at && (
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                      {new Date(t.responded_at).toLocaleString('ru-RU')}
                                    </Typography>
                                  )}
                                </Alert>
                              ) : (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                  Ответ пока не получен. Мы ответим в ближайшее время.
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Slide>
              )}
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
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      mb: 3
                    }}
                  >
                    <Avatar
                      src={
                        isAvatarUrlAllowed(formData.avatarUrl)
                          ? formData.avatarUrl.trim()
                          : undefined
                      }
                      sx={{
                        width: 88,
                        height: 88,
                        mb: 2,
                        border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {(formData.name || formData.email || 'U').charAt(0).toUpperCase()}
                    </Avatar>
                    <input
                      ref={avatarFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={handleAvatarFileChange}
                    />
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      startIcon={
                        avatarUploading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <PhotoCamera />
                        )
                      }
                      disabled={avatarUploading || loading}
                      onClick={() => avatarFileInputRef.current?.click()}
                      sx={{ mb: 2 }}
                    >
                      {avatarUploading ? 'Загрузка…' : 'Выбрать файл с устройства'}
                    </Button>
                    <TextField
                      fullWidth
                      label="Или ссылка на фото"
                      name="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={handleChange}
                      placeholder="https://… или /api/uploads/…"
                      sx={{ mb: 1 }}
                      InputProps={{
                        startAdornment: <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                      }}
                      helperText="Можно загрузить файл выше или вставить URL (https или путь с /), до 500 символов."
                    />
                    <Button
                      type="button"
                      size="small"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, avatarUrl: '' }))
                      }
                    >
                      Убрать фото
                    </Button>
                  </Box>

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