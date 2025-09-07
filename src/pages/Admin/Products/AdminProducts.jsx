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
  Chip
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import ProductTable from '../../../components/Admin/Products/ProductTable';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await adminService.getProducts();
      setProducts(response.data);
    } catch (error) {
      setError('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await adminService.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
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

  const handleSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, formData);
      } else {
        await adminService.createProduct(formData);
      }
      fetchProducts();
      handleDialogClose();
    } catch (error) {
      setError('Ошибка при сохранении товара');
    }
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
      />
    </Box>
  );
};

const ProductDialog = ({ open, onClose, onSubmit, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        description: product.description || '',
        category: product.category || '',
        stock: product.stock || '',
        image: product.image || ''
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
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            margin="normal"
          >
            <MenuItem value="smartphones">Смартфоны</MenuItem>
            <MenuItem value="laptops">Ноутбуки</MenuItem>
            <MenuItem value="headphones">Наушники</MenuItem>
            <MenuItem value="accessories">Аксессуары</MenuItem>
          </TextField>
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
            label="URL изображения"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            margin="normal"
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