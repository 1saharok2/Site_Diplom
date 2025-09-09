// src/pages/Admin/Categories/AdminCategories.jsx
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
  IconButton,
  Chip
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  Image as ImageIcon 
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await adminService.getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      setError('Ошибка при загрузке категорий');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Удалить категорию? Все товары в этой категории будут без категории.')) {
      try {
        await adminService.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
        setSuccess('Категория удалена');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Ошибка при удалении категории');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
        setSuccess('Категория обновлена');
      } else {
        await adminService.createCategory(formData);
        setSuccess('Категория создана');
      }
      fetchCategories();
      handleDialogClose();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Ошибка при сохранении категории');
    }
  };

  const getProductCountText = (count) => {
    if (count === 0) return 'нет товаров';
    if (count === 1) return '1 товар';
    if (count < 5) return `${count} товара`;
    return `${count} товаров`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Управление категориями
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreate}
          sx={{ minWidth: '200px' }}
        >
          Создать категорию
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }} 
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      <Paper elevation={3}>
        <Box p={3}>
          {categories.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Категорий пока нет
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Создайте первую категорию для вашего магазина
              </Typography>
            </Box>
          ) : (
            <Box display="grid" gap={2}>
              {categories.map((category) => (
                <Box
                  key={category.id}
                  sx={{
                    p: 3,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: 2,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={3}>
                    {category.image_url && (
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          overflow: 'hidden',
                          backgroundColor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img
                          src={category.image_url}
                          alt={category.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <ImageIcon 
                          sx={{ 
                            display: category.image_url ? 'none' : 'block',
                            color: 'grey.400',
                            fontSize: 32
                          }} 
                        />
                      </Box>
                    )}
                    
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Slug: {category.slug}
                      </Typography>
                      {category.description && (
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {category.description}
                        </Typography>
                      )}
                      <Chip
                        label={getProductCountText(category.product_count || 0)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Box display="flex" gap={1}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(category)}
                      title="Редактировать"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(category.id)}
                      title="Удалить"
                      disabled={category.product_count > 0}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      <CategoryDialog
        open={openDialog}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        category={editingCategory}
      />
    </Box>
  );
};

const CategoryDialog = ({ open, onClose, onSubmit, category }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image_url: category.image_url || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        image_url: ''
      });
    }
    setErrors({});
  }, [category, open]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug обязателен';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug может содержать только латинские буквы, цифры и дефисы';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {category ? 'Редактировать категорию' : 'Создать категорию'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Название категории *"
            value={formData.name}
            onChange={handleNameChange}
            margin="normal"
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          
          <TextField
            fullWidth
            label="Slug *"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            margin="normal"
            error={!!errors.slug}
            helperText={errors.slug || 'Уникальный идентификатор для URL'}
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
            helperText="Необязательное описание категории"
          />
          
          <TextField
            fullWidth
            label="URL изображения"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            margin="normal"
            helperText="Ссылка на изображение категории"
          />
          
          {formData.image_url && (
            <Box mt={2} textAlign="center">
              <img
                src={formData.image_url}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">
            Отмена
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
          >
            {category ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminCategories;