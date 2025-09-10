import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  People as UsersIcon,
  Category as CategoriesIcon,
  Inventory as ProductsIcon,
  TrendingUp as StatsIcon,
  Refresh as RefreshIcon,
  Add,
  Edit,
  Delete,
  Menu as MenuIcon
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';
import { mockCategories } from '../../../data/mockData';

const drawerWidth = 240;

const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {loading ? '-' : value.toLocaleString()}
          </Typography>
        </Box>
        <Box
          sx={{
            color: color,
            backgroundColor: `${color}20`,
            padding: '12px',
            borderRadius: '12px'
          }}
        >
          {icon}
        </Box>
      </Box>
      {loading && <LinearProgress sx={{ mt: 1 }} />}
    </CardContent>
  </Card>
);

const CategoryCard = ({ category, onEdit, onDelete }) => (
  <Card sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)' } }}>
    <Box
      sx={{
        height: 120,
        backgroundImage: `url(${category.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: 'grey.100'
      }}
    />
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {category.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {category.productsCount || 0} товаров
      </Typography>
      <Typography variant="caption" color="text.secondary">
        SLUG: {category.slug}
      </Typography>
    </CardContent>
    <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Edit />}
        onClick={() => onEdit(category)}
      >
        Редактировать
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<Delete />}
        onClick={() => onDelete(category.id)}
      >
        Удалить
      </Button>
    </Box>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalSales: 0,
    recentOrders: []
  });
  const [categories, setCategories] = useState(mockCategories);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const theme = useTheme();

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setOpenCategoryDialog(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setOpenCategoryDialog(true);
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(categories.filter(c => c.id !== categoryId));
  };

  const handleSaveCategory = (categoryData) => {
    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id ? categoryData : c
      ));
    } else {
      const newCategory = {
        ...categoryData,
        id: Date.now(),
        slug: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
        productsCount: 0
      };
      setCategories([...categories, newCategory]);
    }
    setOpenCategoryDialog(false);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Дашборд', icon: <DashboardIcon />, section: 'dashboard' },
    { text: 'Категории', icon: <CategoriesIcon />, section: 'categories' },
    { text: 'Товары', icon: <ProductsIcon />, section: 'products' },
    { text: 'Заказы', icon: <OrdersIcon />, section: 'orders' },
    { text: 'Пользователи', icon: <UsersIcon />, section: 'users' },
    { text: 'Статистика', icon: <StatsIcon />, section: 'statistics' }
  ];

  const statCards = [
    {
      title: 'Всего заказов',
      value: stats.totalOrders,
      icon: <OrdersIcon />,
      color: theme.palette.primary.main
    },
    {
      title: 'Товары',
      value: stats.totalProducts,
      icon: <ProductsIcon />,
      color: theme.palette.success.main
    },
    {
      title: 'Пользователи',
      value: stats.totalUsers,
      icon: <UsersIcon />,
      color: theme.palette.info.main
    },
    {
      title: 'Общие продажи',
      value: stats.totalSales,
      icon: <StatsIcon />,
      color: theme.palette.warning.main,
      format: value => `${value.toLocaleString()} ₽`
    }
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Панель управления
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.section} disablePadding>
            <ListItemButton
              selected={activeSection === item.section}
              onClick={() => setActiveSection(item.section)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'categories':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1">
                Управление категориями
              </Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddCategory}>
                Добавить категорию
              </Button>
            </Box>

            <Grid container spacing={3}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <CategoryCard
                    category={category}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'dashboard':
      default:
        return (
          <>
            {/* Заголовок дашборда */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" component="h1">
                  Статистика
                </Typography>
              </Box>
              <IconButton 
                onClick={fetchStats} 
                disabled={refreshing}
                sx={{ 
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>

            {/* Статистика */}
            <Grid container spacing={3} mb={4}>
              {statCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <StatCard
                    title={card.title}
                    value={card.format ? card.format(card.value) : card.value}
                    icon={card.icon}
                    color={card.color}
                    loading={loading && !refreshing}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Быстрые действия и заказы */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Последние заказы
                  </Typography>
                  {stats.recentOrders.length > 0 ? (
                    <Box>
                      {stats.recentOrders.map((order) => (
                        <Box
                          key={order.id}
                          sx={{
                            p: 2,
                            mb: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2">
                                Заказ #{order.order_number}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {order.customer_name} • {order.customer_email}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Chip
                                label={order.status}
                                size="small"
                                color={
                                  order.status === 'delivered' ? 'success' :
                                  order.status === 'processing' ? 'primary' : 'default'
                                }
                              />
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                {order.total_amount} ₽
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="textSecondary" textAlign="center" py={4}>
                      {loading ? 'Загрузка заказов...' : 'Заказов не найдено'}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar для мобильных */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { sm: 'none' }
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {menuItems.find(item => item.section === activeSection)?.text || 'Панель управления'}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Основной контент */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, sm: 0 } 
        }}
      >
        {renderContent()}

        {/* Диалог категории */}
        <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Название категории"
              fullWidth
              variant="outlined"
              defaultValue={editingCategory?.name || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="URL изображения"
              fullWidth
              variant="outlined"
              defaultValue={editingCategory?.image || ''}
              placeholder="https://example.com/image.jpg"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoryDialog(false)}>Отмена</Button>
            <Button
              variant="contained"
              onClick={() => handleSaveCategory({
                name: document.querySelector('input[aria-label="Название категории"]').value,
                image: document.querySelector('input[aria-label="URL изображения"]').value,
                ...(editingCategory && { 
                  id: editingCategory.id, 
                  slug: editingCategory.slug, 
                  productsCount: editingCategory.productsCount 
                })
              })}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminDashboard;