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
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Smartphone,
  Laptop,
  Headphones,
  DevicesOther,
  //Television,
  VideogameAsset,
  CameraAlt
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

// Функция для получения иконки по названию категории
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Смартфоны': <Smartphone />,
    'Ноутбуки': <Laptop />,
    'Наушники': <Headphones />,
    'Бытовая техника': <DevicesOther />,
    //'Телевизоры': <Television />,
    'Игровые консоли': <VideogameAsset />,
    'Фототехника': <CameraAlt />,
    'Компьютеры': <Laptop />,
    'Аксессуары': <DevicesOther />
  };
  
  return iconMap[categoryName] || <DevicesOther />;
};

const getCategoryColor = (categoryName, theme) => {
  const colorMap = {
    'Смартфоны': theme.palette.primary.main,
    'Ноутбуки': theme.palette.secondary.main,
    'Наушники': theme.palette.success.main,
    'Бытовая техника': theme.palette.warning.main,
    //'Телевизоры': theme.palette.info.main,
    'Игровые консоли': theme.palette.error.main,
    'Фототехника': theme.palette.grey[600]
  };
  
  return colorMap[categoryName] || theme.palette.info.main;
};

const CategoryCard = ({ category, onEdit, onDelete, theme }) => (
  <Card sx={{ 
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4],
      borderColor: getCategoryColor(category.name, theme)
    }
  }}>
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: 120,
      backgroundColor: `${getCategoryColor(category.name, theme)}15`,
      color: getCategoryColor(category.name, theme)
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: `${getCategoryColor(category.name, theme)}20`,
        fontSize: 32
      }}>
        {getCategoryIcon(category.name)}
      </Box>
    </Box>
    
    <CardContent sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        {category.name}
      </Typography>
      
      {category.parent_id && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            label={`Подкатегория`}
            size="small"
            variant="outlined"
            sx={{ 
              backgroundColor: `${theme.palette.secondary.main}08`,
              borderColor: theme.palette.secondary.main,
              color: theme.palette.secondary.main,
              fontWeight: 500
            }}
          />
        </Box>
      )}
      
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

      {category.products_count !== undefined && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Товаров:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {category.products_count}
          </Typography>
        </Box>
      )}
    </CardContent>
    
    <Box sx={{ p: 2, pt: 0 }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => onEdit(category)}
          sx={{ flex: 1 }}
        >
          Редактировать
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={() => onDelete(category.id)}
          sx={{ flex: 1 }}
        >
          Удалить
        </Button>
      </Box>
    </Box>
  </Card>
);

const AdminCategories = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    parent_id: '' 
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Загрузка категорий...');
      const categoriesData = await adminService.getCategories();
      console.log('✅ Получены категории:', categoriesData);
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
    } catch (err) {
      console.error('❌ Ошибка загрузки категорий:', err);
      setError('Не удалось загрузить категории. Проверьте подключение к серверу.');
      
      // Показываем демо-данные при ошибке
      const demoCategories = [
        { id: 1, name: 'Бытовая техника', slug: 'appliances', parent_id: null, products_count: 15 },
        { id: 2, name: 'Игровые консоли', slug: 'gaming-consoles', parent_id: null, products_count: 8 },
        { id: 3, name: 'Наушники', slug: 'headphones', parent_id: 1, products_count: 23 },
        { id: 4, name: 'Ноутбуки', slug: 'laptops', parent_id: null, products_count: 34 },
        { id: 5, name: 'Смартфоны', slug: 'smartphones', parent_id: 1, products_count: 45 },
        { id: 6, name: 'Телевизоры', slug: 'tvs', parent_id: 1, products_count: 18 },
        { id: 7, name: 'Фототехника', slug: 'photo-equipment', parent_id: null, products_count: 12 }
      ];
      setCategories(demoCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setFormData({ name: '', slug: '', parent_id: '' });
    setEditingCategory(null);
    setOpenDialog(true);
  };

  const handleEditCategory = (category) => {
    setFormData({ 
      name: category.name, 
      slug: category.slug, 
      parent_id: category.parent_id || '' 
    });
    setEditingCategory(category);
    setOpenDialog(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      try {
        await adminService.deleteCategory(categoryId);
        setCategories(categories.filter(c => c.id !== categoryId));
        setError(null);
      } catch (err) {
        console.error('❌ Ошибка удаления категории:', err);
        setError('Не удалось удалить категорию. Возможно, в ней есть товары.');
      }
    }
  };

  const handleSaveCategory = async () => {
    try {
      let savedCategory;
      
      if (editingCategory) {
        savedCategory = await adminService.updateCategory(editingCategory.id, {
          ...formData,
          parent_id: formData.parent_id || null
        });
        setCategories(categories.map(c => 
          c.id === editingCategory.id ? savedCategory : c
        ));
      } else {
        savedCategory = await adminService.createCategory({
          ...formData,
          parent_id: formData.parent_id || null
        });
        setCategories([...categories, savedCategory]);
      }
      
      setOpenDialog(false);
      setError(null);
    } catch (err) {
      console.error('❌ Ошибка сохранения категории:', err);
      setError('Не удалось сохранить категорию. Проверьте данные и попробуйте снова.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'parent_id' ? (value === '' ? null : parseInt(value)) : value 
    }));
  };

  const generateSlugFromName = () => {
    if (!formData.name) return;
    const slug = formData.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Загрузка категорий...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <CategoryCard 
              category={category} 
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              theme={theme}
            />
          </Grid>
        ))}
      </Grid>

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
            label="Название категории *"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={generateSlugFromName}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="slug"
            label="SLUG *"
            fullWidth
            variant="outlined"
            value={formData.slug}
            onChange={handleInputChange}
            helperText="Уникальный идентификатор категории в URL"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth variant="outlined" margin="dense">
            <InputLabel>Родительская категория</InputLabel>
            <Select
              name="parent_id"
              value={formData.parent_id || ''}
              onChange={handleInputChange}
              label="Родительская категория"
            >
              <MenuItem value="">Без родительской категории</MenuItem>
              {categories
                .filter(cat => !cat.parent_id)
                .map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
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
            disabled={!formData.name || !formData.slug}
            sx={{ borderRadius: 2 }}
          >
            {editingCategory ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCategories;