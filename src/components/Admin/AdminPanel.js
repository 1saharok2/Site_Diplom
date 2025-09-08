import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [productsRes, ordersRes] = await Promise.all([
        apiService.getAdminProducts(token),
        apiService.getAdminOrders(token)
      ]);
      
      setProducts(productsRes);
      setOrders(ordersRes);
    } catch (error) {
      console.error('Admin data fetch error:', error);
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await apiService.updateProduct(productId, updates, token);
      fetchAdminData(); // Обновляем данные
    } catch (error) {
      console.error('Update product error:', error);
    }
  };
};