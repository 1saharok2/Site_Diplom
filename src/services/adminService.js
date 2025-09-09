import { apiService } from './api';

const API_BASE = 'http://localhost:5000/api';

export const adminService = {
  // Products
  getProducts: () => 
    fetch(`${API_BASE}/admin/products`).then(res => res.json()),

  createProduct: (productData) =>
    fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    }).then(res => res.json()),

  updateProduct: (id, productData) =>
    fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    }).then(res => res.json()),

  deleteProduct: (id) =>
    fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),

  // Orders
  getOrders: async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders`);
      if (!response.ok) throw new Error('Ошибка загрузки заказов');
      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Ошибка обновления статуса');
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Categories
  getCategories: () => apiService.getCategories(),

  // Users
  getUsers: () =>
    fetch(`${API_BASE}/admin/users`).then(res => res.json())
};