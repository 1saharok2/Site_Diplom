import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const CategoriesContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ПЕРЕМЕСТИТЕ ФУНКЦИЮ ВНУТРЬ КОМПОНЕНТА
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories();
      setCategories(response || []); // Убрали .data - теперь response это массив категорий
      setError(null);
    } catch (err) {
      setError(err.message);
      setCategories([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refreshCategories = () => {
    fetchCategories();
  };

  const value = {
    categories,
    loading,
    error,
    refreshCategories
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};