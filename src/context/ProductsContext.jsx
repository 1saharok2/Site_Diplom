import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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
      console.error('Fetch error:', error);
      // Устанавливаем пустые массивы при ошибке
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductById = async (id) => {
    try {
      const product = await apiService.getProduct(id);
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  };

  const getProductsByCategory = async (categorySlug) => {
    try {
      const productsData = await apiService.getProductsByCategory(categorySlug);
      return productsData || [];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  };

  const searchProducts = async (query) => {
    try {
      const productsData = await apiService.searchProducts(query);
      return productsData || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  const refreshData = async () => {
    await fetchInitialData();
  };

  const value = {
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
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};