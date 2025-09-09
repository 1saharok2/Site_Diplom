// pages/Admin/Products/AdminProducts.jsx
import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import ProductTable from '../../../components/Admin/Products/ProductTable';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // ← ДОБАВЬТЕ ЭТО
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // ← ДОБАВЬТЕ ВЫЗОВ ФУНКЦИИ
  }, []);

  const fetchProducts = async () => {
    try {
      const products = await adminService.getProducts();
      setProducts(products);
      setLoading(false);
    } catch (error) {
      setError('Ошибка при загрузке товаров');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await adminService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await adminService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        showSnackbar('Товар удален'); // ← ПЕРЕМЕСТИТЕ СЮДА
      } catch (error) {
        setError('Ошибка при удалении товара');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const showSnackbar = (message) => {
    setSnackbar({ open: true, message });
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, formData);
        showSnackbar('Товар обновлен'); // ← ПЕРЕМЕСТИТЕ СЮДА
      } else {
        await adminService.createProduct(formData);
        showSnackbar('Товар создан'); // ← ПЕРЕМЕСТИТЕ СЮДА
      }
      fetchProducts();
      handleDialogClose();
    } catch (error) {
      setError('Ошибка при сохранении товара');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Товары</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
        >
          Добавить товар
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper>
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={(product) => navigate(`/admin/products/${product.id}`)}
        />
      </Paper>

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
        message={snackbar.message}
      />
    </Box>
  );
};

const ProductDialog = ({ open, onClose, onSubmit, product, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category_slug: '',
    brand: '',
    stock: '',
    images: []
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
        images: product.images || []
      });
    } else {
      setFormData({
        name: '',
        price: '',
        description: '',
        category_slug: '',
        brand: '',
        stock: '',
        images: []
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? 'Редактировать товар' : 'Добавить товар'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Цена"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Описание"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Категория"
            select
            value={formData.category_slug}
            onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
            margin="normal"
          >
            {categories.map(category => (
              <MenuItem key={category.slug} value={category.slug}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Бренд"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Количество на складе"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="URL изображений (через запятую)"
            value={formData.images.join(', ')}
            onChange={(e) => setFormData({ 
              ...formData, 
              images: e.target.value.split(',').map(url => url.trim()).filter(url => url) 
            })}
            margin="normal"
            helperText="Введите URL изображений через запятую"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Отмена</Button>
          <Button type="submit" variant="contained">
            {product ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminProducts;