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
  Select,
  IconButton,
  Paper,
  alpha,
  Fade,
  useMediaQuery
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Smartphone,
  Laptop,
  Headphones,
  DevicesOther,
  VideogameAsset,
  CameraAlt,
  Refresh,
  Category,
  AutoAwesome,
  TrendingUp
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

// ... (Функции getCategoryIcon и getCategoryColor оставляем без изменений)
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Смартфоны': <Smartphone sx={{ fontSize: 28 }} />,
    'Ноутбуки': <Laptop sx={{ fontSize: 28 }} />,
    'Наушники': <Headphones sx={{ fontSize: 28 }} />,
    'Бытовая техника': <DevicesOther sx={{ fontSize: 28 }} />,
    'Игровые консоли': <VideogameAsset sx={{ fontSize: 28 }} />,
    'Фототехника': <CameraAlt sx={{ fontSize: 28 }} />,
    'Компьютеры': <Laptop sx={{ fontSize: 28 }} />,
    'Аксессуары': <DevicesOther sx={{ fontSize: 28 }}/>
  };
  
  return iconMap[categoryName] || <Category sx={{ fontSize: 28 }} />;
};

const getCategoryColor = (categoryName, theme) => {
  const colorMap = {
    'Смартфоны': '#6366f1',
    'Ноутбуки': '#10b981',
    'Наушники': '#f59e0b',
    'Бытовая техника': '#ef4444',
    'Игровые консоли': '#8b5cf6',
    'Фототехника': '#06b6d4',
    'Компьютеры': '#3b82f6',
    'Аксессуары': '#64748b'
  };
  
  return colorMap[categoryName] || theme.palette.primary.main;
};

// ... (CategoryCard оставляем без изменений, он адаптивен благодаря Grid)
const CategoryCard = ({ category, onEdit, onDelete, theme }) => {
  const color = getCategoryColor(category.name, theme);
  
  return (
    <Fade in timeout={500}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${alpha(color, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.03)} 0%, ${alpha(color, 0.08)} 100%)`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 20px 40px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.3)
        }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 140,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.2)} 0%, transparent 70%)`
          }} />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.4)} 100%)`,
            color: color,
            position: 'relative',
            zIndex: 1,
            backdropFilter: 'blur(10px)'
          }}>
            {getCategoryIcon(category.name)}
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, p: 3, pt: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontWeight: 700,
            background: `linear-gradient(135deg, ${color} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            minHeight: '64px', // Фиксируем высоту заголовка для выравнивания
            display: 'flex',
            alignItems: 'center'
          }}>
            {category.name}
          </Typography>
          
          {category.parent_id && (
            <Chip 
              label="Подкатегория"
              size="small"
              variant="outlined"
              sx={{ 
                backgroundColor: `${theme.palette.secondary.main}08`,
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
                fontWeight: 600,
                mb: 2
              }}
            />
          )}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 2,
            p: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Box sx={{ overflow: 'hidden', maxWidth: '60%' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                SLUG:
              </Typography>
              <Typography variant="body2" noWrap sx={{ 
                fontFamily: 'monospace', 
                fontWeight: 600,
                color: theme.palette.text.primary
              }} title={category.slug}>
                {category.slug}
              </Typography>
            </Box>
            
            {category.products_count !== undefined && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Товаров
                </Typography>
                <Typography variant="h6" sx={{ 
                  fontWeight: 800,
                  color: color,
                  lineHeight: 1
                }}>
                  {category.products_count}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
        
        <Box sx={{ p: 2, pt: 0 }}>
          <Divider sx={{ mb: 2, opacity: 0.5 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => onEdit(category)}
              sx={{ 
                flex: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
              title="Редактировать"
            >
              <Edit />
            </IconButton>
            <IconButton
              onClick={() => onDelete(category.id)}
              sx={{ 
                flex: 1,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: theme.palette.error.main,
                  color: 'white',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
              title="Удалить"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </Card>
    </Fade>
  );
};

const AdminCategories = () => {
  const theme = useTheme();
  // Хук для определения размера экрана
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  const [saveLoading, setSaveLoading] = useState(false);

  // ... (Остальные функции fetchCategories, handleAddCategory и т.д. без изменений)
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await adminService.getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      setError('Не удалось загрузить категории. Проверьте подключение к серверу.');
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
        console.error('Ошибка удаления категории:', err);
        setError(err.response?.data?.message || 'Не удалось удалить категорию. Возможно, в ней есть товары.');
      }
    }
  };

  const handleSaveCategory = async () => {
    try {
      setSaveLoading(true);
      setError(null);

      if (!formData.name.trim() || !formData.slug.trim()) {
        throw new Error('Название и slug категории обязательны для заполнения');
      }

      const categoryData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        parent_id: formData.parent_id || null
      };

      let savedCategory;
      
      if (editingCategory) {
        savedCategory = await adminService.updateCategory(editingCategory.id, categoryData);
        setCategories(categories.map(c => 
          c.id === editingCategory.id ? { ...c, ...savedCategory } : c
        ));
      } else {
        savedCategory = await adminService.createCategory(categoryData);
        setCategories([...categories, savedCategory]);
      }
      
      setOpenDialog(false);
    } catch (err) {
      console.error('Ошибка сохранения категории:', err);
      setError(err.response?.data?.message || err.message || 'Не удалось сохранить категорию. Проверьте данные и попробуйте снова.');
    } finally {
      setSaveLoading(false);
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

  const totalProducts = categories.reduce((sum, cat) => sum + (cat.products_count || 0), 0);
  const mainCategories = categories.filter(cat => !cat.parent_id).length;
  const subCategories = categories.filter(cat => cat.parent_id).length;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Загрузка категорий...
        </Typography>
      </Box>
    );
  }

  return (
    // Уменьшил padding по вертикали на мобильных
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      
      {/* HEADER CARD */}
      <Paper sx={{ 
        p: { xs: 3, md: 4 }, // Адаптивный padding
        mb: 4,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
          <Category sx={{ fontSize: 200 }} />
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, // Колонка на мобильных
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, // Выравнивание
          position: 'relative',
          gap: { xs: 3, md: 0 } // Отступ между блоками на мобильных
        }}>
          <Box>
            <Typography variant={isMobile ? "h4" : "h3"} gutterBottom sx={{ fontWeight: 800 }}>
              Управление категориями
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Создавайте и редактируйте категории товаров
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            textAlign: { xs: 'left', md: 'center' },
            width: { xs: '100%', md: 'auto' },
            justifyContent: { xs: 'space-around', md: 'flex-end' } // Растягиваем статистику на мобильных
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {categories.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Всего категорий
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {totalProducts}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Всего товаров
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* CONTROLS PANEL */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, // Колонка на мобильных
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'center' }, // Растянуть на мобильных
        mb: 4,
        gap: { xs: 2, md: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, // Кнопки в колонку на очень маленьких экранах
          gap: 2 
        }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCategory}
            fullWidth={isMobile} // На всю ширину на мобильных
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Новая категория
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchCategories}
            fullWidth={isMobile}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2
              }
            }}
          >
            Обновить
          </Button>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexWrap: 'wrap', // Разрешить перенос чипов
          justifyContent: { xs: 'flex-start', md: 'flex-end' }
        }}>
          <Chip
            icon={<Category />}
            label={`Основные: ${mainCategories}`}
            variant="outlined"
            color="primary"
            sx={{ flexGrow: { xs: 1, sm: 0 } }} // Растягивать на очень маленьких экранах
          />
          <Chip
            icon={<TrendingUp />}
            label={`Подкатегории: ${subCategories}`}
            variant="outlined"
            color="secondary"
            sx={{ flexGrow: { xs: 1, sm: 0 } }}
          />
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setError(null)}>
              Скрыть
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Сетка категорий */}
      {categories.length === 0 ? (
        <Paper sx={{ 
          p: { xs: 4, md: 8 }, 
          textAlign: 'center',
          borderRadius: 3,
          background: alpha(theme.palette.background.paper, 0.5)
        }}>
          <AutoAwesome sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            Категорий пока нет
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Создайте первую категорию чтобы начать работу
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCategory}
            size="large"
            sx={{ borderRadius: 3 }}
          >
            Создать категорию
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, md: 3 }}> {/* Уменьшенный spacing на мобильных */}
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
              <CategoryCard 
                category={category} 
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                theme={theme}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог редактирования */}
      <Dialog 
        open={openDialog} 
        onClose={() => !saveLoading && setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        // Делаем диалог на весь экран на очень маленьких устройствах, если нужно
        // fullScreen={isMobile} // Раскомментируйте, если хотите fullScreen на мобильных
        PaperProps={{ 
          sx: { 
            borderRadius: { xs: 0, sm: 3 }, // Убираем скругление в fullScreen режиме
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            m: { xs: 1, sm: 2 } // Отступы самого диалога от краев экрана
          } 
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 700,
          textAlign: 'center',
          py: 2
        }}>
          {editingCategory ? '✏️ Редактирование' : '➕ Новая категория'}
        </DialogTitle>
        
        <DialogContent sx={{ p: { xs: 2, sm: 4 }, mt: 2 }}>
          <TextField
            autoFocus
            name="name"
            label="Название категории *"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            onBlur={generateSlugFromName}
            sx={{ mb: 3, mt: 1 }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
            error={!formData.name.trim()}
            helperText={!formData.name.trim() ? 'Обязательное поле' : ''}
          />
          
          <TextField
            name="slug"
            label="SLUG *"
            fullWidth
            value={formData.slug}
            onChange={handleInputChange}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
            error={!formData.slug.trim()}
            helperText={!formData.slug.trim() ? 'Обязательное поле' : 'Уникальный идентификатор'}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Родительская категория</InputLabel>
            <Select
              name="parent_id"
              value={formData.parent_id || ''}
              onChange={handleInputChange}
              label="Родительская категория"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Без родительской категории</MenuItem>
              {categories
                .filter(cat => !cat.parent_id && cat.id !== editingCategory?.id)
                .map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            disabled={saveLoading}
            fullWidth={isMobile}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCategory}
            disabled={saveLoading || !formData.name.trim() || !formData.slug.trim()}
            fullWidth={isMobile}
            sx={{ 
              borderRadius: 2, 
              px: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              position: 'relative'
            }}
          >
            {saveLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : editingCategory ? (
              'Сохранить'
            ) : (
              'Создать'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCategories;