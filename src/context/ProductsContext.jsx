import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/api';

const ProductsContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories()
      ]);
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setError('');
    } catch (error) {
      setError('Ошибка загрузки данных');
      if (process.env.NODE_ENV === 'development') console.error('Fetch error:', error);
      // Устанавливаем пустые массивы при ошибке
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const getProductById = useCallback(async (id) => {
    try {
      const product = await apiService.getProduct(id);
      return product;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error fetching product:', error);
      throw error;
    }
  }, []);

  const getProductsByCategory = useCallback(async (categorySlug) => {
    try {
      const productsData = await apiService.getProductsByCategory(categorySlug);
      return productsData || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error fetching products by category:', error);
      return [];
    }
  }, []);

  const searchProducts = useCallback(async (query) => {
    try {
      const productsData = await apiService.searchProducts(query);
      return productsData || [];
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error searching products:', error);
      return [];
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchInitialData();
  }, [fetchInitialData]);

  const value = useMemo(() => ({
    // Данные
    products,
    categories,
    loading,
    error,
    
    // Методы
    getProductById,
    getProductsByCategory,
    searchProducts,
    refreshData
  }), [
    products,
    categories,
    loading,
    error,
    getProductById,
    getProductsByCategory,
    searchProducts,
    refreshData
  ]);

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};