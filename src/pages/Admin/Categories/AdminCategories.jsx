import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Divider,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Smartphone,
  Laptop,
  Headphones,
  DevicesOther
} from '@mui/icons-material';

// Сервис для работы с API (замените на вашу реализацию)
import { categoryService } from '../../../services/categoryService';

const AdminCategories = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  // Функция для получения категорий из базы данных
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError('Не удалось загрузить категории: ' + err.message);
      console.error('Ошибка загрузки категорий:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка категорий при монтировании компонента
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setFormData({ name: '', slug: '' });
    setEditingCategory(null);
    setOpenDialog(true);
  };

  const handleEditCategory = (category) => {
    setFormData({ name: category.name, slug: category.slug });
    setEditingCategory(category);
    setOpenDialog(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await categoryService.deleteCategory(categoryId);
        // Обновляем список после удаления
        await fetchCategories();
      } catch (err) {
        setError('Не удалось удалить категорию: ' + err.message);
      }
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        // Обновление существующей категории
        await categoryService.updateCategory(editingCategory.id, formData);
      } else {
        // Создание новой категории
        await categoryService.createCategory(formData);
      }
      
      // Обновляем список категорий
      await fetchCategories();
      setOpenDialog(false);
    } catch (err) {
      setError('Не удалось сохранить категорию: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Функция для получения иконки по названию категории
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Смартфоны': <Smartphone />,
      'Ноутбуки': <Laptop />,
      'Наушники': <Headphones />,
      'Аксессуары': <DevicesOther />
    };
    
    return iconMap[categoryName] || <DevicesOther />;
  };

  // Функция для получения цвета по названию категории
  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'Смартфоны': theme.palette.primary.main,
      'Ноутбуки': theme.palette.secondary.main,
      'Наушники': theme.palette.success.main,
      'Аксессуары': theme.palette.warning.main
    };
    
    return colorMap[categoryName] || theme.palette.info.main;
  };

  const CategoryCard = ({ category }) => (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      border: `1px solid ${theme.palette.divider}`,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
        borderColor: getCategoryColor(category.name)
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: 120,
        backgroundColor: `${getCategoryColor(category.name)}15`,
        color: getCategoryColor(category.name)
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 60,
          height: 60,
          borderRadius: '50%',
          backgroundColor: `${getCategoryColor(category.name)}20`,
          fontSize: 32
        }}>
          {getCategoryIcon(category.name)}
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {category.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            label={`${category.products_count || 0} товаров`}
            size="small"
            variant="outlined"
            sx={{ 
              backgroundColor: `${theme.palette.primary.main}08`,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              fontWeight: 500
            }}
          />
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            SLUG:
          </Typography>
          <Typography variant="body2" sx={{ 
            fontFamily: 'monospace', 
            backgroundColor: theme.palette.grey[100],
            p: 0.5,
            borderRadius: 1,
            mt: 0.5,
            display: 'inline-block'
          }}>
            {category.slug}
          </Typography>
        </Box>
      </CardContent>
      
      <Box sx={{ p: 2, pt: 0 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => handleEditCategory(category)}
            sx={{ minWidth: '120px' }}
          >
            Редактировать
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => handleDeleteCategory(category.id)}
            sx={{ minWidth: '100px' }}
          >
            Удалить
          </Button>
        </Box>
      </Box>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Заголовок */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        boxShadow: theme.shadows[1]
      }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            Управление категориями
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Создавайте и редактируйте категории товаров
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={handleAddCategory}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
          Добавить категорию
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Сетка категорий */}
      {categories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="textSecondary">
            Категории не найдены
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={handleAddCategory}
            sx={{ mt: 2 }}
          >
            Добавить первую категорию
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <CategoryCard category={category} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог добавления/редактирования категории */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          fontWeight: 600
        }}>
          {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Название категории"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="slug"
            label="SLUG"
            fullWidth
            variant="outlined"
            value={formData.slug}
            onChange={handleInputChange}
            helperText="Уникальный идентификатор категории в URL"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCategory}
            sx={{ borderRadius: 2 }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCategories;