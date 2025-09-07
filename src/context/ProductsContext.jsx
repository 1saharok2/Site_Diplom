// context/ProductsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { productService } from '../services/productService';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: '',
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (params = {}) => {
    try {
      setLoading(true);
      const response = await productService.getProducts(params);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = async (id) => {
    try {
      const response = await productService.getProduct(id);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const searchProducts = async (searchTerm) => {
    try {
      setLoading(true);
      const response = await productService.searchProducts(searchTerm);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = async (category) => {
    try {
      setLoading(true);
      const response = await productService.getProductsByCategory(category);
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPopularProducts = async () => {
    try {
      const response = await productService.getPopularProducts();
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const value = {
    products,
    loading,
    error,
    filters,
    fetchProducts,
    getProduct,
    searchProducts,
    filterByCategory,
    getPopularProducts,
    setFilters
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};