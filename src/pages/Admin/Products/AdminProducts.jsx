import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import ProductTable from '../../../components/Admin/Products/ProductTable';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Товары</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/products/create')}
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
          onEdit={(product) => navigate(`/admin/products/edit/${product.id}`)}
          onDelete={handleDelete}
          onView={(product) => navigate(`/admin/products/${product.id}`)}
        />
      </Paper>
    </Box>
  );
};

export default AdminProducts;