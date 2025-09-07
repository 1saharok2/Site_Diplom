// pages/Admin/Products/ProductCreate.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ProductForm from '../../../components/Admin/Products/ProductForm';
import { useCreateProduct } from '../../../hooks/useAdminProducts';

const ProductCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { createProduct, loading } = useCreateProduct();

  const handleSubmit = async (formData) => {
    try {
      await createProduct(formData);
      enqueueSnackbar('Товар успешно создан', { variant: 'success' });
      navigate('/admin/products');
    } catch (error) {
      enqueueSnackbar('Ошибка при создании товара', { variant: 'error' });
    }
  };

  return (
    <div>
      <h1>Создание товара</h1>
      <ProductForm 
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default ProductCreate;