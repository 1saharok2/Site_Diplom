// components/Admin/Products/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Typography
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import ImageUpload from '../Common/ImageUpload';

// Схема валидации
const productSchema = yup.object({
  name: yup.string().required('Название товара обязательно'),
  description: yup.string().required('Описание обязательно'),
  price: yup.number()
    .typeError('Цена должна быть числом')
    .positive('Цена должна быть положительной')
    .required('Цена обязательна'),
  oldPrice: yup.number()
    .typeError('Старая цена должна быть числом')
    .positive('Старая цена должна быть положительной')
    .nullable(),
  categoryId: yup.string().required('Категория обязательна'),
  stock: yup.number()
    .typeError('Количество должно быть числом')
    .integer('Количество должно быть целым числом')
    .min(0, 'Количество не может быть отрицательным')
    .required('Количество обязательно'),
  sku: yup.string().required('Артикул обязателен'),
  weight: yup.number()
    .typeError('Вес должен быть числом')
    .positive('Вес должен быть положительным')
    .nullable(),
  dimensions: yup.object({
    length: yup.number().positive().nullable(),
    width: yup.number().positive().nullable(),
    height: yup.number().positive().nullable()
  }),
  isActive: yup.boolean().default(true),
  isFeatured: yup.boolean().default(false)
});

const ProductForm = ({ 
  product = null, 
  onSubmit, 
  categories = [], 
  loading = false 
}) => {
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      oldPrice: null,
      categoryId: '',
      stock: 0,
      sku: '',
      weight: null,
      dimensions: {
        length: null,
        width: null,
        height: null
      },
      isActive: true,
      isFeatured: false
    }
  });

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        oldPrice: product.oldPrice || null,
        categoryId: product.categoryId || '',
        stock: product.stock || 0,
        sku: product.sku || '',
        weight: product.weight || null,
        dimensions: product.dimensions || {
          length: null,
          width: null,
          height: null
        },
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured || false
      });

      if (product.images) {
        setExistingImages(product.images);
      }
    }
  }, [product, reset]);

  // Обработчик загрузки изображений
  const handleImageUpload = (files) => {
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  // Удаление изображения
  const handleImageRemove = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Основной обработчик отправки формы
  const handleFormSubmit = async (data) => {
    try {
      // Создаем FormData для отправки файлов
      const formData = new FormData();

      // Добавляем текстовые поля
      Object.keys(data).forEach(key => {
        if (key === 'dimensions') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });

      // Добавляем новые изображения
      images.forEach(image => {
        formData.append('images', image.file);
      });

      // Добавляем информацию о существующих изображениях
      formData.append('existingImages', JSON.stringify(existingImages));

      // Вызываем переданный обработчик
      await onSubmit(formData);

      // Сбрасываем изображения после успешной отправки
      if (!product) {
        setImages([]);
        setExistingImages([]);
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
    }
  };

  // Обработчик отмены
  const handleCancel = () => {
    if (product) {
      reset();
      setImages([]);
      setExistingImages(product.images || []);
    } else {
      reset();
      setImages([]);
      setExistingImages([]);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Основная информация
          </Typography>

          <TextField
            fullWidth
            label="Название товара"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Описание"
            multiline
            rows={4}
            {...register('description')}
            error={!!errors.description}
            helperText={errors.description?.message}
            margin="normal"
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Цена"
                type="number"
                {...register('price')}
                error={!!errors.price}
                helperText={errors.price?.message}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Старая цена"
                type="number"
                {...register('oldPrice')}
                error={!!errors.oldPrice}
                helperText={errors.oldPrice?.message}
                margin="normal"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Количество на складе"
                type="number"
                {...register('stock')}
                error={!!errors.stock}
                helperText={errors.stock?.message}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Артикул (SKU)"
                {...register('sku')}
                error={!!errors.sku}
                helperText={errors.sku?.message}
                margin="normal"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Боковая панель */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Дополнительно
          </Typography>

          <FormControl fullWidth error={!!errors.categoryId} margin="normal">
            <InputLabel>Категория</InputLabel>
            <Select
              {...register('categoryId')}
              label="Категория"
            >
              {categories.map(category => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.categoryId?.message}</FormHelperText>
          </FormControl>

          <TextField
            fullWidth
            label="Вес (кг)"
            type="number"
            {...register('weight')}
            error={!!errors.weight}
            helperText={errors.weight?.message}
            margin="normal"
          />

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Габариты (см)
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Длина"
                type="number"
                {...register('dimensions.length')}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Ширина"
                type="number"
                {...register('dimensions.width')}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Высота"
                type="number"
                {...register('dimensions.height')}
                margin="normal"
                size="small"
              />
            </Grid>
          </Grid>

          <FormControl fullWidth margin="normal">
            <Button
              variant={watch('isActive') ? 'contained' : 'outlined'}
              color={watch('isActive') ? 'success' : 'inherit'}
              onClick={() => setValue('isActive', !watch('isActive'))}
            >
              {watch('isActive') ? 'Активный' : 'Неактивный'}
            </Button>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <Button
              variant={watch('isFeatured') ? 'contained' : 'outlined'}
              color={watch('isFeatured') ? 'primary' : 'inherit'}
              onClick={() => setValue('isFeatured', !watch('isFeatured'))}
            >
              {watch('isFeatured') ? 'Рекомендуемый' : 'Обычный'}
            </Button>
          </FormControl>
        </Grid>

        {/* Изображения */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Изображения товара
          </Typography>
          
          <ImageUpload
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            images={images}
            existingImages={existingImages}
          />
        </Grid>

        {/* Кнопки действий */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Сохранение...' : (product ? 'Обновить' : 'Создать')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductForm;