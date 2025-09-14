// pages/Admin/Products/AdminProducts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Chip,
  IconButton,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  alpha,
  useTheme
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Delete,
  Edit,
  Visibility, // Добавляем иконку просмотра
  Image,
  Category,
  Inventory,
  LocalOffer,
  BrandingWatermark
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate для перехода к товару

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const theme = useTheme();
  const navigate = useNavigate(); // Хук для навигации

  const fetchCategories = async () => {
    try {
      const categoriesData = await adminService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const productsData = await adminService.getProducts();
      setProducts(productsData);
    } catch (error) {
      setError('Ошибка при загрузке товаров');
      showSnackbar('Ошибка при загрузке товаров', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterAndSortProducts = useCallback(() => {
    let filtered = products.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_slug === selectedCategory);
    }

    const sorted = filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'price' || sortField === 'stock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(sorted);
  }, [products, searchTerm, sortField, sortOrder, selectedCategory]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await adminService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        showSnackbar('Товар успешно удален', 'success');
      } catch (error) {
        showSnackbar('Ошибка при удалении товара', 'error');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setOpenDialog(true);
  };

  // Функция для просмотра товара
  const handleView = (product) => {
    // Переходим на страницу товара
    navigate(`/product/${product.id}`);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, formData);
        showSnackbar('Товар успешно обновлен', 'success');
      } else {
        await adminService.createProduct(formData);
        showSnackbar('Товар успешно создан', 'success');
      }
      fetchProducts();
      handleDialogClose();
    } catch (error) {
      showSnackbar('Ошибка при сохранении товара', 'error');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, ml: 0 }}>
      {/* Заголовок и кнопка добавления */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Управление товарами
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 0.8,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Добавить товар
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Панель поиска и фильтров */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Категория"
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            >
              <MenuItem value="all">Все категории</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.slug} value={category.slug}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Чипсы для быстрой сортировки */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<FilterList />}
            label="Сортировка:"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
          {[
            { field: 'name', label: 'По названию' },
            { field: 'price', label: 'По цене' },
            { field: 'stock', label: 'По количеству' },
            { field: 'createdAt', label: 'По дате' }
          ].map((sort) => (
            <Chip
              key={sort.field}
              label={`${sort.label} ${getSortIcon(sort.field)}`}
              onClick={() => handleSort(sort.field)}
              variant={sortField === sort.field ? 'filled' : 'outlined'}
              color={sortField === sort.field ? 'primary' : 'default'}
              clickable
            />
          ))}
        </Box>
      </Paper>

      {/* Статистика */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {products.length}
              </Typography>
              <Typography variant="body2">Всего товаров</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {filteredProducts.length}
              </Typography>
              <Typography variant="body2">Отфильтровано</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {products.filter(p => p.stock > 0).length}
              </Typography>
              <Typography variant="body2">В наличии</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {categories.length}
              </Typography>
              <Typography variant="body2">Категорий</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Таблица товаров */}
      <Paper sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        {filteredProducts.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Товары не найдены
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 750 }}> {/* Увеличиваем минимальную ширину для дополнительной кнопки */}
              {/* Заголовок таблицы */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: '60px 1fr 100px 80px 100px 140px', // Увеличиваем ширину колонки действий
                gap: 1,
                p: 1.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <Typography variant="subtitle2" fontWeight="bold">Изобр.</Typography>
                <Typography variant="subtitle2" fontWeight="bold">Товар</Typography>
                <Typography variant="subtitle2" fontWeight="bold">Цена</Typography>
                <Typography variant="subtitle2" fontWeight="bold">На складе</Typography>
                <Typography variant="subtitle2" fontWeight="bold">Категория</Typography>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ textAlign: 'center' }}>Действия</Typography>
              </Box>

              {/* Список товаров */}
              {filteredProducts.map((product) => (
                <Box
                  key={product.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 100px 80px 100px 140px', // Увеличиваем ширину колонки действий
                    gap: 1,
                    p: 1.5,
                    alignItems: 'center',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                >
                  {/* Изображение товара */}
                  <Box
                    component="img"
                    src={product.image_url || '/placeholder-product.jpg'}
                    alt={product.name}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1,
                      objectFit: 'cover',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />

                  {/* Название и бренд */}
                  <Box>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {product.brand}
                    </Typography>
                  </Box>

                  {/* Цена */}
                  <Typography variant="body2" fontWeight="bold">
                    {product.price} ₽
                  </Typography>

                  {/* Количество на складе */}
                  <Chip
                    label={product.stock}
                    size="small"
                    color={product.stock > 0 ? 'success' : 'error'}
                    variant={product.stock > 0 ? 'filled' : 'outlined'}
                  />

                  {/* Категория */}
                  <Chip
                    label={product.category_slug}
                    size="small"
                    variant="outlined"
                  />

                  {/* Действия - добавляем кнопку просмотра */}
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    <IconButton
                      size="small"
                      onClick={() => handleView(product)}
                      sx={{
                        color: 'info.main',
                        '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
                      }}
                      title="Просмотреть товар"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(product)}
                      sx={{
                        color: 'warning.main',
                        '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.1) }
                      }}
                      title="Редактировать товар"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(product.id)}
                      sx={{
                        color: 'error.main',
                        '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                      }}
                      title="Удалить товар"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Диалог редактирования/создания */}
      <ProductDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        product={editingProduct}
        categories={categories}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={handleCloseSnackbar}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ProductDialog остается без изменений
const ProductDialog = ({ open, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_slug: '',
    brand: '',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category_slug: product.category_slug || '',
        brand: product.brand || '',
        stock: product.stock || '',
        image_url: product.image_url || ''
      });
    } else {
      setFormData({
        name: '',
        price: '',
        description: '',
        category_slug: '',
        brand: '',
        stock: '',
        image_url: ''
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      images: formData.image_url ? [formData.image_url] : []
    };
    onSubmit(submitData);
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image_url: e.target.value });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          ml: 0
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontWeight: 'bold',
        p: 2
      }}>
        {product ? '✏️ Редактировать товар' : '➕ Добавить товар'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Название товара"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Цена"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOffer />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Бренд"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BrandingWatermark />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Количество на складе"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Категория"
                select
                value={formData.category_slug}
                onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Category />
                    </InputAdornment>
                  )
                }}
              >
                {categories.map(category => (
                  <MenuItem key={category.slug} value={category.slug}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL изображения"
                value={formData.image_url}
                onChange={handleImageChange}
                helperText="Введите URL основного изображения товара"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Image />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {formData.image_url && (
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Предпросмотр изображения:
                </Typography>
                <Box
                  component="img"
                  src={formData.image_url}
                  alt="Предпросмотр"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 1,
                    objectFit: 'contain',
                    border: '1px solid #ddd'
                  }}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 1 }}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" sx={{ borderRadius: 1 }}>
            {product ? 'Сохранить изменения' : 'Создать товар'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminProducts;